import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, map, startWith } from 'rxjs';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { ColorPicker } from 'src/app/ui-components/color-picker/color-picker';
import { DragDropUpload } from 'src/app/ui-components/drag-drop-upload/drag-drop-upload';
import { LottiePreviewComponent } from 'src/app/ui-components/lottie-preview/lottie-preview';
import { HeaderBannerList } from './header-banner-list/header-banner-list';
import {
  AdminHeaderBannerCityInterface,
  AdminHeaderBannerHistoryInterface,
  AdminHeaderBannerListInterface,
  AdminHeaderBannerLottieAlignment,
  AdminHeaderBannerLottieFit,
  HEADER_BANNER_ASPECT_RATIO_MAX,
  HEADER_BANNER_ASPECT_RATIO_MIN,
  HEADER_BANNER_COLLAPSED_DEFAULT,
  HEADER_BANNER_COLLAPSED_MAX,
  HEADER_BANNER_COLLAPSED_MIN,
  HEADER_BANNER_DEFAULT_BACKGROUND_COLOR,
  HEADER_BANNER_DEFAULT_GRADIENT_FROM,
  HEADER_BANNER_DEFAULT_GRADIENT_TO,
  HEADER_BANNER_HEIGHT_DEFAULT,
  HEADER_BANNER_HEIGHT_MAX,
  HEADER_BANNER_HEIGHT_MIN,
  HEADER_BANNER_HORIZONTAL_ASPECT_RATIO,
  HEADER_BANNER_MEDIA_SCALE_DEFAULT,
  HEADER_BANNER_MEDIA_SCALE_MAX,
  HEADER_BANNER_MEDIA_SCALE_MIN,
  HEADER_BANNER_REFERENCE_WIDTH,
  HEADER_BANNER_SEARCH_BAR_HEIGHT,
  HEADER_BANNER_VERTICAL_ASPECT_RATIO,
} from 'src/app/interfaces/admin.header.banner.interface';
import { AdminCitiesListLimitedInterface } from 'src/app/interfaces/admin.cities.list.limited.interface';
import {
  AdminHeaderBannerCtaAnimation,
  AdminHeaderBannerCtaAnimationGroup,
  AdminHeaderBannerCtaLookupKind,
  AdminHeaderBannerCtaOptionInterface,
  AdminHeaderBannerCtaPreset,
  AdminHeaderBannerCtaStyle,
  AdminHeaderBannerDragLayer,
  ctaAnimationIsLoopable,
  HEADER_BANNER_CTA_ANIMATION_GROUPS_LISTED,
  HEADER_BANNER_CTA_ANIMATIONS_LIST,
  HEADER_BANNER_CTA_FALLBACK_BACKGROUND,
  HEADER_BANNER_CTA_FALLBACK_TEXT,
  HEADER_BANNER_CTA_PRESETS,
} from 'src/app/interfaces/admin.header.banner.interface';

/**
 * Promotions → Header Banner: "Header & Promotional Banner Configuration".
 *
 * Nine tabs — a `Banners` list plus the eight from the design boards. The config tabs
 * bind to whichever banner is selected, so one page covers list, author, preview and
 * publish without a second screen.
 *
 * Persistence is two-phase, matching the backend module: `Save Draft` writes an
 * unpublished working copy that customers can never see, and `Publish` promotes it to
 * the live collection inside a transaction.
 */
@Component({
  selector: 'app-header-banner',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, ColorPicker, DragDropUpload, LottiePreviewComponent, HeaderBannerList],
  templateUrl: './header-banner.html',
})
export class HeaderBanner implements OnInit {
  @ViewChild(HeaderBannerList) bannerList?: HeaderBannerList;

  tabIndex = 0;

  selected: AdminHeaderBannerListInterface | null = null;
  draftId: string | null = null;
  history: AdminHeaderBannerHistoryInterface[] = [];

  isLoading = false;
  isSubmit = false;
  haveSubmitClicked = false;
  draftDirty = false;
  draftSavedAt: Date | null = null;
  statusChip: { label: string; active: boolean } = { label: 'inactive', active: false };

  // Live preview device frame.
  previewDevice: 'phone' | 'large' | 'tablet' = 'phone';
  previewState: 'expanded' | 'collapsed' | 'pull' = 'expanded';

  previewDevices = [
    { key: 'phone', label: 'Phone (360px)' },
    { key: 'large', label: 'Large Phone (414px)' },
    { key: 'tablet', label: 'Tablet (768px)' },
  ] as const;

  languages: any[] = [];

  /** Drag state for placing the banner media by dragging it in the preview. */
  private dragStartX: number | null = null;
  private dragStartY: number | null = null;
  private dragOriginX = 0;
  private dragOriginY = 0;
  private dragFrameWidth = 0;
  private dragFrameHeight = 0;
  /**
   * Which layer the in-flight drag is moving.
   *
   * One set of pointer state serves all three draggable layers rather than a copy per
   * layer: only one can be grabbed at a time, and a single `dragLayer` discriminator is
   * what makes "is this the media?" answerable by the template's highlight bindings.
   */
  private dragLayer: AdminHeaderBannerDragLayer = null;

  /**
   * Drag state for resizing the header by its handles in the preview.
   *
   * `banner` drives the promotional banner height, `header` the silver app bar's
   * collapsed height. Only one edge can be dragged at a time, so a single target
   * plus a single origin is enough - and two simultaneous drags would fight over
   * the same two numbers anyway.
   */
  resizeTarget: 'banner' | 'header' | null = null;
  private resizeStartY: number | null = null;
  private resizeOrigin = 0;

  /**
   * Drag state for the media zoom rail.
   *
   * Separate from the vertical resize above: this one is horizontal, it drives a
   * different number, and its rail sits outside the phone frame so the two
   * gestures never share an element or a coordinate axis.
   */
  private zoomStartX: number | null = null;
  private zoomOrigin = 1;
  private zoomTrackWidth = 0;

  /**
   * City targeting. The stored field is the city id; the autocomplete shows a translated
   * label, so an id typed by hand could never match and a text input was unusable here.
   * An empty value means the banner is global, which the API models as a null city.
   */
  listOfCities: AdminCitiesListLimitedInterface[] = [];
  cityCtrl = new FormControl<string | null>('');
  cities!: Observable<AdminCitiesListLimitedInterface[]>;

  /**
   * CTA target pickers.
   *
   * The stored `ctaTarget` is an id, so - as with the city above - a text input could
   * only ever be satisfied by pasting an ObjectId out of a database viewer. These three
   * autocompletes render a translated label and write the id on selection.
   *
   * `ctaRestaurant` is a second, unsaved control: the form only persists `ctaTarget`, so
   * the restaurant is remembered locally to filter the food list and to label a chosen
   * dish. It is deliberately not a form control because there is no column for it.
   */
  listOfCtaRestaurants: AdminHeaderBannerCtaOptionInterface[] = [];
  ctaRestaurantCtrl = new FormControl<string | null>('');
  ctaRestaurants!: Observable<AdminHeaderBannerCtaOptionInterface[]>;
  ctaRestaurantsLoading = false;
  ctaRestaurantsError = '';

  listOfCtaFoods: AdminHeaderBannerCtaOptionInterface[] = [];
  ctaFoodCtrl = new FormControl<string | null>('');
  ctaFoods!: Observable<AdminHeaderBannerCtaOptionInterface[]>;
  ctaFoodsLoading = false;
  ctaFoodsError = '';

  listOfCtaCategories: AdminHeaderBannerCtaOptionInterface[] = [];
  ctaCategoryCtrl = new FormControl<string | null>('');
  ctaCategories!: Observable<AdminHeaderBannerCtaOptionInterface[]>;
  ctaCategoriesLoading = false;
  ctaCategoriesError = '';

  /** Typed-form helpers. Everything is non-nullable except the two schedule dates. */
  private str(initial = ''): FormControl<string> {
    return new FormControl(initial, { nonNullable: true });
  }

  private num(initial = 0): FormControl<number> {
    return new FormControl(initial, { nonNullable: true });
  }

  private flag(initial = true): FormControl<boolean> {
    return new FormControl(initial, { nonNullable: true });
  }

  private list<T>(initial: T[]): FormControl<T[]> {
    return new FormControl<T[]>(initial, { nonNullable: true });
  }

  /**
   * Control constrained to a string literal union.
   *
   * `str()` widens to `string`, which loses the union and would let any value reach the
   * payload; the Lottie fit and alignment fields are fixed sets shared with the customer
   * client, so they are kept typed all the way to the template.
   */
  private choice<T extends string>(initial: T): FormControl<T> {
    return new FormControl<T>(initial, { nonNullable: true });
  }

