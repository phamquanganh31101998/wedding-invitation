'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { TenantContextType, TenantConfig } from '@/types';
import { getTenantConfig, validateTenantExists } from '@/utils/csv';
import { extractTenantFromPath } from '@/utils/tenant';

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
        // Validate tenant exists first
        const exists = await validateTenantExists(tenantId);
        if (!exists) {
          setError(`Tenant '${tenantId}' not found or inactive`);
          setIsLoading(false);
          return;
        }

        // Load tenant configuration
        const tenantConfig = await getTenantConfig(tenantId);
        if (!tenantConfig) {
          setError(`Configuration not found for tenant '${tenantId}'`);
          setIsLoading(false);
          return;
        }

        setConfig(tenantConfig);
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
    tenantId,
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
