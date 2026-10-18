import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UtilService } from './util-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  baseUrl = environment.apiUrl;
  defaultCountryCode = environment.defaultCountryCode;
  mediaUrl = '';

  constructor(
    private http: HttpClient,
    private util: UtilService
  ) {

    const cc: string = environment.defaultCountryCode.toString();
    if (!cc.includes('+')) {
      this.defaultCountryCode = '+' + environment.defaultCountryCode;
    }

  }

  JSON_to_URLEncoded(element: any, key?: any, list?: any) {
    let new_list = list || [];

    if (typeof element === 'object') {
      for (let idx in element) {
        this.JSON_to_URLEncoded(
          element[idx],
          key ? key + "[" + idx + "]" : idx,
          new_list
        );
      }
    } else {
      new_list.push(key + "=" + encodeURIComponent(element));
    }

    return new_list.join("&");
  }

  private formHeader() {
    return {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/x-www-form-urlencoded'),
      withCredentials: true
    };
  }

  private jsonHeader() {
    return {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json'),
      withCredentials: true
    };
  }

  getLocalAssets(name: string): Promise<any> {
    return new Promise((resolve, reject) => {

      this.http.get('assets/jsons/' + name)
        .subscribe({
          next: res => resolve(res),
          error: err => reject(err)
        });

    });
  }

  post_public(url: string, body: any): Observable<any> {
    return this.http.post(
      this.baseUrl + url,
      this.JSON_to_URLEncoded(body),
      this.formHeader()
    );
  }

  post_private(url: string, body: any): Observable<any> {
    return this.http.post(
      this.baseUrl + url,
      this.JSON_to_URLEncoded(body),
      this.formHeader()
    );
  }

  refreshToken(): Observable<any> {
    return this.http.post(
      this.baseUrl + 'v1/auth/refresh-tokens-web',
      {},
      this.jsonHeader()
    );
  }

  get_private(url: string): Observable<any> {
    return this.http.get(
      this.baseUrl + url,
      this.formHeader()
    );
  }

  export_collection(url: string): Observable<any> {

    return this.http.get(
      this.baseUrl + url,
      {
        ...this.formHeader(),
        responseType: 'blob'
      }
    );

  }

  get_public(url: string): Observable<any> {
    return this.http.get(
      this.baseUrl + url,
      this.formHeader()
    );
  }

  delete_private(url: string): Observable<any> {
    return this.http.delete(
      this.baseUrl + url,
      this.formHeader()
    );
  }

  patch_private(url: string, body: any): Observable<any> {
    return this.http.patch(
      this.baseUrl + url,
      this.JSON_to_URLEncoded(body),
      this.formHeader()
    );
  }

  uploadFile(file: File) {

    const formData = new FormData();
    formData.append('fileName', file);
    formData.append('uid', this.util.getItem('_uid'));

    return this.http.post(
      this.baseUrl + 'v1/file/web_upload_image',
      formData,
      { withCredentials: true }
    );

  }

  uploadFilePublic(file: File) {

    const formData = new FormData();
    formData.append('fileName', file);
    formData.append('uid', this.util.getItem('_uid'));

    return this.http.post(
      this.baseUrl + 'v1/public/uploadImage/',
      formData,
      { withCredentials: true }
    );

  }

  /**
   * Header banner media upload.
   *
   * Separate from `uploadFile` because that route is image-only by platform policy and
   * Lottie payloads are JSON. `kind` selects the server side validation: `image` runs
   * magic-byte checks, `lottie` accepts `.json` (parsed and shape checked) and
   * `.lottie`/`.zip` (dotLottie).
   */
  uploadHeaderBannerAsset(file: File, kind: 'image' | 'lottie') {

    const formData = new FormData();
    formData.append('fileName', file);
    formData.append('kind', kind);
    formData.append('uid', this.util.getItem('_uid'));

    return this.http.post(
      this.baseUrl + 'v1/admin/header-banner/upload',
      formData,
      { withCredentials: true }
    );

  }

  download_export_file(blob: Blob, filename: string) {

    const link = document.createElement('a');

    link.href = window.URL.createObjectURL(blob);
    link.download = filename;

    link.click();

  }

  importCollection(file: File, type: string, uploadUrl: string) {

    const formData = new FormData();

    formData.append('file', file);
    formData.append('type', type);

    return this.http.post(
      this.baseUrl + uploadUrl,
      formData,
      { withCredentials: true }
    );

  }

}
