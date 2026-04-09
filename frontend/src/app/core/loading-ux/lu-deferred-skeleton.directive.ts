import {
  Directive,
  Input,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

/**
 * Renders the template only after `loading` stays true for 300ms.
 * Prevents skeleton flicker on fast API responses.
 */
@Directive({
  selector: '[luDeferredSkeleton]',
  standalone: true,
})
export class LuDeferredSkeletonDirective implements OnDestroy {
  private static readonly delayMs = 300;

  private timer: ReturnType<typeof setTimeout> | null = null;
  private wantsShow = false;

  constructor(
    private readonly tpl: TemplateRef<unknown>,
    private readonly vcr: ViewContainerRef,
  ) {}

  @Input()
  set luDeferredSkeleton(loading: boolean) {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.wantsShow = loading;
    this.vcr.clear();
    if (!loading) {
      return;
    }
    this.timer = setTimeout(() => {
      this.timer = null;
      if (this.wantsShow) {
        this.vcr.createEmbeddedView(this.tpl);
      }
    }, LuDeferredSkeletonDirective.delayMs);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.vcr.clear();
  }
}
