import {
  GetGuestRequest,
  GetGuestResponse,
  SubmitGuestRequest,
  SubmitGuestResponse,
  GuestErrorResponse,
} from './guest.types';

/**
 * Fetches guest data by ID from the API
 */
export async function getGuest(
  request: GetGuestRequest
): Promise<GetGuestResponse> {
  const { id, tenantSlug } = request;

  // Build URL with tenant parameter if provided
  let url = `/api/guest?id=${encodeURIComponent(id)}`;
  if (tenantSlug) {
    url += `&tenant=${encodeURIComponent(tenantSlug)}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      // Guest not found - return null data
      return { data: null };
    }

    const errorData: GuestErrorResponse = await response.json();
    throw new Error(errorData.error || 'Failed to fetch guest data');
  }

  return response.json();
}

/**
 * Submits guest RSVP data to the API
 */
export async function submitGuest(
  request: SubmitGuestRequest
): Promise<SubmitGuestResponse> {
  const { data, guestId, tenantSlug } = request;

  // Build URL with tenant context and guest ID
  let url = '/api/rsvp';
  const params = new URLSearchParams();

  if (tenantSlug) {
    params.append('tenant', tenantSlug);
  }

  if (guestId) {
    params.append('guest', guestId.toString());
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData: GuestErrorResponse = await response.json();
    throw new Error(errorData.error || 'Failed to submit RSVP');
  }

  return response.json();
}