  headerBannerForm = new FormGroup({
    // 1 Basic information
    campaignName: this.str(),
    subtitle: this.str(),
    isActive: this.flag(true),

    // 2 Type & layout
    media: this.str('image'),
    orientation: this.str('horizontal'),
    aspectRatio: new FormControl<number | null>(null),
    heightMode: this.str('responsive'),
    maxHeight: this.num(HEADER_BANNER_HEIGHT_DEFAULT),

    // 3 Media
    image: this.str(),
    mediaUrl: this.str(),

    // 4 Content
    title: this.str(),
    ctaText: this.str(),
    showCta: this.flag(true),
    ctaAction: this.str(),
    ctaTarget: this.str(),
    deepLink: this.str(),
    enableOverlayText: this.flag(true),
    displayDuration: this.num(5),

    // 6 CTA appearance + motion. Seeds come from the `default` preset so a brand new
    // banner renders exactly as it did before these fields existed.
    ctaPreset: this.choice<AdminHeaderBannerCtaPreset>('default'),
    ctaStyle: this.choice<AdminHeaderBannerCtaStyle>('solid'),
    ctaBackgroundColor: this.str(),
    ctaTextColor: this.str(),
    ctaCornerRadius: this.num(HEADER_BANNER_CTA_PRESETS.default.cornerRadius),
    ctaFontSize: this.num(HEADER_BANNER_CTA_PRESETS.default.fontSize),
    ctaPaddingX: this.num(HEADER_BANNER_CTA_PRESETS.default.paddingX),
    ctaPaddingY: this.num(HEADER_BANNER_CTA_PRESETS.default.paddingY),
    ctaFullWidth: this.flag(false),
    ctaShowArrow: this.flag(true),
    ctaAnimation: this.choice<AdminHeaderBannerCtaAnimation>('none'),
    ctaAnimationDuration: this.num(1200),
    ctaAnimationLoop: this.flag(false),

    // 5 App bar background
    appBarBackgroundMode: this.str('auto'),
    appBarBackgroundColor: this.str(HEADER_BANNER_DEFAULT_BACKGROUND_COLOR),
    appBarGradientFrom: this.str(HEADER_BANNER_DEFAULT_GRADIENT_FROM),
    appBarGradientTo: this.str(HEADER_BANNER_DEFAULT_GRADIENT_TO),
    extractedColors: this.list<string>([]),
    collapsedHeight: this.num(HEADER_BANNER_COLLAPSED_DEFAULT),
    showLocation: this.flag(true),
    showLanguageSelector: this.flag(true),
    showNotificationIcon: this.flag(true),

    // 6 Lottie
    lottieAutoPlay: this.flag(true),
    lottieLoop: this.flag(true),
    lottieSpeed: this.num(1),
    lottieFit: this.choice<AdminHeaderBannerLottieFit>('cover'),
    lottieAlignment: this.choice<AdminHeaderBannerLottieAlignment>('center'),
    mediaOffsetX: this.num(0),
    mediaOffsetY: this.num(0),
    overlayOffsetX: this.num(0),
    overlayOffsetY: this.num(0),
    ctaOffsetX: this.num(0),
    ctaOffsetY: this.num(0),
    mediaScale: this.num(HEADER_BANNER_MEDIA_SCALE_DEFAULT),

    // 7 Schedule & targeting
    scheduleType: this.str('alwaysOn'),
    startDate: new FormControl<Date | null>(null),
    endDate: new FormControl<Date | null>(null),
    startTime: this.str('00:00'),
    endTime: this.str('23:59'),
    timezone: this.str('Asia/Kolkata'),
    repeat: this.str('No Repeat'),
    city: this.str(),
    priority: this.num(1),

    translations: this.list<any>([]),
    subtitleTranslations: this.list<any>([]),
  });

  constructor(
    public util: UtilService,
    public api: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.headerBannerForm.valueChanges.subscribe(() => (this.draftDirty = true));
    this.f['isActive'].valueChanges.subscribe(() => this.refreshStatusChip());
  }

  ngOnInit(): void {
    this.getCities();
    const id = this.route.snapshot.paramMap.get('id');
    // `header-banner/manage/:id` is a separate route entry, so Angular rebuilds this
    // component when a row is opened. The tab therefore has to be derived from the
    // URL here: assigning `tabIndex` in the click handler would mutate the outgoing
    // instance and be thrown away, which left Edit looking like a no-op - the form
    // was hydrated but rendered on the hidden Banners tab.
    const tab = this.route.snapshot.queryParamMap.get('tab');
    this.tabIndex = !id ? 0 : tab === 'history' ? 8 : 1;
    if (id) this.loadBanner(id);
  }

  // ------------------------------------------------------------------------ cities

  getCities(): void {
    this.api.get_private('v1/admin/cities/listAllCities').subscribe({
      next: (response: any) => {
        this.listOfCities = Array.isArray(response) ? response : [];
        this.cities = this.cityCtrl.valueChanges.pipe(
          startWith(''),
          map((value) => (value ? this.filterCities(value) : this.listOfCities.slice()))
        );
      },
      error: () => {
        this.listOfCities = [];
        this.cities = this.cityCtrl.valueChanges.pipe(startWith(''), map(() => []));
      },
    });
  }

  private filterCities(value: string | AdminCitiesListLimitedInterface | null): AdminCitiesListLimitedInterface[] {
    const term = typeof value === 'string' ? value.toLowerCase() : '';
    if (!term) return this.listOfCities.slice();
    return this.listOfCities.filter((item) => this.getTranslatedCityName(item).toLowerCase().includes(term));
  }

  onCitySelect(event: MatAutocompleteSelectedEvent): void {
    this.f['city'].setValue(event?.option?.value ?? '');
  }

  clearCity(): void {
    this.f['city'].setValue('');
    this.cityCtrl.setValue('');
  }

  getTranslatedCityName(item: AdminCitiesListLimitedInterface): string {
    if (item.translations && Array.isArray(item.translations)) {
      const found = item.translations.find((t) => t.code == this.util.appLocaleName());
      if (found && found.value) return found.value;
    }
    return item.name;
  }

  /** Shows a translated label for the stored city id. */
  displayCityName = (id: string): string => {
    if (!id) return '';
    const selected = this.listOfCities.find((item) => item.id == id);
    return selected ? this.getTranslatedCityName(selected) : '';
  };

  // ------------------------------------------------------------------ CTA targets

  /**
   * Translated option label.
   *
   * The two translation keys differ across the three taxonomies this picker serves:
   * restaurants and foods store `title`, categories store `value`. Both are accepted so
   * one helper covers every list instead of one per kind.
   *
   * `name` is deliberately NOT in the chain. Inside a translation row `name` is the
   * language's own name ("Hindi", "Arabic") - see the translations FormArray built in
   * manage-restaurant - so treating it as a fallback renders the language in place of
   * the restaurant whenever a row exists but its title was left blank.
   */
  ctaOptionName(item: AdminHeaderBannerCtaOptionInterface | null | undefined): string {
    if (!item) return '';
    if (Array.isArray(item.translations)) {
      const found = item.translations.find((t) => t && t.code == this.util.appLocaleName());
      const translated = found && (found.title || found.value);
      if (translated) return translated;
    }
    return item.name || '';
  }

  /**
   * Label for a food option, qualified by its restaurant.
   *
   * Two restaurants in one city very often sell a dish with the same name, so the bare
   * name is frequently ambiguous. The lookup returns `restaurantId` rather than the
   * restaurant's name to keep the payload small; the resolved restaurant is looked up in
   * the already-loaded list, and the qualifier is simply omitted when that list has not
   * been fetched (which is the case while the food target is being set before a
   * restaurant exists).
   */
  ctaFoodOptionName(item: AdminHeaderBannerCtaOptionInterface | null | undefined): string {
    const name = this.ctaOptionName(item);
    if (!item || !item.restaurantId) return name;
    const owner = this.listOfCtaRestaurants.find((entry) => entry.id == item.restaurantId);
    const ownerName = this.ctaOptionName(owner);
    return ownerName ? `${name} (${ownerName})` : name;
  }

  /** Client-side filter shared by all three option lists. */
  private filterCtaOptions(
    value: string | AdminHeaderBannerCtaOptionInterface | null,
    source: AdminHeaderBannerCtaOptionInterface[],
    label: (item: AdminHeaderBannerCtaOptionInterface) => string
  ): AdminHeaderBannerCtaOptionInterface[] {
    const term = typeof value === 'string' ? value.trim().toLowerCase() : '';
    if (!term) return source.slice();
    return source.filter((item) => label(item).toLowerCase().includes(term));
  }

  /**
   * Calls the lookup endpoint.
   *
   * `city` and `restaurant` are only sent when present rather than sent empty: the Joi
   * schema allows a blank id string, but the service treats any truthy value as a real
   * ObjectId and would fail the cast.
   */
  private fetchCtaOptions(
    kind: AdminHeaderBannerCtaLookupKind,
    params: { city?: string; restaurant?: string } = {}
  ): Observable<any> {
    const query: string[] = [`kind=${kind}`];
    if (params.city) query.push(`city=${params.city}`);
    if (params.restaurant) query.push(`restaurant=${params.restaurant}`);
    return this.api.get_private(`v1/admin/header-banner/lookups?${query.join('&')}`);
  }

