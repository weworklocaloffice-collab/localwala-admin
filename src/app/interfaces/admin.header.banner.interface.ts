export interface AdminHeaderBannerTranslationInterface {
  name?: string;
  code?: string;
  nativeName?: string;
  value?: string;
}

export interface AdminHeaderBannerCityInterface {
  id?: string;
  name?: string;
  translations?: AdminHeaderBannerTranslationInterface[];
  displayName?: string;
}

/** `image` | `lottie` | `video` — media renders in the banner slot only. */
export type AdminHeaderBannerMedia = 'image' | 'lottie' | 'video';

/** `horizontal` (16:9) | `vertical` (3:4) */
export type AdminHeaderBannerOrientation = 'horizontal' | 'vertical';

/** `responsive` (derive from width) | `fixed` */
export type AdminHeaderBannerHeightMode = 'responsive' | 'fixed';

/** `auto` (sample from banner) | `manual` | `gradient` */
export type AdminHeaderAppBarBackgroundMode = 'auto' | 'manual' | 'gradient';

/** `alwaysOn` | `dateRange` */
export type AdminHeaderBannerScheduleType = 'alwaysOn' | 'dateRange';

export type AdminHeaderBannerLottieFit = 'contain' | 'fill' | 'cover' | 'fitWidth' | 'fitHeight' | 'none' | 'scaleDown';

export type AdminHeaderBannerLottieAlignment =
  | 'topLeft'
  | 'topCenter'
  | 'topRight'
  | 'centerLeft'
  | 'center'
  | 'centerRight'
  | 'bottomLeft'
  | 'bottomCenter'
  | 'bottomRight';

/**
 * CTA verbs the Flutter client knows how to route.
 * Anything else falls through to the deepLink/ctaTarget URL branch.
 */
export type AdminHeaderBannerCtaAction =
  | 'open_restaurant_list'
  | 'restaurant_list'
  | 'open_search'
  | 'category'
  | 'restaurant'
  | '';

export interface AdminHeaderBannerListInterface {
  id?: string;
  campaignName?: string;
  title?: string;
  subtitle?: string;
  translations?: AdminHeaderBannerTranslationInterface[];
  subtitleTranslations?: AdminHeaderBannerTranslationInterface[];

  media?: AdminHeaderBannerMedia;
  mediaUrl?: string;
  image?: string;

  orientation?: AdminHeaderBannerOrientation;
  aspectRatio?: number;
  heightMode?: AdminHeaderBannerHeightMode;
  maxHeight?: number;

  ctaText?: string;
  ctaAction?: AdminHeaderBannerCtaAction;
  ctaTarget?: string;
  deepLink?: string;
  enableOverlayText?: boolean;

  /** Show the CTA button. Independent of `enableOverlayText`, which also covers title/subtitle. */
  showCta?: boolean;

  // CTA appearance. See `HEADER_BANNER_CTA_PRESETS` for what the presets write.
  ctaPreset?: AdminHeaderBannerCtaPreset;
  ctaStyle?: AdminHeaderBannerCtaStyle;
  /** Null means the app's theme primary, which is how the CTA looked before this existed. */
  ctaBackgroundColor?: string | null;
  /** Null means white. */
  ctaTextColor?: string | null;
  ctaCornerRadius?: number | null;
  ctaFontSize?: number | null;
  ctaPaddingX?: number | null;
  ctaPaddingY?: number | null;
  ctaFullWidth?: boolean;
  ctaShowArrow?: boolean;

  // CTA motion. `none` by default: the button is above the fold on every app open.
  ctaAnimation?: AdminHeaderBannerCtaAnimation;
  ctaAnimationDuration?: number | null;
  ctaAnimationLoop?: boolean;
  displayDuration?: number;

  appBarBackgroundMode?: AdminHeaderAppBarBackgroundMode;
  appBarBackgroundColor?: string;
  appBarGradientFrom?: string;
  appBarGradientTo?: string;
  extractedColors?: string[];
  collapsedHeight?: number;
  showLocation?: boolean;
  showLanguageSelector?: boolean;
  showNotificationIcon?: boolean;

