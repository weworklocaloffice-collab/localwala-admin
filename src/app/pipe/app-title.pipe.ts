import { Injectable, inject, Injector } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { environment } from 'src/environments/environment';
import { UtilService } from '../services/util-service';

@Injectable()
export class AppTitlePrefix extends TitleStrategy {

  private readonly title = inject(Title);
  private readonly injector = inject(Injector);

  override updateTitle(snapshot: RouterStateSnapshot): void {

    let route = snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }

    const rawTitle = route.data?.['title'];

    if (!rawTitle) {
      this.title.setTitle(environment.appName);
      return;
    }

    // 🔥 Lazy resolve UtilService HERE
    const util = this.injector.get(UtilService);

    const translated = util.appTranslate(rawTitle) ?? rawTitle;

    const finalTitle =
      translated !== rawTitle
        ? `${translated} - ${environment.appName}`
        : environment.appName;

    this.title.setTitle(finalTitle);
  }
}