  /** Restaurants available to target, scoped to the banner's city. */
  loadCtaRestaurants(): void {
    this.ctaRestaurantsLoading = true;
    this.ctaRestaurantsError = '';

    this.fetchCtaOptions('restaurant', { city: this.bannerCityId() }).subscribe({
      next: (response: any) => {
        this.ctaRestaurantsLoading = false;
        this.listOfCtaRestaurants = Array.isArray(response?.restaurants) ? response.restaurants : [];
        this.ctaRestaurants = this.ctaRestaurantCtrl.valueChanges.pipe(
          startWith(''),
          map((value) => this.filterCtaOptions(value, this.listOfCtaRestaurants, (item) => this.ctaOptionName(item)))
        );
        // Edit mode: the stored target is an id, so back-fill its label once the list lands.
        this.restoreCtaLabel(this.ctaRestaurantCtrl, this.listOfCtaRestaurants, this.f['ctaTarget'].value);
      },
      error: () => {
        this.ctaRestaurantsLoading = false;
        this.listOfCtaRestaurants = [];
        this.ctaRestaurants = this.ctaRestaurantCtrl.valueChanges.pipe(startWith(''), map(() => []));
        this.ctaRestaurantsError = this.util.appTranslate('cta_lookups_failed');
      },
    });
  }

  /**
   * Foods available to target, narrowed to the chosen restaurant.
   *
   * With no restaurant chosen this falls back to the city-wide list, which is the only
   * useful answer at that point: the food list cannot be filtered by something that has
   * not been picked yet.
   */
  loadCtaFoods(): void {
    this.ctaFoodsLoading = true;
    this.ctaFoodsError = '';

    const restaurant = this.ctaRestaurantCtrl.value;
    this.fetchCtaOptions('food', restaurant ? { restaurant } : { city: this.bannerCityId() }).subscribe({
      next: (response: any) => {
        this.ctaFoodsLoading = false;
        this.listOfCtaFoods = Array.isArray(response?.foods) ? response.foods : [];
        this.ctaFoods = this.ctaFoodCtrl.valueChanges.pipe(
          startWith(''),
          map((value) => this.filterCtaOptions(value, this.listOfCtaFoods, (item) => this.ctaFoodOptionName(item)))
        );
        this.restoreCtaLabel(this.ctaFoodCtrl, this.listOfCtaFoods, this.f['ctaTarget'].value);
      },
      error: () => {
        this.ctaFoodsLoading = false;
        this.listOfCtaFoods = [];
        this.ctaFoods = this.ctaFoodCtrl.valueChanges.pipe(startWith(''), map(() => []));
        this.ctaFoodsError = this.util.appTranslate('cta_lookups_failed');
      },
    });
  }

  /** Active categories, which are global and need no city. */
  loadCtaCategories(): void {
    this.ctaCategoriesLoading = true;
    this.ctaCategoriesError = '';

    this.fetchCtaOptions('category').subscribe({
      next: (response: any) => {
        this.ctaCategoriesLoading = false;
        this.listOfCtaCategories = Array.isArray(response?.categories) ? response.categories : [];
        this.ctaCategories = this.ctaCategoryCtrl.valueChanges.pipe(
          startWith(''),
          map((value) => this.filterCtaOptions(value, this.listOfCtaCategories, (item) => this.ctaOptionName(item)))
        );
        this.restoreCtaLabel(this.ctaCategoryCtrl, this.listOfCtaCategories, this.f['ctaTarget'].value);
      },
      error: () => {
        this.ctaCategoriesLoading = false;
        this.listOfCtaCategories = [];
        this.ctaCategories = this.ctaCategoryCtrl.valueChanges.pipe(startWith(''), map(() => []));
        this.ctaCategoriesError = this.util.appTranslate('cta_lookups_failed');
      },
    });
  }

  /**
   * Puts a stored id's label back into its autocomplete box.
   *
   * `displayWith` can only render an id it finds in the list, and on first render the
   * list is still empty - the stored value would show as a blank field and look like the
   * target had been lost. Guarded on the box already being empty so it never overwrites
   * a label the operator is part way through typing.
   */
  private restoreCtaLabel(
    ctrl: FormControl<string | null>,
    source: AdminHeaderBannerCtaOptionInterface[],
    storedTarget: unknown
  ): void {
    const stored = String(storedTarget ?? '').trim();
    if (!stored || ctrl.value) return;
    const match = source.find((item) => String(item.id) === stored);
    if (match) ctrl.setValue(match.id);
  }

  /** The banner's own city, which scopes the restaurant and food lists. */
  private bannerCityId(): string {
    const city = this.f['city'].value as string | AdminHeaderBannerCityInterface | null;
    if (!city) return '';
    return typeof city === 'string' ? city : String(city.id ?? '');
  }

  /** True when the operator still has to pick a city before the lists can be fetched. */
  get ctaNeedsCity(): boolean {
    return !this.bannerCityId();
  }

  displayCtaOptionName = (id: string): string => {
    if (!id) return '';
    const match =
      this.listOfCtaRestaurants.find((item) => item.id == id) ||
      this.listOfCtaCategories.find((item) => item.id == id) ||
      this.listOfCtaFoods.find((item) => item.id == id);
    return match ? this.ctaOptionName(match) : '';
  };

  displayCtaFoodName = (id: string): string => {
    if (!id) return '';
    const match = this.listOfCtaFoods.find((item) => item.id == id);
    return match ? this.ctaFoodOptionName(match) : '';
  };

  onCtaRestaurantSelect(event: MatAutocompleteSelectedEvent): void {
    this.f['ctaTarget'].setValue(event?.option?.value ?? '');
    // Re-fetch: the food list is scoped to this restaurant, and the previous list (if any)
    // belonged to a different kitchen. Clearing first stops a stale dish staying valid.
    this.ctaFoodCtrl.setValue('');
    this.loadCtaFoods();
  }

  onCtaFoodSelect(event: MatAutocompleteSelectedEvent): void {
    this.f['ctaTarget'].setValue(event?.option?.value ?? '');
  }

  onCtaCategorySelect(event: MatAutocompleteSelectedEvent): void {
    this.f['ctaTarget'].setValue(event?.option?.value ?? '');
  }

  /** Clears the target and both autocomplete boxes. */
  clearCtaTarget(): void {
    this.f['ctaTarget'].setValue('');
    this.ctaRestaurantCtrl.setValue('');
    this.ctaFoodCtrl.setValue('');
    this.ctaCategoryCtrl.setValue('');
  }

  /**
   * Switches the CTA action and resets whatever the previous one targeted.
   *
   * Leaving a target behind is worse than clearing it: the id belongs to a different
   * taxonomy, so the server would resolve it against the new action's model and either
   * find nothing or find the wrong record. Cleared rather than defaulted so an
   * unconfigured CTA is visible in the form instead of silently pointing somewhere.
   */
  onCtaActionChange(): void {
    this.clearCtaTarget();
    this.hydrateCtaPickers();
  }

  /**
   * Clears the option boxes and loads the list the current action needs.
   *
   * Called both when the action changes and after a banner is hydrated, because in edit
   * mode the stored `ctaTarget` is an id whose label can only be resolved once its list
   * has loaded - `restoreCtaLabel` inside each loader does that back-fill.
   */
  private hydrateCtaPickers(): void {
    this.ctaRestaurantCtrl.setValue('');
    this.ctaFoodCtrl.setValue('');
    this.ctaCategoryCtrl.setValue('');

    const action = this.f['ctaAction'].value;
    if (action === 'restaurant') {
      this.loadCtaRestaurants();
    } else if (action === 'food') {
      // Restaurants are loaded alongside foods so each dish can be labelled with its
      // kitchen; without them the qualifier is silently dropped from the option text.
      this.loadCtaRestaurants();
      this.loadCtaFoods();
    } else if (action === 'category') {
      this.loadCtaCategories();
    }
  }

  // ------------------------------------------------------------------ CTA appearance

  /** Preset names for the dropdown, in table order. */
  get ctaPresetOptions(): AdminHeaderBannerCtaPreset[] {
    return Object.keys(HEADER_BANNER_CTA_PRESETS) as AdminHeaderBannerCtaPreset[];
  }

  /**
   * Animation options grouped by family, so the dropdown presents families rather than
   * seventeen flat rows.
   */
  get ctaAnimationGroups(): {
    group: AdminHeaderBannerCtaAnimationGroup;
    values: AdminHeaderBannerCtaAnimation[];
  }[] {
    return HEADER_BANNER_CTA_ANIMATION_GROUPS_LISTED;
  }

  /**
   * Whether the loop toggle is offered for the selected effect.
   *
   * Entrance effects and touch-driven ones hide it. Leaving the toggle visible for a
   * one-shot entrance would promise something the client deliberately ignores.
   */
  get ctaLoopAvailable(): boolean {
    return ctaAnimationIsLoopable(this.f['ctaAnimation'].value as AdminHeaderBannerCtaAnimation);
  }

  /**
   * Whether the stored loop value can actually do anything.
   *
   * Switching from a loopable effect to an entrance one leaves the flag set in the form
   * and the banner saved, so the payload reports the truth about what was configured and
   * the hint explains why nothing is moving.
   */
  get ctaLoopIgnored(): boolean {
    return (
      this.f['ctaAnimationLoop'].value === true &&
      this.f['ctaAnimation'].value !== 'none' &&
      !this.ctaLoopAvailable
    );
  }

  get ctaAnimationOptions(): AdminHeaderBannerCtaAnimation[] {
    return HEADER_BANNER_CTA_ANIMATIONS_LIST;
  }

