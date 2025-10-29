'use client';

import { useState, useEffect } from 'react';
import { RSVPData } from '@/types';

interface UseGuestReturn {
  guest: RSVPData | null;
  loading: boolean;
  error: string | null;
}

interface UseGuestOptions {
  tenantSlug?: string | null;
}

export function useGuest(
  id: string | null,
  options?: UseGuestOptions
): UseGuestReturn {
  const [guest, setGuest] = useState<RSVPData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setGuest(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchGuest = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build URL with tenant parameter if provided
        let url = `/api/guest?id=${encodeURIComponent(id)}`;
        if (options?.tenantSlug) {
          url += `&tenant=${encodeURIComponent(options.tenantSlug)}`;
        }

        const response = await fetch(url);

        if (response.ok) {
          const result = await response.json();
          setGuest(result.data);
        } else if (response.status === 404) {
          // Guest not found - this is okay, just set guest to null
          setGuest(null);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch guest data');
        }
      } catch (err) {
        setError('Failed to fetch guest data');
        console.error('Error fetching guest:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGuest();
  }, [id, options?.tenantSlug]);

  return { guest, loading, error };
}
