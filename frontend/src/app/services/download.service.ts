import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DownloadService {
  private readonly http: HttpClient = inject(HttpClient);

  private downloadBlob(url: string): Observable<Blob> {
    return this.http.get(url, { responseType: 'blob' });
  }

  // https://dev.to/angular/angular-file-download-with-progress-985
  download(url: string, name: string): Observable<null> {
    return this.downloadBlob(url)
      .pipe(
        switchMap((blob: Blob) => {
          const a: HTMLAnchorElement = document.createElement('a')
          const objectUrl = URL.createObjectURL(blob)
          a.href = objectUrl;
          a.download = name;
          document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(objectUrl);
          document.removeChild(a);

          return of(null);
        })
      );
  }
}