  lottieAutoPlay?: boolean;
  lottieLoop?: boolean;
  lottieSpeed?: number;
  lottieFit?: AdminHeaderBannerLottieFit;
  lottieAlignment?: AdminHeaderBannerLottieAlignment;

  scheduleType?: AdminHeaderBannerScheduleType;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  timezone?: string;
  repeat?: string;

  /** Null or absent means the banner is global and applies to every city. */
  city?: string | AdminHeaderBannerCityInterface | null;
  priority?: number;

  status?: boolean;
  isActive?: boolean;

  createdAt?: string;
  updatedAt?: string;
  /** Present once a draft exists for this banner. */
  hasDraft?: boolean;
  draftId?: string;

  /**
   * Manual nudge of the banner media, as a fraction of the banner box.
   * `-0.5 .. 0.5`; `0` means no nudge. Set by dragging in the preview.
   */
  mediaOffsetX?: number | null;
  mediaOffsetY?: number | null;

  /**
   * Nudge of the title/subtitle block, as a fraction of the banner box.
   * Same units and bounds as the media nudge; independent of it so cropping the
   * artwork does not drag the copy with it.
   */
  overlayOffsetX?: number | null;
  overlayOffsetY?: number | null;

  /** Nudge of the CTA button. Same units and bounds as the media nudge. */
  ctaOffsetX?: number | null;
  ctaOffsetY?: number | null;

  /**
   * Zoom on the banner media, applied on top of the nudge.
   * `1 .. 3`; `1` is the untouched render. Set by dragging the zoom rail in the
   * preview, and is how an operator crops a wide image down to the visible slot.
   */
  mediaScale?: number | null;
}

