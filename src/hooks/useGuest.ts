'use client';

import { useState, useEffect } from 'react';
import { RSVPData } from '@/types';

interface UseGuestReturn {
  guest: RSVPData | null;
  loading: boolean;
  error: string | null;
}

export function useGuest(id: string | null): UseGuestReturn {
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
        const response = await fetch(`/api/guest?id=${encodeURIComponent(id)}`);

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
  }, [id]);

  return { guest, loading, error };
}