  /**
   * Writes a preset's shape onto the form.
   *
   * Colours are intentionally left alone - the presets all inherit the app theme, so
   * switching preset should not silently discard a colour the operator picked on purpose.
   * Everything it does write stays individually editable afterwards.
   */
  applyCtaPreset(preset: AdminHeaderBannerCtaPreset): void {
    const definition = HEADER_BANNER_CTA_PRESETS[preset];
    if (!definition) return;
    this.f['ctaPreset'].setValue(preset);
    this.f['ctaStyle'].setValue(definition.style);
    this.f['ctaCornerRadius'].setValue(definition.cornerRadius);
    this.f['ctaFontSize'].setValue(definition.fontSize);
    this.f['ctaPaddingX'].setValue(definition.paddingX);
    this.f['ctaPaddingY'].setValue(definition.paddingY);
  }

  /** Returns every appearance field to the `default` preset, colours included. */
  resetCtaStyle(): void {
    this.applyCtaPreset('default');
    this.f['ctaBackgroundColor'].setValue('');
    this.f['ctaTextColor'].setValue('');
    this.f['ctaFullWidth'].setValue(false);
    this.f['ctaShowArrow'].setValue(true);
  }

  /** Resolved CTA background, falling back to the app's primary colour. */
  get ctaResolvedBackground(): string {
    return (this.f['ctaBackgroundColor'].value as string) || HEADER_BANNER_CTA_FALLBACK_BACKGROUND;
  }

  get ctaResolvedText(): string {
    return (this.f['ctaTextColor'].value as string) || HEADER_BANNER_CTA_FALLBACK_TEXT;
  }

  /** True when the CTA has no fill, so it needs a border to stay visible on light media. */
  get ctaIsOutlined(): boolean {
    return this.f['ctaStyle'].value === 'outline';
  }

  get ctaIsGhost(): boolean {
    return this.f['ctaStyle'].value === 'ghost';
  }

  /**
   * Inline styles for the preview button.
   *
   * Bound directly rather than expressed as CSS classes so the preview reflects whatever
   * numbers are in the form - that is the whole point of a live preview. Mirrors the
   * `BoxDecoration` branch in the client's `_CtaButton`.
   */
  get previewCtaStyles(): { [key: string]: string } {
    const radius = Number(this.f['ctaCornerRadius'].value) || 0;
    const fontSize = Number(this.f['ctaFontSize'].value) || 0;
    const padX = Number(this.f['ctaPaddingX'].value) || 0;
    const padY = Number(this.f['ctaPaddingY'].value) || 0;
    const background = this.ctaIsGhost || this.ctaIsOutlined ? 'transparent' : this.ctaResolvedBackground;

    return {
      'background-color': background,
      color: this.ctaResolvedText,
      'border-radius': `${radius >= 999 ? 999 : radius}px`,
      'font-size': `${fontSize}px`,
      'padding': `${padY}px ${padX}px`,
      'border': this.ctaIsOutlined ? `1px solid ${this.ctaResolvedText}` : 'none',
      width: this.f['ctaFullWidth'].value ? '100%' : '',
      'justify-content': this.f['ctaFullWidth'].value ? 'center' : '',
      'text-align': this.f['ctaFullWidth'].value ? 'center' : '',
    };
  }

  /**
   * CSS animation shorthand for the preview, empty when the effect is `none`.
   *
   * Only a preview: these approximate the client's effects so an operator can see roughly
   * what will play, and are deliberately not frame-accurate against Flutter's curves.
   * `pressDown` is excluded because it is driven by touch and has nothing to preview, and
   * the custom-painted borders (`borderRunner`, `rainbow`) are approximated with a plain
   * outline flash since CSS cannot sweep a stroke around a rounded rectangle.
   */
  get previewCtaAnimation(): string {
    const effect = this.f['ctaAnimation'].value as AdminHeaderBannerCtaAnimation;
    if (!effect || effect === 'none' || effect === 'pressDown') return '';

    const seconds = (Number(this.f['ctaAnimationDuration'].value) || 1200) / 1000;
    // Entrance effects are one-shot on the device, so the preview must not repeat them
    // either - the loop flag is ignored for that family on both sides.
    const loopable = ctaAnimationIsLoopable(effect);
    const iteration = loopable && this.f['ctaAnimationLoop'].value ? 'infinite' : '1';

    return `hb-cta-${effect} ${seconds}s ${iteration}`;
  }

  get f() {
    return this.headerBannerForm.controls;
  }

  get isLottie(): boolean {
    return this.f['media'].value === 'lottie';
  }

  get isVideo(): boolean {
    return this.f['media'].value === 'video';
  }

  get gradientEnabled(): boolean {
    return this.f['appBarBackgroundMode'].value === 'gradient';
  }

  get manualColourEnabled(): boolean {
    return this.f['appBarBackgroundMode'].value === 'manual';
  }

  get previewWidth(): number {
    return this.previewDevice === 'phone' ? 360 : this.previewDevice === 'large' ? 414 : 768;
  }

  /** Ratio the client would resolve, falling back to the orientation default. */
  get resolvedAspectRatio(): number {
    const explicit = Number(this.f['aspectRatio'].value);
    if (explicit > 0) return explicit;
    return this.f['orientation'].value === 'vertical'
      ? HEADER_BANNER_VERTICAL_ASPECT_RATIO
      : HEADER_BANNER_HORIZONTAL_ASPECT_RATIO;
  }

  /** Resolved banner height, mirroring `HomePromoBannerSpec.resolveHeight`. */
  get previewBannerHeight(): number {
    if (this.f['heightMode'].value === 'fixed') {
      // Clamped like the client, so a hand-typed 900 never previews taller than the
      // app would actually paint it.
      return this.clampSize(
        Number(this.f['maxHeight'].value) || HEADER_BANNER_HEIGHT_DEFAULT,
        HEADER_BANNER_HEIGHT_MIN,
        HEADER_BANNER_HEIGHT_MAX
      );
    }
    return this.previewWidth / this.resolvedAspectRatio;
  }

  /**
   * Banner height measured at the reference width - the frame the `130 – 210 px`
   * band is written in, and therefore the number a resize drag clamps against.
   *
   * Responsive mode has no stored height at all (only a ratio), so the height it
   * works out to on the reference phone is derived back out. Reporting that rather
   * than the pixels on screen keeps the readout honest on a 768px tablet, where
   * the same banner legitimately paints ~2x taller.
   */
  get previewBannerReferenceHeight(): number {
    if (this.f['heightMode'].value === 'fixed') return this.previewBannerHeight;
    return this.clampSize(
      HEADER_BANNER_REFERENCE_WIDTH / this.resolvedAspectRatio,
      HEADER_BANNER_HEIGHT_MIN,
      HEADER_BANNER_HEIGHT_MAX
    );
  }

  /**
   * Reference pixels per on-screen pixel for the banner handle.
   *
   * Without this a drag on the tablet preview would store a shorter banner than
   * the same gesture on the phone, because the tablet frame is wider.
   */
  get previewDragScale(): number {
    return this.previewWidth / HEADER_BANNER_REFERENCE_WIDTH;
  }

  /**
   * Aspect ratio choices, plus a Custom entry once a drag has produced a ratio
   * that is none of the presets.
   *
   * The Appearance tab drives the same control; without the extra option it would
   * render blank the moment a preview drag changed the value.
   */
  get aspectRatioOptions(): { value: number; label: string }[] {
    const presets = [
      { value: HEADER_BANNER_HORIZONTAL_ASPECT_RATIO, label: `16:9 (${this.util.appTranslate('recommended')})` },
      { value: HEADER_BANNER_VERTICAL_ASPECT_RATIO, label: '3:4' },
      { value: 1, label: '1:1' },
      { value: 4 / 3, label: '4:3' },
    ];
    const current = Number(this.f['aspectRatio'].value);
    if (current > 0 && !presets.some((preset) => Math.abs(preset.value - current) < 0.005)) {
      presets.push({ value: current, label: `${current.toFixed(2)}:1 (${this.util.appTranslate('custom')})` });
    }
    return presets;
  }

  get previewCollapsedHeight(): number {
    return this.clampSize(
      Number(this.f['collapsedHeight'].value) || HEADER_BANNER_COLLAPSED_DEFAULT,
      HEADER_BANNER_COLLAPSED_MIN,
      HEADER_BANNER_COLLAPSED_MAX
    );
  }

  /** Bounds advertised to the handles, so the ARIA values match the real limits. */
  get bannerHeightBounds(): { min: number; max: number } {
    return { min: HEADER_BANNER_HEIGHT_MIN, max: HEADER_BANNER_HEIGHT_MAX };
  }

  get collapsedHeightBounds(): { min: number; max: number } {
    return { min: HEADER_BANNER_COLLAPSED_MIN, max: HEADER_BANNER_COLLAPSED_MAX };
  }

  /**
   * Height of the app bar region, mirroring the client's `appBarHeight`.
   *
   * Toolbar row plus search bar. The preview previously drew a hardcoded 96px
   * app bar, which is neither the configured collapsed height nor the client's
   * 119px, so the gradient proportions here never matched the device.
   */
  get previewAppBarHeight(): number {
    return this.previewCollapsedHeight + HEADER_BANNER_SEARCH_BAR_HEIGHT;
  }