export interface AdminHeaderBannerListResponseInterface {
  results: AdminHeaderBannerListInterface[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface AdminHeaderBannerHistoryInterface {
  id?: string;
  headerBanner?: string;
  campaignName?: string;
  action?: 'create' | 'update' | 'publish' | 'unpublish' | 'delete';
  snapshot?: any;
  note?: string;
  publishedAt?: string;
  publishedBy?: { name?: string; email?: string };
}

/**
 * One autocomplete option behind the CTA target pickers.
 *
 * Mirrors the rows `API/src/modules/header-banner/services/header.banner.lookup.service.js`
 * returns. `restaurantId` is present on foods only - it is what lets the panel label a
 * dish with the kitchen it belongs to, and what the server hands back to the client so
 * the food modal can resolve pricing.
 *
 * The three lists share one shape so a single filter/display pair serves all of them.
 */
export interface AdminHeaderBannerCtaOptionInterface {
  id: string;
  name: string;
  slug?: string;
  restaurantId?: string;
  image?: string;
  /**
   * One entry per configured language. `title` holds the translation for restaurants and
   * foods, `value` for categories. `name`/`nativeName` inside a row are the LANGUAGE's
   * name, never a translation - do not read them as one.
   */
  translations?: { code?: string; name?: string; nativeName?: string; value?: string; title?: string }[];
}

/** Which lookup list the panel should ask the endpoint for. */
export type AdminHeaderBannerCtaLookupKind = 'restaurant' | 'food' | 'category';

/** Fill treatment of the CTA button. */
export type AdminHeaderBannerCtaStyle = 'solid' | 'outline' | 'ghost';

/** Motion played on the CTA button. `none` is the default. */
export type AdminHeaderBannerCtaAnimation =
  | 'none'
  | 'pulse'
  | 'heartbeat'
  | 'wiggle'
  | 'shake'
  | 'glow'
  | 'shimmer'
  | 'arrowSlide'
  | 'borderRunner'
  | 'bounce'
  | 'fadeIn'
  | 'slideUp'
  | 'zoomIn'
  | 'flipIn'
  | 'pressDown'
  | 'rainbow'
  | 'goldenShine';

/**
 * How an effect behaves, which is what decides whether the loop toggle is offered.
 *
 * `entrance` effects play once on appear; the client ignores `ctaAnimationLoop` for them
 * and the panel hides the toggle, because a repeating entrance reads as a glitch rather
 * than an effect. `interaction` is driven by touch, so `duration` does not apply.
 */
export type AdminHeaderBannerCtaAnimationGroup = 'attention' | 'entrance' | 'interaction' | 'festive';

export interface AdminHeaderBannerCtaAnimationDefinition {
  group: AdminHeaderBannerCtaAnimationGroup;
  /** Whether "Loop forever" is meaningful for this effect. */
  loopable: boolean;
}

export const HEADER_BANNER_CTA_ANIMATION_GROUPS: AdminHeaderBannerCtaAnimationGroup[] = [
  'attention',
  'entrance',
  'interaction',
  'festive',
];

/**
 * Every effect, grouped so the dropdown can present families rather than one flat list.
 *
 * `hoverLift` and `magnetic` are deliberately absent: neither has meaning on a touch
 * screen, and a button that moves away from the finger on a home-screen banner is an
 * accessibility problem. `ripple` is absent because the banner already sits inside an
 * InkWell, so it is free and unconfigurable.
 */
export const HEADER_BANNER_CTA_ANIMATIONS: Record<AdminHeaderBannerCtaAnimation, AdminHeaderBannerCtaAnimationDefinition> = {
  none: { group: 'attention', loopable: false },

  pulse: { group: 'attention', loopable: true },
  heartbeat: { group: 'attention', loopable: true },
  wiggle: { group: 'attention', loopable: true },
  shake: { group: 'attention', loopable: true },
  glow: { group: 'attention', loopable: true },
  shimmer: { group: 'attention', loopable: true },
  arrowSlide: { group: 'attention', loopable: true },
  borderRunner: { group: 'attention', loopable: true },

  bounce: { group: 'entrance', loopable: false },
  fadeIn: { group: 'entrance', loopable: false },
  slideUp: { group: 'entrance', loopable: false },
  zoomIn: { group: 'entrance', loopable: false },
  flipIn: { group: 'entrance', loopable: false },

  pressDown: { group: 'interaction', loopable: false },

  rainbow: { group: 'festive', loopable: true },
  goldenShine: { group: 'festive', loopable: true },
};

/** Effects grouped for presentation, in the order they should appear in the dropdown. */
export const HEADER_BANNER_CTA_ANIMATION_GROUPS_LISTED: {
  group: AdminHeaderBannerCtaAnimationGroup;
  values: AdminHeaderBannerCtaAnimation[];
}[] = HEADER_BANNER_CTA_ANIMATION_GROUPS.map((group) => ({
  group,
  values: (Object.keys(HEADER_BANNER_CTA_ANIMATIONS) as AdminHeaderBannerCtaAnimation[]).filter(
    (value) => HEADER_BANNER_CTA_ANIMATIONS[value].group === group
  ),
}));

/** Whether the loop toggle should be offered for the current effect. */
export function ctaAnimationIsLoopable(value: AdminHeaderBannerCtaAnimation): boolean {
  return HEADER_BANNER_CTA_ANIMATIONS[value]?.loopable ?? false;
}

/** Flat list of every effect, in registry order. */
export const HEADER_BANNER_CTA_ANIMATIONS_LIST: AdminHeaderBannerCtaAnimation[] = Object.keys(
  HEADER_BANNER_CTA_ANIMATIONS
) as AdminHeaderBannerCtaAnimation[];

export type AdminHeaderBannerCtaPreset = 'default' | 'compact' | 'pill' | 'outline' | 'minimal';

/**
 * One-click starting points for the CTA's appearance.
 *
 * Applying a preset only *writes* these fields; every one of them stays editable
 * afterwards, so a single tweak never forces the operator back to a preset. Colours are
 * deliberately left null in the table so the button keeps following the app theme until
 * someone picks a colour on purpose - baking a hex in here would go stale on a rebrand.
 */
export interface AdminHeaderBannerCtaPresetDefinition {
  style: AdminHeaderBannerCtaStyle;
  cornerRadius: number;
  fontSize: number;
  paddingX: number;
  paddingY: number;
}

export const HEADER_BANNER_CTA_PRESETS: Record<AdminHeaderBannerCtaPreset, AdminHeaderBannerCtaPresetDefinition> = {
  default: { style: 'solid', cornerRadius: 6, fontSize: 12, paddingX: 14, paddingY: 9 },
  compact: { style: 'solid', cornerRadius: 4, fontSize: 11, paddingX: 10, paddingY: 6 },
  pill: { style: 'solid', cornerRadius: 999, fontSize: 12, paddingX: 20, paddingY: 10 },
  outline: { style: 'outline', cornerRadius: 999, fontSize: 12, paddingX: 20, paddingY: 10 },
  minimal: { style: 'ghost', cornerRadius: 0, fontSize: 12, paddingX: 4, paddingY: 4 },
};

/**
 * Fallback CTA background, used when `ctaBackgroundColor` is null.
 *
 * Mirrors `ThemeProvider.primaryColor` in `Customer_app/lib/app/presentation/styles/
 * theme.dart`. The admin panel's own `--mat-sys-primary` is `#fb9778` - a hair different -
 * but the preview deliberately shows what the customer sees rather than what looks native
 * in the admin, because the whole point of the preview is to predict the device.
 */
export const HEADER_BANNER_CTA_FALLBACK_BACKGROUND = '#EF9173';
export const HEADER_BANNER_CTA_FALLBACK_TEXT = '#FFFFFF';

/**
 * Which preview layer a drag is currently moving.
 *
 * The media, the title/subtitle block and the CTA button each carry their own offset
 * pair, so a drag has to say which one it grabbed. `null` means no drag is in flight.
 */
export type AdminHeaderBannerDragLayer = 'media' | 'overlay' | 'cta' | null;

/** Bounds mirrored from `API/src/modules/header-banner/models/header.banner.model.js`. */
export const HEADER_BANNER_HEIGHT_MIN = 130;
export const HEADER_BANNER_HEIGHT_MAX = 210;
export const HEADER_BANNER_HEIGHT_DEFAULT = 170;
export const HEADER_BANNER_COLLAPSED_MIN = 48;
export const HEADER_BANNER_COLLAPSED_MAX = 120;
export const HEADER_BANNER_COLLAPSED_DEFAULT = 64;
export const HEADER_BANNER_HORIZONTAL_ASPECT_RATIO = 16 / 9;
export const HEADER_BANNER_VERTICAL_ASPECT_RATIO = 3 / 4;
/**
 * Width the `130 – 210 px` height band is expressed against.
 *
 * A responsive banner derives its height from the device width, so the same drag
 * would otherwise store a different banner depending on which preview device it
 * was made on. Pointer movement is scaled back into this reference frame before
 * the bounds are applied, so a drag means one thing on a 360px phone and on a
 * 768px tablet alike.
 */
export const HEADER_BANNER_REFERENCE_WIDTH = 360;
/** Narrowest aspect ratio the height band allows at the reference width. */
export const HEADER_BANNER_ASPECT_RATIO_MIN = HEADER_BANNER_REFERENCE_WIDTH / HEADER_BANNER_HEIGHT_MAX;
/** Widest aspect ratio the height band allows at the reference width. */
export const HEADER_BANNER_ASPECT_RATIO_MAX = HEADER_BANNER_REFERENCE_WIDTH / HEADER_BANNER_HEIGHT_MIN;
/**
 * Zoom bounds for the banner media, mirrored from
 * `API/src/modules/header-banner/models/header.banner.model.js`.
 *
 * `1` is the untouched render, so a stored scale is never a silent crop on its own.
 */
export const HEADER_BANNER_MEDIA_SCALE_MIN = 1;
export const HEADER_BANNER_MEDIA_SCALE_MAX = 3;
export const HEADER_BANNER_MEDIA_SCALE_DEFAULT = 1;
/**
 * Height of the search bar the client app bar renders under its toolbar row.
 * Mirrors `HomeAppBarTheme.searchBarHeight`, and is needed here because the app
 * bar and the banner window one shared gradient between them.
 */
export const HEADER_BANNER_SEARCH_BAR_HEIGHT = 55;
export const HEADER_BANNER_DEFAULT_BACKGROUND_COLOR = '#FFE6D3';
export const HEADER_BANNER_DEFAULT_GRADIENT_FROM = '#FFE6D3';
export const HEADER_BANNER_DEFAULT_GRADIENT_TO = '#FFB87A';
export const HEADER_BANNER_MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
export const HEADER_BANNER_MAX_UPLOAD_LABEL = '2 MB';