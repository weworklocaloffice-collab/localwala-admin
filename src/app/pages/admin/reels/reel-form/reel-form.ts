import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, map, of, startWith } from 'rxjs';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { DialogReelPreview } from '../dialog-reel-preview/dialog-reel-preview';
import { REEL_TARGETS_BY_VERTICAL, REEL_VERTICALS, isTargetAllowed, suggestReelCta } from '../reels.constants';
import { ReelStatus, ReelTargetType, ReelVertical } from 'src/app/interfaces/admin.reels.interface';

const MAX_BYTES = 200 * 1024 * 1024;
const MAX_SECONDS = 30;

@Component({
  selector: 'app-reel-form',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './reel-form.html',
})
export class ReelForm implements OnDestroy {

  form: FormGroup;
  isEdit = false;
  reelId: string = '';
  status: ReelStatus = 'DRAFT';
  processingStage: string = '';
  processingProgress = 0;
  processingError = '';

  verticals = REEL_VERTICALS;
  targetTypes: ReelTargetType[] = [];

  selectedFile: File | null = null;
  selectedDuration = 0;
  uploadProgress = -1;
  polling = false;
  saving = false;
  private pollTimer: any = null;

  listOfCities: any[] = [];
  listOfLocalities: any[] = [];
  listOfTargets: any[] = [];
  targetsLoading = false;
  targetsError = '';
  cityCtrl = new FormControl('');
  localityCtrl = new FormControl('');
  targetCtrl = new FormControl('');
  cities: Observable<any[]> = of([]);
  localities: Observable<any[]> = of([]);
  targets: Observable<any[]> = of([]);

  constructor(
    public util: UtilService,
    public api: ApiService,
    private http: HttpClient,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
  ) {
    this.form = this.fb.group({
      caption: [''],
      hashtagsText: [''],
      vertical: ['FOOD', Validators.required],
      targetType: ['', Validators.required],
      refId: ['', Validators.required],
      ctaLabel: [''],
      cityId: [''],
      localityId: [''],
      thumbnailUrl: [''],
      publishMode: ['now'],
      publishAt: [''],
    });
    const id = this.route.snapshot.paramMap.get('id');
    this.getCities();
    if (id) {
      this.isEdit = true;
      this.reelId = id;
      this.loadDetail();
    } else {
      this.onVerticalChange();
    }
  }

cityIdOf(item: any): string {
  // Extract ID from city object, validating it's a proper ObjectId format
  let id: string;
  if (item?.id && String(item.id).match(/^[0-9a-f]{24}$/i)) {
    id = String(item.id);
  } else if (item?._id && String(item._id).match(/^[0-9a-f]{24}$/i)) {
    id = String(item._id);
  } else {
    id = '';
  }
  return id;
}

  cityNameOf(item: any): string {
    if (!item) return '';
    if (item.translations instanceof Array) {
      const translation = item.translations.find((t: any) => t.code == this.util.appLocaleName());
      return translation?.value || item.name || '';
    }
    return item.name || '';
  }

