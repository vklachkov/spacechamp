import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DownloadService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly document: Document = inject(DOCUMENT);

  private getBlob(url: string): Observable<Blob> {
    return this.http.get(url, { responseType: 'blob' });
  }

  downloadBlob(fileName: string, blob: Blob): void {
    const a: HTMLAnchorElement = document.createElement('a')
    const objectUrl = URL.createObjectURL(blob)
    a.href = objectUrl;
    a.download = fileName;
    this.document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(objectUrl);
    this.document.removeChild(a);
  }

  downloadArrayBuffer(fileName: string, buffer: ArrayBuffer, type: string = 'application/pdf'): void {
    const blob: Blob = new Blob([buffer], { type });
    this.downloadBlob(fileName, blob);
  }

  // https://dev.to/angular/angular-file-download-with-progress-985
  download(url: string, name: string): Observable<void> {
    return this.getBlob(url)
      .pipe(
        switchMap((blob: Blob) => {
          this.downloadBlob(name, blob);
          return of(void 0);
        })
      );
  }
}