  /**
   * Fraction of the header surface at which the app bar's slice ends.
   *
   * Mirrors `HomeAppBarTheme.appBarGradientEnd`. A vertical gradient spreads its
   * stops over whatever box paints it, so the client windows the same sweep into
   * two slices against this shared boundary. Painting the whole gradient into both
   * boxes here - which is what the preview used to do - restarted it at the seam.
   */
  private get previewGradientSplit(): number {
    const appBar = this.previewAppBarHeight;
    const banner = this.previewBannerHeight;
    return appBar / (appBar + banner);
  }

  /** Parses `#RGB` / `#RRGGBB`, ignoring an optional `0x` prefix. */
  private static parseHex(value: string): [number, number, number] | null {
    let hex = String(value ?? '')
      .trim()
      .replace(/^0x/i, '')
      .replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((char) => char + char)
        .join('');
    }
    if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  }

  private static toHex(rgb: [number, number, number]): string {
    return (
      '#' +
      rgb
        .map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, '0'))
        .join('')
    ).toUpperCase();
  }

  /**
   * The slice of the header gradient between [start] and [end], as a CSS gradient.
   *
   * The two endpoints are sampled off the same two-stop ramp the client uses, so
   * both sides resolve to an identical colour at the boundary and the join is
   * invisible. Returns `null` when a colour cannot be parsed, letting the caller
   * fall back rather than painting something misleading.
   */
  private windowedGradient(from: string, to: string, start: number, end: number): string | null {
    const a = HeaderBanner.parseHex(from);
    const b = HeaderBanner.parseHex(to);
    if (!a || !b) return null;
    const clamp = (value: number) => Math.max(0, Math.min(1, value));
    const mix = (t: number) => HeaderBanner.toHex([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t] as [number, number, number]);
    return `linear-gradient(180deg, ${mix(clamp(start))}, ${mix(clamp(end))})`;
  }

  get previewMediaUrl(): string {
    const path = this.isLottie || this.isVideo ? this.f['mediaUrl'].value : this.f['image'].value;
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    // The storage base is stored with a trailing slash and the API paths carry a
    // leading one. Joining them literally produced `//`, which S3 answers with 403 -
    // the preview rendered blank while the upload itself had succeeded.
    const base = (this.api.mediaUrl || '').trim().replace(/\/+$/, '');
    const suffix = path.trim().replace(/^\/+/, '');
    return base ? `${base}/${suffix}` : '';
  }

  /**
   * App bar background for the preview: the TOP slice of the header sweep.
   *
   * Mirrors `HomeAppBar`, which windows its gradient so the banner below can
   * continue it rather than restart it.
   */
  get previewAppBarBackground(): string {
    if (this.gradientEnabled) {
      const windowed = this.windowedGradient(
        this.f['appBarGradientFrom'].value || HEADER_BANNER_DEFAULT_GRADIENT_FROM,
        this.f['appBarGradientTo'].value || HEADER_BANNER_DEFAULT_GRADIENT_TO,
        0,
        this.previewGradientSplit
      );
      if (windowed) return windowed;
    }
    if (this.manualColourEnabled) {
      return this.f['appBarBackgroundColor'].value || HEADER_BANNER_DEFAULT_BACKGROUND_COLOR;
    }
    const palette = this.f['extractedColors'].value as string[];
    if (palette && palette.length) return palette[0];
    // `auto` with no resolved colour: the client leaves the ambient theme alone.
    return 'transparent';
  }

  /**
   * Background painted behind the banner media: the REMAINING slice of the sweep.
   *
   * Mirrors `HomePromoBanner`. For a solid colour this is the same value the app
   * bar paints, so the two still agree.
   */
  get previewBannerBackground(): string {
    if (this.gradientEnabled) {
      const windowed = this.windowedGradient(
        this.f['appBarGradientFrom'].value || HEADER_BANNER_DEFAULT_GRADIENT_FROM,
        this.f['appBarGradientTo'].value || HEADER_BANNER_DEFAULT_GRADIENT_TO,
        this.previewGradientSplit,
        1
      );
      if (windowed) return windowed;
    }
    const themed = this.previewAppBarBackground;
    return themed === 'transparent' ? HEADER_BANNER_DEFAULT_BACKGROUND_COLOR : themed;
  }

  // --------------------------------------------------------- drag to place a layer

  /**
   * The X/Y control pair backing each draggable layer.
   *
   * Kept as one map rather than three copies of the same start/move/end handlers: the
   * maths is identical for all three and only the target controls differ. A layer absent
   * from this map is not draggable.
   */
  private layerOffsets(): Record<Exclude<AdminHeaderBannerDragLayer, null>, [FormControl<number>, FormControl<number>]> {
    return {
      media: [this.f['mediaOffsetX'], this.f['mediaOffsetY']],
      overlay: [this.f['overlayOffsetX'], this.f['overlayOffsetY']],
      cta: [this.f['ctaOffsetX'], this.f['ctaOffsetY']],
    };
  }

  /**
   * Converts a pointer drag inside the preview frame into a stored offset.
   *
   * The value is a fraction of the banner box rather than a pixel count, so the
   * nudge an operator drags out on the 360px preview holds on a tablet and on a
   * real handset. `0` means "no nudge" and leaves the default rendering untouched.
   */
  onLayerDragStart(event: PointerEvent, frame: HTMLElement, layer: Exclude<AdminHeaderBannerDragLayer, null>): void {
    if (event.button !== 0) return;
    // Stop the frame's own media drag from also claiming this gesture, otherwise dragging
    // the CTA would nudge the artwork underneath it.
    event.stopPropagation();
    const [x, y] = this.layerOffsets()[layer];
    this.dragLayer = layer;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragOriginX = Number(x.value) || 0;
    this.dragOriginY = Number(y.value) || 0;
    this.dragFrameWidth = frame.clientWidth || this.previewWidth;
    this.dragFrameHeight = frame.clientHeight || this.previewBannerHeight;
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  onLayerDragMove(event: PointerEvent): void {
    if (!this.dragLayer || this.dragStartX === null || this.dragStartY === null) return;
    const [x, y] = this.layerOffsets()[this.dragLayer];
    const nextX = this.dragOriginX + (event.clientX - this.dragStartX) / this.dragFrameWidth;
    const nextY = this.dragOriginY + (event.clientY - this.dragStartY) / this.dragFrameHeight;
    x.setValue(this.clampOffset(nextX));
    y.setValue(this.clampOffset(nextY));
  }

  onLayerDragEnd(event: PointerEvent): void {
    if (this.dragStartX === null && this.dragStartY === null) return;
    (event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId);
    this.dragStartX = null;
    this.dragStartY = null;
    this.dragLayer = null;
  }

  /** True while a given layer is being dragged, used to widen the grab affordance. */
  isDraggingLayer(layer: Exclude<AdminHeaderBannerDragLayer, null>): boolean {
    return this.dragStartX !== null && this.dragLayer === layer;
  }

  /** True while a drag is in flight, used to widen the grab affordance. */
  get isDraggingMedia(): boolean {
    return this.isDraggingLayer('media');
  }

  private layerWasMoved(layer: Exclude<AdminHeaderBannerDragLayer, null>): boolean {
    const [x, y] = this.layerOffsets()[layer];
    return (Number(x.value) || 0) !== 0 || (Number(y.value) || 0) !== 0;
  }

  get hasMediaOffset(): boolean {
    return this.layerWasMoved('media');
  }

  get hasOverlayOffset(): boolean {
    return this.layerWasMoved('overlay');
  }

  get hasCtaOffset(): boolean {
    return this.layerWasMoved('cta');
  }

  /** True once anything in the preview has been dragged or cropped, so Reset goes live. */
  get hasAnyLayerOffset(): boolean {
    return this.hasMediaOffset || this.hasOverlayOffset || this.hasCtaOffset;
  }

  /** CSS transform for a layer from its stored offset pair, as a percentage nudge. */
  private layerTransform(xControl: FormControl<number>, yControl: FormControl<number>): string {
    const x = (Number(xControl.value) || 0) * 100;
    const y = (Number(yControl.value) || 0) * 100;
    return `translate(${x.toFixed(2)}%, ${y.toFixed(2)}%)`;
  }

  /** CSS transform mirroring the stored zoom and nudge. */
  get previewMediaTransform(): string {
    // Scale is applied first and about the centre, so raising the zoom crops
    // symmetrically and the nudge is what decides which part stays in frame.
    // Matches the client, where `Transform.scale` wraps `FractionalTranslation`.
    return `${this.layerTransform(this.f['mediaOffsetX'], this.f['mediaOffsetY'])} scale(${this.mediaScale.toFixed(3)})`;
  }

  /** Nudge for the title/subtitle block. */
  get previewOverlayTransform(): string {
    return this.layerTransform(this.f['overlayOffsetX'], this.f['overlayOffsetY']);
  }

  /** Nudge for the CTA button. */
  get previewCtaTransform(): string {
    return this.layerTransform(this.f['ctaOffsetX'], this.f['ctaOffsetY']);
  }

  /** Clears the nudge and returns the media to its fit/alignment position. */
  resetMediaOffset(): void {
    this.f['mediaOffsetX'].setValue(0);
    this.f['mediaOffsetY'].setValue(0);
  }

  resetOverlayOffset(): void {
    this.f['overlayOffsetX'].setValue(0);
    this.f['overlayOffsetY'].setValue(0);
  }

  resetCtaOffset(): void {
    this.f['ctaOffsetX'].setValue(0);
    this.f['ctaOffsetY'].setValue(0);
  }

  /** Returns all three layers to their default positions in one action. */
  resetAllLayerOffsets(): void {
    this.resetMediaOffset();
    this.resetOverlayOffset();
    this.resetCtaOffset();
  }

  // ------------------------------------------------------------- media zoom rail

  /** Current zoom, clamped to the range the API stores. */
  get mediaScale(): number {
    return this.clampSize(
      Number(this.f['mediaScale'].value) || HEADER_BANNER_MEDIA_SCALE_DEFAULT,
      HEADER_BANNER_MEDIA_SCALE_MIN,
      HEADER_BANNER_MEDIA_SCALE_MAX
    );
  }

  get mediaScaleBounds(): { min: number; max: number } {
    return { min: HEADER_BANNER_MEDIA_SCALE_MIN, max: HEADER_BANNER_MEDIA_SCALE_MAX };
  }

  /** Thumb position along the rail, as a percentage of the zoom range. */
  get zoomPercent(): number {
    const span = HEADER_BANNER_MEDIA_SCALE_MAX - HEADER_BANNER_MEDIA_SCALE_MIN;
    return ((this.mediaScale - HEADER_BANNER_MEDIA_SCALE_MIN) / span) * 100;
  }

  get previewScaleReadout(): string {
    return `${this.mediaScale.toFixed(2)}×`;
  }

  /** True once the media has been cropped or nudged, so Reset becomes live. */
  get hasMediaTransform(): boolean {
    return this.hasMediaOffset || this.mediaScale !== HEADER_BANNER_MEDIA_SCALE_DEFAULT;
  }

  /** True while the zoom rail is being dragged, used to light up the thumb. */
  get isScalingMedia(): boolean {
    return this.zoomStartX !== null;
  }

  private setMediaScale(value: number): void {
    const scale = this.clampSize(value, HEADER_BANNER_MEDIA_SCALE_MIN, HEADER_BANNER_MEDIA_SCALE_MAX);
    // 2dp: fine enough to feel continuous over a 2x range, coarse enough to
    // round-trip through the payload and compare equal.
    this.f['mediaScale'].setValue(Math.round(scale * 100) / 100);
  }

  /**
   * Converts a horizontal drag on the zoom rail into a stored zoom.
   *
   * The whole rail spans the full `1x .. 3x` range, so a pixel of travel is
   * normalised against the measured track width rather than a fixed step. That
   * keeps the gesture identical whether the rail is laid out narrow or wide, and
   * the drag is relative - it starts from the current value, so a grab mid-rail
   * does not jump the artwork.
   */
  onScaleDragStart(event: PointerEvent, track: HTMLElement): void {
    if (event.button !== 0) return;
    event.stopPropagation();
    this.zoomStartX = event.clientX;
    this.zoomOrigin = this.mediaScale;
    this.zoomTrackWidth = track.clientWidth || 240;
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  onScaleDragMove(event: PointerEvent): void {
    if (this.zoomStartX === null) return;
    event.stopPropagation();
    const span = HEADER_BANNER_MEDIA_SCALE_MAX - HEADER_BANNER_MEDIA_SCALE_MIN;
    const travelled = (event.clientX - this.zoomStartX) / this.zoomTrackWidth;
    this.setMediaScale(this.zoomOrigin + travelled * span);
  }

  onScaleDragEnd(event: PointerEvent): void {
    if (this.zoomStartX === null) return;
    event.stopPropagation();
    (event.target as HTMLElement).releasePointerCapture?.(event.pointerId);
    this.zoomStartX = null;
  }

  /** Arrow keys nudge the rail, so the zoom is reachable without a pointer. */
  onScaleKey(event: KeyboardEvent): void {
    const step = event.shiftKey ? 0.1 : 0.01;
    const right = event.key === 'ArrowRight' || event.key === 'ArrowUp';
    const left = event.key === 'ArrowLeft' || event.key === 'ArrowDown';
    if (!right && !left) return;
    event.preventDefault();
    this.setMediaScale(this.mediaScale + (right ? step : -step));
  }

  /** Drops the zoom and the nudge together - they are one crop. */
  resetMediaTransform(): void {
    this.setMediaScale(HEADER_BANNER_MEDIA_SCALE_DEFAULT);
    this.resetMediaOffset();
  }

  private clampOffset(value: number): number {
    const bounded = Math.max(-0.5, Math.min(0.5, value));
    // Stored to 4dp so the payload stays readable and equal values compare equal.
    return Math.round(bounded * 10000) / 10000;
  }

  private clampSize(value: number, min: number, max: number): number {
    if (!Number.isFinite(value)) return min;
    return Math.max(min, Math.min(max, value));
  }

  // ------------------------------------------------- drag to resize the header

  /** What a handle drag is currently driving, used to light up the active edge. */
  get isResizingBanner(): boolean {
    return this.resizeTarget === 'banner';
  }

  get isResizingHeader(): boolean {
    return this.resizeTarget === 'header';
  }

  /**
   * Writes a banner height given at the reference width into whichever control
   * owns it.
   *
   * The two height modes store different numbers - fixed stores pixels, responsive
   * stores only a ratio - so a drag has to be routed rather than assigned. Routing
   * it here keeps the clamp identical for both, which is the whole point of the
   * handle: the operator cannot drag past what the API would reject.
   */
  private setBannerReferenceHeight(value: number): void {
    const height = this.clampSize(Math.round(value), HEADER_BANNER_HEIGHT_MIN, HEADER_BANNER_HEIGHT_MAX);
    if (this.f['heightMode'].value === 'fixed') {
      this.f['maxHeight'].setValue(height);
      return;
    }
    const ratio = this.clampSize(
      HEADER_BANNER_REFERENCE_WIDTH / height,
      HEADER_BANNER_ASPECT_RATIO_MIN,
      HEADER_BANNER_ASPECT_RATIO_MAX
    );
    // 2dp is finer than the bounds need and still round-trips as a readable ratio.
    this.f['aspectRatio'].setValue(Math.round(ratio * 100) / 100);
  }

  private setHeaderCollapsedHeight(value: number): void {
    this.f['collapsedHeight'].setValue(
      this.clampSize(Math.round(value), HEADER_BANNER_COLLAPSED_MIN, HEADER_BANNER_COLLAPSED_MAX)
    );
  }

  onResizeStart(target: 'banner' | 'header', event: PointerEvent): void {
    if (event.button !== 0) return;
    // The banner frame owns a pointerdown of its own to nudge the media, and a
    // handle sits inside it - without this a grab on the handle reads as a nudge
    // of the artwork and both drags run at once.
    event.stopPropagation();
    this.resizeTarget = target;
    this.resizeStartY = event.clientY;
    this.resizeOrigin = target === 'banner' ? this.previewBannerReferenceHeight : this.previewCollapsedHeight;
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  onResizeMove(event: PointerEvent): void {
    if (this.resizeStartY === null || !this.resizeTarget) return;
    event.stopPropagation();
    const travelled = event.clientY - this.resizeStartY;
    // Only the banner is width-relative; the app bar is a fixed toolbar height on
    // every screen, so its drag is 1:1 with the pointer.
    const delta = this.resizeTarget === 'banner' ? travelled / this.previewDragScale : travelled;
    if (this.resizeTarget === 'banner') this.setBannerReferenceHeight(this.resizeOrigin + delta);
    else this.setHeaderCollapsedHeight(this.resizeOrigin + delta);
  }

  onResizeEnd(event: PointerEvent): void {
    if (!this.resizeTarget) return;
    event.stopPropagation();
    (event.target as HTMLElement).releasePointerCapture?.(event.pointerId);
    this.resizeTarget = null;
    this.resizeStartY = null;
  }

  /** Arrow keys nudge the focused handle, so it is usable without a pointer. */
  onResizeKey(target: 'banner' | 'header', event: KeyboardEvent): void {
    const step = event.shiftKey ? 10 : 1;
    const delta = event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0;
    if (!delta) return;
    event.preventDefault();
    event.stopPropagation();
    if (target === 'banner') this.setBannerReferenceHeight(this.previewBannerReferenceHeight + delta);
    else this.setHeaderCollapsedHeight(this.previewCollapsedHeight + delta);
  }

  /** Double-click restores whatever that edge defaults to for the current mode. */
  onResizeReset(target: 'banner' | 'header'): void {
    if (target === 'header') {
      this.f['collapsedHeight'].setValue(HEADER_BANNER_COLLAPSED_DEFAULT);
      return;
    }
    if (this.f['heightMode'].value === 'fixed') {
      this.f['maxHeight'].setValue(HEADER_BANNER_HEIGHT_DEFAULT);
      return;
    }
    this.f['aspectRatio'].setValue(
      this.f['orientation'].value === 'vertical'
        ? HEADER_BANNER_VERTICAL_ASPECT_RATIO
        : HEADER_BANNER_HORIZONTAL_ASPECT_RATIO
    );
  }

  /**
   * Live banner size readout.
   *
   * Responsive mode reports the reference height plus the ratio it produced,
   * because the pixels on a 768px tablet are not the number that gets stored.
   */
  get previewBannerReadout(): string {
    const height = Math.round(this.previewBannerReferenceHeight);
    if (this.f['heightMode'].value === 'fixed') return `${height} px`;
    return `${height} px @ ${HEADER_BANNER_REFERENCE_WIDTH} px · ${this.resolvedAspectRatio.toFixed(2)}:1`;
  }

  get previewHeaderReadout(): string {
    return `${Math.round(this.previewCollapsedHeight)} px`;
  }

  /**
   * Compact label for the pill sitting on the handle itself.
   *
   * The full readouts above the frame are for reading; the pill is for spotting,
   * so it carries the number alone - at 360px wide there is not room for more.
   */
  get previewBannerHandleLabel(): string {
    return `${Math.round(this.previewBannerReferenceHeight)}px`;
  }

  get previewHeaderHandleLabel(): string {
    return `${Math.round(this.previewCollapsedHeight)}px`;
  }

  // ------------------------------------------------------------------ loading

  loadBanner(id: string): void {
    console.warn('[HB] loadBanner ->', id, 'routeId=', this.route.snapshot.paramMap.get('id'));
    this.isLoading = true;
    this.api.get_private(`v1/admin/header-banner/${id}`).subscribe({
      next: (banner: AdminHeaderBannerListInterface) => {
        console.warn('[HB] loadBanner OK', id, banner?.campaignName, 'city=', JSON.stringify(banner?.city));
        this.selected = banner;
        this.patchForm(banner);
        // Drives the autocomplete display; the stored id alone would render blank.
        this.cityCtrl.setValue((banner.city as any)?.id ?? null);
        this.draftDirty = false;
        this.isLoading = false;
        this.loadHistory(id);
      },
      error: (error: any) => {
        console.warn('[HB] loadBanner FAILED', id, error);
        this.isLoading = false;
        this.util.handleError(error, 'admin');
      },
    });
  }

  patchForm(banner: AdminHeaderBannerListInterface): void {
    const city: any = banner.city;
    this.headerBannerForm.patchValue({
      campaignName: banner.campaignName ?? '',
      subtitle: banner.subtitle ?? '',
      isActive: banner.isActive !== false,
      media: banner.media ?? 'image',
      orientation: banner.orientation ?? 'horizontal',
      aspectRatio: banner.aspectRatio ?? null,
      heightMode: banner.heightMode ?? 'responsive',
      maxHeight: banner.maxHeight ?? HEADER_BANNER_HEIGHT_DEFAULT,
      image: banner.image ?? '',
      mediaUrl: banner.mediaUrl ?? '',
      title: banner.title ?? '',
      ctaText: banner.ctaText ?? '',
      showCta: banner.showCta !== false,
      ctaPreset: banner.ctaPreset ?? 'default',
      ctaStyle: banner.ctaStyle ?? 'solid',
      ctaBackgroundColor: banner.ctaBackgroundColor ?? '',
      ctaTextColor: banner.ctaTextColor ?? '',
      // `?? preset` rather than `?? literal`: a record saved before these fields existed
      // has them undefined, and the preset table is the single place the defaults live.
      ctaCornerRadius: banner.ctaCornerRadius ?? HEADER_BANNER_CTA_PRESETS.default.cornerRadius,
      ctaFontSize: banner.ctaFontSize ?? HEADER_BANNER_CTA_PRESETS.default.fontSize,
      ctaPaddingX: banner.ctaPaddingX ?? HEADER_BANNER_CTA_PRESETS.default.paddingX,
      ctaPaddingY: banner.ctaPaddingY ?? HEADER_BANNER_CTA_PRESETS.default.paddingY,
      ctaFullWidth: banner.ctaFullWidth === true,
      ctaShowArrow: banner.ctaShowArrow !== false,
      ctaAnimation: banner.ctaAnimation ?? 'none',
      ctaAnimationDuration: banner.ctaAnimationDuration ?? 1200,
      ctaAnimationLoop: banner.ctaAnimationLoop === true,
      ctaAction: banner.ctaAction ?? '',
      ctaTarget: banner.ctaTarget ?? '',
      deepLink: banner.deepLink ?? '',
      enableOverlayText: banner.enableOverlayText !== false,
      displayDuration: banner.displayDuration ?? 5,
      appBarBackgroundMode: banner.appBarBackgroundMode ?? 'auto',
      appBarBackgroundColor: banner.appBarBackgroundColor ?? HEADER_BANNER_DEFAULT_BACKGROUND_COLOR,
      appBarGradientFrom: banner.appBarGradientFrom ?? HEADER_BANNER_DEFAULT_GRADIENT_FROM,
      appBarGradientTo: banner.appBarGradientTo ?? HEADER_BANNER_DEFAULT_GRADIENT_TO,
      extractedColors: banner.extractedColors ?? [],
      collapsedHeight: banner.collapsedHeight ?? HEADER_BANNER_COLLAPSED_DEFAULT,
      showLocation: banner.showLocation !== false,
      showLanguageSelector: banner.showLanguageSelector !== false,
      showNotificationIcon: banner.showNotificationIcon !== false,
      lottieAutoPlay: banner.lottieAutoPlay !== false,
      lottieLoop: banner.lottieLoop !== false,
      lottieSpeed: banner.lottieSpeed ?? 1,
      lottieFit: banner.lottieFit ?? 'cover',
      lottieAlignment: banner.lottieAlignment ?? 'center',
      mediaOffsetX: banner.mediaOffsetX ?? 0,
      mediaOffsetY: banner.mediaOffsetY ?? 0,
      overlayOffsetX: banner.overlayOffsetX ?? 0,
      overlayOffsetY: banner.overlayOffsetY ?? 0,
      ctaOffsetX: banner.ctaOffsetX ?? 0,
      ctaOffsetY: banner.ctaOffsetY ?? 0,
      mediaScale: banner.mediaScale ?? HEADER_BANNER_MEDIA_SCALE_DEFAULT,
      scheduleType: banner.scheduleType ?? 'alwaysOn',
      startDate: banner.startDate ? new Date(banner.startDate) : null,
      endDate: banner.endDate ? new Date(banner.endDate) : null,
      startTime: banner.startTime ?? '00:00',
      endTime: banner.endTime ?? '23:59',
      timezone: banner.timezone ?? 'Asia/Kolkata',
      repeat: banner.repeat ?? 'No Repeat',
      city: typeof city === 'string' ? city : city?.id ?? '',
      priority: banner.priority ?? 1,
      translations: banner.translations ?? [],
      subtitleTranslations: banner.subtitleTranslations ?? [],
    });
    this.refreshStatusChip();
    // After the city and ctaTarget are in the form, so the pickers can scope their
    // requests and back-fill the stored target's label.
    this.hydrateCtaPickers();
  }

  onSelectBanner(banner: AdminHeaderBannerListInterface): void {
    const id = banner?.id;
    console.warn('[HB] onEdit clicked', id);
    if (!id) {
      console.warn('[HB] row carries no id, refusing to open the editor', banner);
      return;
    }
    // Drive the current instance as well as the route.
    //
    // `header-banner/manage/:id` is a separate route entry, so Angular is expected to
    // rebuild this component - but relying on that made the whole flow conditional on
    // an optimisation detail nobody can see from the code. Doing both means the form
    // loads and the tab switches whether or not the instance is replaced; the rebuilt
    // instance simply repeats the same two steps from its own `ngOnInit`.
    this.loadBanner(id);
    this.tabIndex = 1;

    this.router.navigate(['admin/promotion-management/header-banner/manage', id]).then(
      () => console.warn('[HB] navigate OK', id),
      (err: any) => console.warn('[HB] navigate FAILED', id, err)
    );
  }

  /** Opens the same banner directly on the publish-history tab. */
  onSelectHistory(banner: AdminHeaderBannerListInterface): void {
    const id = banner?.id;
    if (!id) return;
    this.loadBanner(id);
    this.tabIndex = 8;
    this.router.navigate(['admin/promotion-management/header-banner/manage', id], {
      queryParams: { tab: 'history' },
    });
  }

  onNewBanner(): void {
    this.selected = null;
    this.draftId = null;
    this.history = [];
    this.draftDirty = false;
    this.draftSavedAt = null;
    this.headerBannerForm.reset({
      campaignName: '',
      subtitle: '',
      isActive: true,
      media: 'image',
      orientation: 'horizontal',
      aspectRatio: null,
      heightMode: 'responsive',
      maxHeight: HEADER_BANNER_HEIGHT_DEFAULT,
      image: '',
      mediaUrl: '',
      title: '',
      ctaText: '',
      showCta: true,
      ctaPreset: 'default',
      ctaStyle: 'solid',
      ctaBackgroundColor: '',
      ctaTextColor: '',
      ctaCornerRadius: HEADER_BANNER_CTA_PRESETS.default.cornerRadius,
      ctaFontSize: HEADER_BANNER_CTA_PRESETS.default.fontSize,
      ctaPaddingX: HEADER_BANNER_CTA_PRESETS.default.paddingX,
      ctaPaddingY: HEADER_BANNER_CTA_PRESETS.default.paddingY,
      ctaFullWidth: false,
      ctaShowArrow: true,
      ctaAnimation: 'none',
      ctaAnimationDuration: 1200,
      ctaAnimationLoop: false,
      ctaAction: '',
      ctaTarget: '',
      deepLink: '',
      enableOverlayText: true,
      displayDuration: 5,
      appBarBackgroundMode: 'auto',
      appBarBackgroundColor: HEADER_BANNER_DEFAULT_BACKGROUND_COLOR,
      appBarGradientFrom: HEADER_BANNER_DEFAULT_GRADIENT_FROM,
      appBarGradientTo: HEADER_BANNER_DEFAULT_GRADIENT_TO,
      extractedColors: [],
      collapsedHeight: HEADER_BANNER_COLLAPSED_DEFAULT,
      showLocation: true,
      showLanguageSelector: true,
      showNotificationIcon: true,
      lottieAutoPlay: true,
      lottieLoop: true,
      lottieSpeed: 1,
      lottieFit: 'cover',
      lottieAlignment: 'center',
      mediaOffsetX: 0,
      mediaOffsetY: 0,
      overlayOffsetX: 0,
      overlayOffsetY: 0,
      ctaOffsetX: 0,
      ctaOffsetY: 0,
      mediaScale: HEADER_BANNER_MEDIA_SCALE_DEFAULT,
      scheduleType: 'alwaysOn',
      startDate: null,
      endDate: null,
      startTime: '00:00',
      endTime: '23:59',
      timezone: 'Asia/Kolkata',
      repeat: 'No Repeat',
      city: '',
      priority: 1,
      translations: [],
      subtitleTranslations: [],
    });
    this.cityCtrl.setValue(null);
    this.refreshStatusChip();
    this.tabIndex = 1;
  }

  onListRefresh(): void {
    this.bannerList?.getList();
  }

  refreshStatusChip(): void {
    const banner = this.selected;
    const now = new Date();
    const start = this.f['startDate'].value;
    const end = this.f['endDate'].value;
    let label = 'active';
    // Read the switch the operator can actually see. `selected.status` is never
    // written by this form - only the list toggle owns that field - so reading it
    // here produced a chip that contradicted the `isActive` switch on screen.
    if (!banner || !this.f['isActive'].value) label = 'inactive';
    else if (start && now < start) label = 'scheduled';
    else if (end && now > end) label = 'inactive';
    this.statusChip = { label, active: label === 'active' };
  }

  // ------------------------------------------------------------------ persistence

  /**
   * Builds the wire payload.
   *
   * The admin `ApiService` posts `application/x-www-form-urlencoded`, so empty strings
   * are normalised to `null` here rather than relying on the server's coercion — an
   * empty city means "global" and must not arrive as `""`.
   */
  buildPayload(): any {
    const value: any = this.headerBannerForm.getRawValue();
    const nullify = (v: any) => (v === '' || v === undefined ? null : v);

    return {
      ...value,
      subtitle: nullify(value.subtitle),
      mediaUrl: nullify(value.mediaUrl),
      aspectRatio: value.aspectRatio === null || value.aspectRatio === ('' as any) ? null : Number(value.aspectRatio),
      ctaText: nullify(value.ctaText),
      showCta: value.showCta,
      // Empty means "follow the app theme", which is how the button behaved before these
      // fields existed. Sending '' would store a colour-less string that the colour picker
      // would render as unset anyway.
      ctaBackgroundColor: nullify(value.ctaBackgroundColor),
      ctaTextColor: nullify(value.ctaTextColor),
      ctaCornerRadius: Number(value.ctaCornerRadius),
      ctaFontSize: Number(value.ctaFontSize),
      ctaPaddingX: Number(value.ctaPaddingX),
      ctaPaddingY: Number(value.ctaPaddingY),
      ctaAnimationDuration: Number(value.ctaAnimationDuration),
      ctaAction: nullify(value.ctaAction),
      ctaTarget: nullify(value.ctaTarget),
      deepLink: nullify(value.deepLink),
      appBarBackgroundColor: nullify(value.appBarBackgroundColor),
      appBarGradientFrom: nullify(value.appBarGradientFrom),
      appBarGradientTo: nullify(value.appBarGradientTo),
      startDate: value.startDate ? new Date(value.startDate).toISOString() : null,
      endDate: value.endDate ? new Date(value.endDate).toISOString() : null,
      city: nullify(value.city),
      maxHeight: Number(value.maxHeight),
      collapsedHeight: Number(value.collapsedHeight),
      mediaScale: Number(value.mediaScale),
      displayDuration: Number(value.displayDuration),
      lottieSpeed: Number(value.lottieSpeed),
      priority: Number(value.priority),
    };
  }

  onSaveDraft(): void {
    this.haveSubmitClicked = true;
    if (!this.f['campaignName'].value) {
      this.util.onError('required', '');
      return;
    }
    this.isSubmit = true;
    this.api.post_private('v1/admin/header-banner/drafts', {
      headerBanner: this.selected?.id ?? null,
      draftId: this.draftId ?? null,
      payload: this.buildPayload(),
    }).subscribe({
      next: (draft: any) => {
        this.isSubmit = false;
        this.draftId = draft?.id ?? null;
        this.draftDirty = false;
        this.draftSavedAt = new Date();
        this.util.onSuccess('ts_draft_saved');
      },
      error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'admin');
      },
    });
  }

  onPublish(): void {
    this.haveSubmitClicked = true;
    if (!this.f['campaignName'].value) {
      this.util.onError('required', '');
      return;
    }

    const payload = this.buildPayload();

    // A saved draft is always promoted: only `publishDraft` merges a draft onto an
    // existing document and retires the draft row in the same transaction.
    if (this.draftId) {
      this.isSubmit = true;
      this.api.patch_private(`v1/admin/header-banner/drafts/${this.draftId}/publish`, payload).subscribe({
        next: (banner: any) => this.onPublished(banner),
        error: (error: any) => {
          this.isSubmit = false;
          this.util.handleError(error, 'admin');
        },
      });
      return;
    }

    // No draft, so branch on whether a banner is actually open - NOT on the draft.
    // `loadBanner` cannot restore `draftId`, so the draft flag is always null when an
    // existing banner is edited, and the old code POSTed here. That meant Publish
    // created a brand new document instead of updating the one on screen, the
    // original was left untouched, and `PATCH /v1/admin/header-banner/:id` - the one
    // endpoint that can actually update - was unreachable code.
    this.isSubmit = true;
    const bannerId: string | null = this.selected?.id ?? null;
    const request = bannerId
      ? this.api.patch_private(`v1/admin/header-banner/${bannerId}`, payload)
      : this.api.post_private('v1/admin/header-banner/', payload);
    request.subscribe({
      next: (banner: any) => this.onPublished(banner),
      error: (error: any) => {
        this.isSubmit = false;
        this.util.handleError(error, 'admin');
      },
    });
  }

  private onPublished(banner: any): void {
    this.isSubmit = false;
    this.selected = banner;
    this.draftId = null;
    this.draftDirty = false;
    this.draftSavedAt = null;
    this.util.onSuccess('ts_published');
    this.refreshStatusChip();
    this.onListRefresh();
    if (banner?.id) this.loadHistory(banner.id);
  }

  onDiscardDraft(): void {
    if (!this.draftId) return;
    this.api.delete_private(`v1/admin/header-banner/drafts/${this.draftId}`).subscribe({
      next: () => {
        this.draftId = null;
        this.draftDirty = false;
        this.draftSavedAt = null;
        this.util.onSuccess('ts_draft_discarded');
      },
      error: (error: any) => this.util.handleError(error, 'admin'),
    });
  }

  loadHistory(id: string): void {
    const httpParams = new HttpParams().set('limit', 20).set('page', 1).set('headerBanner', id);
    this.api.get_private('v1/admin/header-banner/publish-history?' + httpParams.toString()).subscribe({
      next: (response: any) => (this.history = response?.results ?? []),
      error: () => (this.history = []),
    });
  }

  // ------------------------------------------------------------------ media helpers

  onMediaChange(): void {
    if (this.isLottie || this.isVideo) {
      // These need a URL rather than an uploaded poster.
      this.f['image'].setValue('');
    } else {
      this.f['mediaUrl'].setValue('');
    }
  }

  onOrientationChange(): void {
    this.f['aspectRatio'].setValue(
      this.f['orientation'].value === 'vertical'
        ? HEADER_BANNER_VERTICAL_ASPECT_RATIO
        : HEADER_BANNER_HORIZONTAL_ASPECT_RATIO
    );
  }

  onBackgroundModeChange(mode: string): void {
    this.refreshStatusChip();
    if (mode === 'gradient') {
      this.f['appBarGradientFrom'].setValue(HEADER_BANNER_DEFAULT_GRADIENT_FROM);
      this.f['appBarGradientTo'].setValue(HEADER_BANNER_DEFAULT_GRADIENT_TO);
    }
  }

  onImageChange(value: string): void {
    this.f['image'].setValue(value);
  }

  /** Lottie stores its asset path in `mediaUrl`, matching the customer payload. */
  onLottieChange(value: string): void {
    this.f['mediaUrl'].setValue(value);
  }

  onPaletteChange(value: string[]): void {
    this.f['extractedColors'].setValue(value);
  }

  onScheduleTypeChange(type: string): void {
    if (type === 'alwaysOn') {
      this.f['startDate'].setValue(null);
      this.f['endDate'].setValue(null);
    }
    this.refreshStatusChip();
  }
}