  getCities() {
    this.api.get_private('v1/admin/cities/listAllCities').subscribe({
      next: (response: any) => {
        if (response) {
          this.listOfCities = response;
          this.cities = this.cityCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this.filterCities(element) : this.listOfCities.slice()))
          );
          this.resolveStoredCity();
        }
      }, error: (error: any) => {
        this.util.handleError(error, 'admin');
      }
    });
  }

  private filterCities(value: any): any[] {
    const filterValue = String(value?.name || value || '').toLowerCase();
    return this.listOfCities.filter((element) =>
      this.cityNameOf(element).toLowerCase().includes(filterValue)
    );
  }

  displayCityName = (value: any): string => (typeof value === 'string' ? value : this.cityNameOf(value));

  onCitySelect(event: MatAutocompleteSelectedEvent) {
    if (event?.option?.value) {
      const cityId = this.cityIdOf(event.option.value);
      // Patch the form control with the cityId
      this.form.patchValue({ cityId, localityId: '' });
      // Also set cityCtrl directly for the autocomplete display
      this.cityCtrl.setValue(event.option.value);
      this.localityCtrl.setValue('');
      this.getLocalities(cityId);
      // Reset target fields since city changed
      this.form.patchValue({ refId: '' });
      this.targetCtrl.setValue('');
      // Load targets - this now has cityId from form
      this.loadTargets();
    }
  }

  getLocalities(cityId: string) {
    if (!cityId) {
      this.listOfLocalities = [];
      return;
    }
    this.api.get_private('v1/admin/localities/getByCityId/' + cityId).subscribe({
      next: (response: any) => {
        this.listOfLocalities = response || [];
        this.localities = this.localityCtrl.valueChanges.pipe(
          startWith(''),
          map((element) => (element ? this.filterLocalities(element) : this.listOfLocalities.slice()))
        );
        this.resolveStoredLocality();
      }, error: (error: any) => {
        this.util.handleError(error, 'admin');
      }
    });
  }

  private filterLocalities(value: any): any[] {
    const filterValue = String(value?.name || value || '').toLowerCase();
    return this.listOfLocalities.filter((element) =>
      String(element?.name || '').toLowerCase().includes(filterValue)
    );
  }

  displayLocalityName = (value: any): string =>
    typeof value === 'string' ? value : String(value?.name || '');

  onLocalitySelect(event: MatAutocompleteSelectedEvent) {
    if (event?.option?.value) {
      const item = event.option.value;
      this.form.patchValue({ localityId: String(item?.id || item?._id || '') });
    }
  }

  private resolveStoredCity() {
    const stored = this.form.value.cityId;
    if (!stored) return;
    const match = this.listOfCities.find((city) => this.cityIdOf(city) === String(stored));
    if (match) {
      this.cityCtrl.setValue(match);
      this.getLocalities(this.cityIdOf(match));
    }
  }

  private resolveStoredLocality() {
    const stored = this.form.value.localityId;
    if (!stored) return;
    const match = this.listOfLocalities.find(
      (locality) => String(locality?.id || locality?._id || '') === String(stored)
    );
    if (match) this.localityCtrl.setValue(match);
  }

  nameOf(item: any): string {
    if (!item) return '';
    if (Array.isArray(item.translations)) {
      const translation = item.translations.find(
        (t: any) => t && t.code == this.util.appLocaleName()
      );
      const value = translation?.value || translation?.title;
      if (value) return value;
    }
    return item.name || '';
  }

  // FOOD targets are picked from real restaurants/foods; the other verticals
  // still fall back to a raw ObjectId until their pickers are built.
  get isPickerTarget(): boolean {
    const targetType = this.form.value.targetType;
    return targetType === 'RESTAURANT' || targetType === 'PRODUCT';
  }

  get targetPlaceholder(): string {
    // Options are city scoped, so point at the city field until one is picked.
    if (!String(this.form.value.cityId || '').trim()) {
      return this.util.appTranslate('th_choose_city');
    }
    return this.form.value.targetType === 'RESTAURANT'
      ? this.util.appTranslate('choose_restaurant')
      : this.util.appTranslate('choose_food');
  }

  displayTargetName = (value: any): string => (typeof value === 'string' ? value : this.nameOf(value));

  private filterTargets(value: any): any[] {
    const filterValue = String(value?.name || value || '').toLowerCase();
    return this.listOfTargets.filter((element) =>
      this.nameOf(element).toLowerCase().includes(filterValue)
    );
  }

  onTargetSelect(event: MatAutocompleteSelectedEvent) {
    const item = event?.option?.value;
    if (!item) return;
    this.form.patchValue({ refId: String(item?.id || item?._id || '') });
  }

  onTargetTypeChange() {
    this.form.patchValue({ refId: '' });
    this.targetCtrl.setValue('');
    this.loadTargets();
  }

  // Reel target options come from the city the reel is aimed at, so this runs
  // after the city is known (city select, target-type change, edit load).
  private isValidObjectId(id: string): boolean {
  return /^[0-9a-f]{24}$/i.test(id);
}

