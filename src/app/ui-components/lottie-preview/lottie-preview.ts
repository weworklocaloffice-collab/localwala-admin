import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { ApiService } from 'src/app/services/api-service';
import { UtilService } from 'src/app/services/util-service';
import { AdminHeaderBannerLottieAlignment, AdminHeaderBannerLottieFit } from 'src/app/interfaces/admin.header.banner.interface';
import lottie, { AnimationItem } from 'lottie-web';

/**
 * Renders a stored Lottie animation in the admin preview frame.
 *
 * Two constraints shape this:
 *
 * 1. The asset is fetched through the API rather than from its storage URL. The storage
 *    host serves no CORS headers, so a direct browser fetch is blocked; the API proxy the
 *    panel already talks to is allowed.
 *
 * 2. `fit`/`alignment` mirror the client's BoxFit semantics rather than SVG's
 *    `preserveAspectRatio`. SVG has no equivalent of `fitWidth`, `scaleDown` or `none`, so
 *    the stage is sized to the animation's own aspect ratio and positioned inside the
 *    frame. That reproduces what the app actually draws.
 */
@Component({
  selector: 'app-lottie-preview',
  imports: [CommonModule, MaterialModule],
  templateUrl: './lottie-preview.html',
})
export class LottiePreviewComponent implements OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('host') host?: ElementRef<HTMLDivElement>;

  /** Stored relative path, e.g. `header-banner/lottie/<uuid>.json`. */
  @Input() path: string = '';
  @Input() autoPlay: boolean = true;
  @Input() loop: boolean = true;
  @Input() speed: number = 1;
  @Input() fit: AdminHeaderBannerLottieFit = 'cover';
  @Input() alignment: AdminHeaderBannerLottieAlignment = 'center';
  /** Frame height in px - the banner height the animation is drawn into. */
  @Input() height: number = 170;

  state: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
  errorMessage: string = '';

  stageWidth: number | null = null;
  stageHeight: number | null = null;

  private animation: AnimationItem | null = null;
  private frameWidth = 0;
  private frameHeight = 0;
  private resizeObserver?: ResizeObserver;
  private intrinsic = { width: 0, height: 0 };
  /** Animation fetched before the view existed, flushed in `ngAfterViewInit`. */
  private pendingData: any = null;

  constructor(
    public api: ApiService,
    public util: UtilService
  ) {}

  ngAfterViewInit(): void {
    if (this.pendingData) {
      const data = this.pendingData;
      this.pendingData = null;
      this.render(data);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['height']) {
      this.frameHeight = Number(this.height) || 0;
      queueMicrotask(() => this.measureAndFit());
    }
    if (changes['path']) {
      this.load();
      return;
    }
    // Playback options can be applied without refetching.
    if (this.animation) {
      if (changes['speed']) this.animation.setSpeed(Number(this.speed) || 1);
      if (changes['loop']) this.animation.loop = this.loop;
      if (changes['autoPlay']) {
        if (this.autoPlay) this.animation.play();
        else this.animation.pause();
      }
      if (changes['fit'] || changes['alignment']) this.measureAndFit();
    }
  }

  ngOnDestroy(): void {
    this.destroyAnimation();
    this.resizeObserver?.disconnect();
  }

  get isZipped(): boolean {
    const p = (this.path || '').toLowerCase();
    return p.endsWith('.lottie') || p.endsWith('.zip');
  }

  get frameStyle(): { [key: string]: string } {
    const { justifyContent, alignItems } = this.alignmentStyle;
    return { 'justify-content': justifyContent, 'align-items': alignItems };
  }

  private get alignmentStyle(): { justifyContent: string; alignItems: string } {
    const value = this.alignment || 'center';
    const vertical =
      value.startsWith('top') ? 'flex-start' : value.startsWith('bottom') ? 'flex-end' : 'center';
    const horizontal = value.endsWith('Left')
      ? 'flex-start'
      : value.endsWith('Right')
        ? 'flex-end'
        : 'center';
    return { justifyContent: horizontal, alignItems: vertical };
  }

  private load(): void {
    this.destroyAnimation();
    this.errorMessage = '';
    this.intrinsic = { width: 0, height: 0 };
    this.pendingData = null;

    if (!this.path) {
      this.state = 'idle';
      return;
    }

    // A dotLottie container cannot be handed to lottie-web, so say so rather than
    // rendering an empty frame. The app renders it natively.
    if (this.isZipped) {
      this.state = 'error';
      this.errorMessage = this.util.appTranslate('lottie_preview_unsupported');
      return;
    }

    this.state = 'loading';
    const url = `v1/admin/header-banner/asset?path=${encodeURIComponent(this.path)}`;
    this.api.get_private(url).subscribe({
      next: (response: any) => {
        const animationData = response?.animation;
        if (!animationData) {
          this.state = 'error';
          this.errorMessage = this.util.appTranslate('lottie_preview_unsupported');
          return;
        }
        this.intrinsic = {
          width: Number(animationData.w) || 0,
          height: Number(animationData.h) || 0,
        };
        this.render(animationData);
      },
      error: (error: any) => {
        this.state = 'error';
        const payload = error && error.error ? error.error : null;
        this.errorMessage =
          (payload && payload.message) || this.util.appTranslate('lottie_preview_unsupported');
      },
    });
  }

  private render(animationData: any): void {
    const container = this.host?.nativeElement;
    if (!container) {
      // The view is not mounted yet (inactive tab, or a response that beat first render).
      // Keep the payload so `ngAfterViewInit` can mount it rather than dropping it.
      this.pendingData = animationData;
      return;
    }
    container.innerHTML = '';
    this.animation = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: this.loop,
      autoplay: this.autoPlay,
      animationData,
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
    });
    this.animation.setSpeed(Number(this.speed) || 1);
    this.state = 'ready';
    this.observeResize();
    this.measureAndFit();
  }

  /** The frame width depends on the preview device, so fit is recomputed on resize. */
  private observeResize(): void {
    const container = this.host?.nativeElement?.parentElement;
    if (!container || typeof ResizeObserver === 'undefined') return;
    this.resizeObserver?.disconnect();
    this.resizeObserver = new ResizeObserver(() => this.measureAndFit());
    this.resizeObserver.observe(container);
  }

  private measureAndFit(): void {
    const frame = this.host?.nativeElement?.parentElement;
    if (!frame) return;
    this.frameWidth = frame.clientWidth;
    this.frameHeight = this.frameHeight || frame.clientHeight;
    this.applyFit();
  }

  private applyFit(): void {
    const aw = this.intrinsic.width;
    const ah = this.intrinsic.height;
    const fw = this.frameWidth;
    const fh = this.frameHeight;
    if (!aw || !ah || !fw || !fh) {
      this.stageWidth = null;
      this.stageHeight = null;
      return;
    }

    const scaleCover = Math.max(fw / aw, fh / ah);
    const scaleContain = Math.min(fw / aw, fh / ah);

    switch (this.fit) {
      case 'fill':
        this.stageWidth = fw;
        this.stageHeight = fh;
        return;
      case 'cover':
        this.stageWidth = aw * scaleCover;
        this.stageHeight = ah * scaleCover;
        return;
      case 'fitWidth':
        this.stageWidth = fw;
        this.stageHeight = (fw * ah) / aw;
        return;
      case 'fitHeight':
        this.stageHeight = fh;
        this.stageWidth = (fh * aw) / ah;
        return;
      case 'none':
        this.stageWidth = aw;
        this.stageHeight = ah;
        return;
      case 'scaleDown': {
        const scale = Math.min(1, scaleContain);
        this.stageWidth = aw * scale;
        this.stageHeight = ah * scale;
        return;
      }
      case 'contain':
      default:
        this.stageWidth = aw * scaleContain;
        this.stageHeight = ah * scaleContain;
    }
  }

  private destroyAnimation(): void {
    if (this.animation) {
      this.animation.destroy();
      this.animation = null;
    }
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }
}
