import {
  GetTracksRequest,
  GetTracksResponse,
  MusicErrorResponse,
} from './music.types';

/**
 * Fetches music tracks from the API
 */
export async function getTrackList(
  request: GetTracksRequest = {}
): Promise<GetTracksResponse> {
  const { tenantSlug } = request;

  let url = '/api/music/tracks';
  if (tenantSlug) {
    url += `?tenant=${encodeURIComponent(tenantSlug)}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    const errorData: MusicErrorResponse = await response
      .json()
      .catch(() => ({}));
    throw new Error(
      errorData.error || `Failed to fetch tracks: ${response.statusText}`
    );
  }

  return response.json();
}