private getValidCityId(): string {
  // Try form value first
  let cityId = String(this.form.value.cityId || '').trim();
  if (this.isValidObjectId(cityId)) return cityId;
  
  // Fallback to cityCtrl value
  cityId = String(this.cityCtrl.value || '').trim();
  if (this.isValidObjectId(cityId)) return cityId;
  
  return '';
}

  loadTargets() {
    this.listOfTargets = [];
    this.targets = of([]);
    this.targetsError = '';
    if (!this.isPickerTarget) return;

    const cityId = this.getValidCityId();
    if (!cityId) return;
    const targetType = this.form.value.targetType;
    this.targetsLoading = true;
    this.api
      .get_private(`v1/admin/reels/lookups?targetType=${targetType}&cityId=${cityId}`)
      .subscribe({
        next: (response: any) => {
          this.targetsLoading = false;
          const list =
            targetType === 'RESTAURANT' ? response?.restaurants || [] : response?.foods || [];
          this.listOfTargets = list;
          this.targets = this.targetCtrl.valueChanges.pipe(
            startWith(''),
            map((element) => (element ? this.filterTargets(element) : this.listOfTargets.slice()))
          );
          this.resolveStoredTarget();
        },
        error: (error: any) => {
          this.targetsLoading = false;
          this.targetsError =
            'Could not load ' +
            (targetType === 'RESTAURANT' ? 'restaurants' : 'foods') +
            ' for this city. The list will be empty until retried.';
          this.util.handleError(error, 'admin');
        },
      });
  }

  retryLoadTargets() {
    this.loadTargets();
  }

  private resolveStoredTarget() {
    const stored = String(this.form.value.refId || '').trim();
    if (!stored || this.targetCtrl.value) return;
    const match = this.listOfTargets.find((item) => String(item?.id || '') === stored);
    if (match) this.targetCtrl.setValue(match);
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  get suggestedCta(): string {
    const vertical = this.form.value.vertical as ReelVertical;
    const targetType = this.form.value.targetType as ReelTargetType;
    if (!vertical || !targetType) return '';
    return suggestReelCta(vertical, targetType);
  }

  onVerticalChange() {
    const vertical = this.form.value.vertical as ReelVertical;
    this.targetTypes = REEL_TARGETS_BY_VERTICAL[vertical] || [];
    if (!isTargetAllowed(vertical, this.form.value.targetType)) {
      this.form.patchValue({ targetType: this.targetTypes[0] || '' });
    }
  }

  // Bound to the vertical <mat-select>: a new vertical can change the target
  // type, so the already picked target no longer applies.
  onVerticalSelect() {
    this.form.patchValue({ refId: '' });
    this.targetCtrl.setValue('');
    this.onVerticalChange();
    this.loadTargets();
  }

  loadDetail() {
    const spinnerRef = this.util.start();
    this.api.get_private('v1/admin/reels/' + this.reelId).subscribe({
      next: (response: any) => {
        this.util.stop(spinnerRef);
        this.status = response.status || 'DRAFT';
        this.form.patchValue({
          caption: response.description || '',
          hashtagsText: (response.hashtags || []).join(', '),
          vertical: response.vertical || 'FOOD',
          targetType: response.target?.type || '',
          refId: response.target?.refId || '',
          ctaLabel: response.cta?.overridden ? response.cta.label : '',
          cityId: response.cityId || '',
          localityId: response.localityId || '',
          thumbnailUrl: response.media?.thumbnailSource === 'CUSTOM' ? response.media.thumbnailUrl : '',
          publishMode: response.status === 'SCHEDULED' ? 'scheduled' : 'now',
          publishAt: response.publishAt ? response.publishAt.slice(0, 16) : '',
        });
        this.onVerticalChange();
        // Cities may have arrived before the detail (or vice versa) — resolve
        // either way; localities resolve when their own list lands.
        this.resolveStoredCity();
        this.loadTargets();
        if (response.processing) {
          this.processingStage = response.processing.stage || '';
          this.processingProgress = response.processing.progress || 0;
          this.processingError = response.processing.error || '';
        }
      }, error: (error: any) => {
        this.util.stop(spinnerRef);
        this.util.handleError(error, 'admin');
      }
    });
  }

  /**
   * Reports a client-side validation failure.
   *
   * `status: 400` is the part that matters. `handleError` routes on status first, and a
   * bare `{ error: { message } }` has none, so it drops into the generic branch and shows
   * the operator `JSON.stringify` of the object - literally
   * `{"error":{"message":"Only MP4 video is allowed"}}` - instead of the sentence.
   */
  private fail(message: string): void {
    this.util.handleError({ status: 400, error: { message } }, 'admin');
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    this.processingError = '';
    if (!file) return;
    if (file.type !== 'video/mp4') {
      this.fail('Only MP4 video is allowed');
      return;
    }
    if (file.size > MAX_BYTES) {
      this.fail('Video must be under 200 MB');
      return;
    }
    const url = URL.createObjectURL(file);
    const probe = document.createElement('video');
    probe.preload = 'metadata';
    probe.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      if (probe.duration > MAX_SECONDS) {
        this.fail(`Video must be ${MAX_SECONDS} seconds or less`);
        return;
      }
      this.selectedFile = file;
      this.selectedDuration = Math.round(probe.duration);
      this.uploadProgress = -1;
    };
    probe.onerror = () => {
      URL.revokeObjectURL(url);
      this.fail('Could not read this video file');
    };
    probe.src = url;
  }

  detailsPayload() {
    const value = this.form.value;
    const hashtags = String(value.hashtagsText || '')
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0)
      .slice(0, 20);
    const payload: any = {
      caption: value.caption,
      hashtags,
      vertical: value.vertical,
      target: { type: value.targetType, refId: String(value.refId || '').trim() },
    };
    // Never emit empty location values: the urlencoder would turn '' into the
    // literal string "undefined", which the ObjectId validator rejects.
    const cityId = String(value.cityId || '').trim();
    const localityId = String(value.localityId || '').trim();
    if (cityId) payload['cityId'] = cityId;
    if (localityId) payload['localityId'] = localityId;
    if (value.ctaLabel) payload['cta'] = { label: value.ctaLabel };
    if (value.thumbnailUrl) payload['thumbnailUrl'] = value.thumbnailUrl;
    return payload;
  }

  onSaveDraft(done?: () => void) {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.targetsError) {
        this.fail(this.targetsError);
      } else {
        this.fail('Select vertical, target type and the item to promote first');
      }
      return;
    }
    this.saving = true;
    const payload = this.detailsPayload();
    const request = this.isEdit
      ? this.api.patch_private('v1/admin/reels/' + this.reelId, payload)
      : this.api.post_private('v1/admin/reels', payload);
    request.subscribe({
      next: (response: any) => {
        this.saving = false;
        if (!this.isEdit && response && response.id) {
          this.reelId = response.id;
          this.isEdit = true;
        }
        this.util.onSuccess('ts_status_updated');
        if (done) done();
      }, error: (error: any) => {
        this.saving = false;
        this.util.handleError(error, 'admin');
      }
    });
  }

  onUploadAndProcess() {
    if (!this.selectedFile) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.targetsError) {
        this.fail(this.targetsError);
      } else {
        this.fail('Fill vertical, target and item to promote first');
      }
      return;
    }
    const selectedFile = this.selectedFile;
    if (!selectedFile) return;
    const run = () => {
      const spinnerRef = this.util.start();
      const formData = new FormData();
      formData.append('file', selectedFile, selectedFile.name);
      if (this.reelId) formData.append('reelId', this.reelId);
      const value = this.form.value;
      formData.append('vertical', value.vertical || 'FOOD');
      const targetRefId = String(value.refId || '').trim();
      if (targetRefId) formData.append('target', JSON.stringify({ type: value.targetType, refId: targetRefId }));
      if (value.caption) formData.append('caption', value.caption);
      const hashtags = String(value.hashtagsText || '')
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0)
        .slice(0, 20);
      if (hashtags.length) formData.append('hashtags', JSON.stringify(hashtags));
      if (value.ctaLabel) formData.append('cta', JSON.stringify({ label: value.ctaLabel }));
      const cityId = String(value.cityId || '').trim();
      const localityId = String(value.localityId || '').trim();
      if (cityId) formData.append('cityId', cityId);
      if (localityId) formData.append('localityId', localityId);
      // The cover chosen in the form used to be dropped here: the field was only ever
      // sent by `detailsPayload`, so uploading a video through this - the primary path -
      // quietly lost it.
      const thumbnailUrl = String(value.thumbnailUrl || '').trim();
      if (thumbnailUrl) formData.append('thumbnailUrl', thumbnailUrl);
      this.http.post(this.api.baseUrl + 'v1/admin/reels/upload', formData, { withCredentials: true, reportProgress: true, observe: 'events' }).subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploadProgress = Math.round((event.loaded / event.total) * 100);
          } else if (event.type === HttpEventType.Response) {
            this.util.stop(spinnerRef);
            this.uploadProgress = 100;
            const key = event.body?.key;
            const reelId = event.body?.reelId || this.reelId;
            if (reelId) this.reelId = reelId;
            this.isEdit = true;
            // Cleared so the button cannot be pressed again and re-upload the same
            // 200 MB file; `processingStage` is what tells the operator it is done.
            this.selectedFile = null;
            if (key && reelId) {
              this.status = 'PROCESSING';
              this.startPolling();
            } else {
              this.fail('Upload succeeded but response was incomplete');
            }
          }
        }, error: (error: any) => {
          this.util.stop(spinnerRef);
          this.uploadProgress = -1;
          // `handleError` already routes 400/404/401 properly and shows the server's
          // message, so the toast it raises is the whole report. The `alert` that used
          // to sit here dumped a JSON blob over the page and hid that.
          this.util.handleError(error, 'admin');
        }
      });
    };
    if (this.isEdit) {
      this.onSaveDraft(run);
    } else {
      run();
    }
  }

  startPolling() {
    this.stopPolling();
    this.polling = true;
    let attempts = 0;
    this.pollTimer = setInterval(() => {
      attempts++;
      this.api.get_private('v1/admin/reels/' + this.reelId).subscribe({
        next: (response: any) => {
          this.status = response.status;
          this.processingStage = response.processing?.stage || '';
          this.processingProgress = response.processing?.progress || 0;
          this.processingError = response.processing?.error || '';
          // A failed transcode does NOT move `status`: the reel stays PROCESSING and the
          // failure is recorded on `processing.stage`. Testing `status === 'FAILED'` -
          // not a member of the enum - meant every failure polled the full 60 x 5s and
          // the operator waited five minutes to be told what `processingError` already
          // said on the first tick.
          if (response.status === 'READY' || this.processingStage === 'FAILED' || attempts > 60) {
            this.stopPolling();
          }
        }, error: () => {
          if (attempts > 60) this.stopPolling();
        }
      });
    }, 5000);
  }

  stopPolling() {
    this.polling = false;
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  onPreview() {
    if (!this.reelId) return;
    this.dialog.open(DialogReelPreview, { data: { id: this.reelId }, disableClose: false, width: '420px' });
  }

  onPublish() {
    const mode = this.form.value.publishMode;
    if (mode === 'scheduled' && !this.form.value.publishAt) {
      this.fail('Pick a publish date and time');
      return;
    }
    const saveFirst = () => {
      const spinnerRef = this.util.start();
      const body: any = {};
      if (mode === 'scheduled') body['publishAt'] = new Date(this.form.value.publishAt).toISOString();
      this.api.post_private('v1/admin/reels/' + this.reelId + '/publish', body).subscribe({
        next: () => {
          this.util.stop(spinnerRef);
          this.util.onSuccess('ts_status_updated');
          this.router.navigate(['admin/reels/reel-list']);
        }, error: (error: any) => {
          this.util.stop(spinnerRef);
          this.util.handleError(error, 'admin');
        }
      });
    };
    // Unconditional: a new reel has no row yet, so the draft has to be saved before it
    // can be published. This used to be an if/else with two identical branches, which
    // read as if one of them had been meant to skip the save.
    this.onSaveDraft(saveFirst);
  }

}
