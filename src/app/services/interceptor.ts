import { Injectable, Injector, inject } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ApiService } from './api-service';
import { UtilService } from './util-service';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {

  private isRefreshing = false;

  private injector = inject(Injector);
  private util = inject(UtilService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const authReq = req.clone({
      withCredentials: true
    });

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {

        if (
          error.status === 401 &&
          !req.url.includes('/auth/')
        ) {
          return this.handle401Error(authReq, next);
        }

        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {

    if (!this.isRefreshing) {

      this.isRefreshing = true;

      const api = this.injector.get(ApiService);

      return api.refreshToken().pipe(

        switchMap(() => {

          this.isRefreshing = false;

          return next.handle(request);
        }),

        catchError((error) => {

          this.isRefreshing = false;

          this.util.clearKey('_uid');
          this.util.clearKey('_authRole');

          return throwError(() => error);
        })
      );
    }

    return next.handle(request);
  }
}
