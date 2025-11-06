'use client';

import React, { createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import { TenantContextType } from '@/types';
import { extractTenantFromPath } from '@/utils/tenant-client';
import { useTenantConfig } from '@/features/tenant/services/tenant.hooks';

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
  tenantSlug?: string | null;
}

export function TenantProvider({
  children,
  tenantSlug: propTenantId,
}: TenantProviderProps) {
  const pathname = usePathname();

  // Extract tenant ID from props or URL path
  const tenantSlug = propTenantId || extractTenantFromPath(pathname);

  // Use React Query to fetch tenant configuration
  const {
    data: tenantData,
    isLoading,
    error,
  } = useTenantConfig(tenantSlug, {
    enabled: !!tenantSlug,
  });

  const contextValue: TenantContextType = {
    tenantSlug, // This is the slug from the URL
    config: tenantData?.data || null,
    isLoading,
    error: error?.message || null,
  };

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
}
