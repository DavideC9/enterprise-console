import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Section, SectionListResponse, UploadResponse } from '../../shared/models/api.models';

@Injectable({ providedIn: 'root' })
export class SectionsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/sections`;

  getAll(publishedOnly = false) {
    return this.http.get<SectionListResponse>(this.base, {
      params: { published_only: publishedOnly },
    });
  }

  getByKey(key: string) {
    return this.http.get<Section>(`${environment.apiUrl}/content/${key}`);
  }

  create(formData: FormData) {
    return this.http.post<Section>(this.base, formData);
  }

  update(key: string, formData: FormData) {
    return this.http.put<Section>(`${this.base}/${key}`, formData);
  }

  delete(key: string) {
    return this.http.delete<void>(`${this.base}/${key}`);
  }

  uploadMedia(file: File, folder = 'uploads') {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    return this.http.post<UploadResponse>(`${environment.apiUrl}/admin/media`, fd);
  }

  reorder(items: { key: string; sort_order: number }[]) {
    return this.http.patch<{ updated: number }>(
      `${environment.apiUrl}/admin/sections/reorder`,
      { items },
    );
  }
}
