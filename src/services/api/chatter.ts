import type { PagedResult } from '@/types/api';
import type { Activity, Attachment, Comment } from '@/types/erp';

import { http } from './client';

/**
 * Collaboration sub-resources every record exposes under its own path:
 * `/{resource}/{id}/activities|comments|attachments`.
 */
export function createChatterApi(recordPath: string) {
  const base = recordPath.replace(/\/+$/, '');
  return {
    activities: (signal?: AbortSignal) =>
      http.get<PagedResult<Activity>>(`${base}/activities`, { params: { pageSize: 100 }, signal }),
    comments: (signal?: AbortSignal) =>
      http.get<PagedResult<Comment>>(`${base}/comments`, { params: { pageSize: 100 }, signal }),
    addComment: (body: string) =>
      http.post<Comment, { body: string }>(`${base}/comments`, { body }),
    attachments: (signal?: AbortSignal) =>
      http.get<PagedResult<Attachment>>(`${base}/attachments`, {
        params: { pageSize: 100 },
        signal,
      }),
    upload: (file: File, onProgress?: (percent: number) => void) => {
      const form = new FormData();
      form.append('file', file);
      return http.post<Attachment, FormData>(`${base}/attachments`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total) onProgress?.(Math.round((event.loaded / event.total) * 100));
        },
      });
    },
    removeAttachment: (attachmentId: string) =>
      http.delete<void>(`${base}/attachments/${encodeURIComponent(attachmentId)}`),
  };
}

export type ChatterApi = ReturnType<typeof createChatterApi>;
