'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { TenantContextType, TenantConfig } from '@/types';
import { extractTenantFromPath } from '@/utils/tenant-client';

// Create the context
const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Custom hook to use the tenant context
export function useTenant(): TenantContextType {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

interface TenantProviderProps {
  children: React.ReactNode;
  tenantId?: string | null;
}

export function TenantProvider({
  children,
  tenantId: propTenantId,
}: TenantProviderProps) {
  const pathname = usePathname();
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract tenant ID from props or URL path
  const tenantId = propTenantId || extractTenantFromPath(pathname);

  useEffect(() => {
    async function loadTenantConfig() {
      setIsLoading(true);
      setError(null);
      setConfig(null);

      if (!tenantId) {
        // No tenant ID provided, use default state
        setIsLoading(false);
        return;
      }

      try {
        // Load tenant configuration via API (this also validates tenant exists)
        const configResponse = await fetch(
          `/api/config/tenant?tenant=${encodeURIComponent(tenantId)}`
        );

        if (!configResponse.ok) {
          const errorData = await configResponse.json();
          setError(
            errorData.error ||
              `Configuration not found for tenant '${tenantId}'`
          );
          setIsLoading(false);
          return;
        }

        const configData = await configResponse.json();
        setConfig(configData.data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setError(`Failed to load tenant configuration: ${errorMessage}`);
        console.error('Error loading tenant configuration:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadTenantConfig();
  }, [tenantId, pathname]);

  const contextValue: TenantContextType = {
    tenantSlug: tenantId, // This is the slug from the URL
    config,
    isLoading,
    error,
  };

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
}
