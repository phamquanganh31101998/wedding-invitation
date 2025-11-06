import {
  GetGalleryPhotosRequest,
  GetGalleryPhotosResponse,
  GalleryServiceErrorResponse,
} from './gallery.types';

/**
 * Fetches gallery photos from the API
 */
export async function getGalleryPhotos(
  request: GetGalleryPhotosRequest = {}
): Promise<GetGalleryPhotosResponse> {
  const { tenantSlug, type = 'photo' } = request;

  let url = '/api/gallery';
  const params = new URLSearchParams();

  if (tenantSlug) {
    params.append('tenant', tenantSlug);
  }

  if (type) {
    params.append('type', type);
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    const errorData: GalleryServiceErrorResponse = await response
      .json()
      .catch(() => ({}));
    throw new Error(
      errorData.error ||
        `Failed to fetch gallery photos: ${response.statusText}`
    );
  }

  return response.json();
}
