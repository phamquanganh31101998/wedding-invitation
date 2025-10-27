import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { TenantProvider, useTenant } from '../TenantProvider';
import { getTenantConfig, validateTenantExists } from '@/utils/csv';
import { TenantConfig } from '@/types';

// Mock the CSV utilities
jest.mock('@/utils/csv', () => ({
  getTenantConfig: jest.fn(),
  validateTenantExists: jest.fn(),
}));

const mockGetTenantConfig = getTenantConfig as jest.MockedFunction<
  typeof getTenantConfig
>;
const mockValidateTenantExists = validateTenantExists as jest.MockedFunction<
  typeof validateTenantExists
>;

// Mock tenant config
const mockTenantConfig: TenantConfig = {
  id: 'test-tenant',
  brideName: 'Jane Smith',
  groomName: 'John Doe',
  weddingDate: '2024-12-25',
  venue: {
    name: 'Test Venue',
    address: '123 Test St, Test City',
    mapLink: 'test-map-link',
  },
  theme: {
    primaryColor: '#D69E2E',
    secondaryColor: '#2D3748',
  },
  isActive: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

// Test component that uses the tenant context
function TestComponent() {
  const { tenantId, config, isLoading, error } = useTenant();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div data-testid="tenant-id">{tenantId || 'No tenant'}</div>
      <div data-testid="bride-name">{config?.brideName || 'No bride'}</div>
      <div data-testid="groom-name">{config?.groomName || 'No groom'}</div>
      <div data-testid="wedding-date">{config?.weddingDate || 'No date'}</div>
    </div>
  );
}

// Suppress console.error during tests to reduce noise
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('TenantProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useTenant hook', () => {
    it('should throw error when used outside TenantProvider', () => {
      // Suppress React error boundary warnings for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useTenant must be used within a TenantProvider');

      console.error = originalError;
    });
  });

  describe('TenantProvider with no tenant ID', () => {
    it('should provide default state when no tenant ID is provided', async () => {
      render(
        <TenantProvider>
          <TestComponent />
        </TenantProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('tenant-id')).toHaveTextContent('No tenant');
        expect(screen.getByTestId('bride-name')).toHaveTextContent('No bride');
        expect(screen.getByTestId('groom-name')).toHaveTextContent('No groom');
        expect(screen.getByTestId('wedding-date')).toHaveTextContent('No date');
      });

      expect(mockValidateTenantExists).not.toHaveBeenCalled();
      expect(mockGetTenantConfig).not.toHaveBeenCalled();
    });

    it('should provide default state when tenant ID is null', async () => {
      render(
        <TenantProvider tenantId={null}>
          <TestComponent />
        </TenantProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('tenant-id')).toHaveTextContent('No tenant');
      });

      expect(mockValidateTenantExists).not.toHaveBeenCalled();
      expect(mockGetTenantConfig).not.toHaveBeenCalled();
    });
  });

  describe('TenantProvider with valid tenant ID', () => {
    it('should load and provide tenant configuration', async () => {
      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockResolvedValue(mockTenantConfig);

      render(
        <TenantProvider tenantId="test-tenant">
          <TestComponent />
        </TenantProvider>
      );

      // Should show loading initially
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Should load tenant data
      await waitFor(() => {
        expect(screen.getByTestId('tenant-id')).toHaveTextContent(
          'test-tenant'
        );
        expect(screen.getByTestId('bride-name')).toHaveTextContent(
          'Jane Smith'
        );
        expect(screen.getByTestId('groom-name')).toHaveTextContent('John Doe');
        expect(screen.getByTestId('wedding-date')).toHaveTextContent(
          '2024-12-25'
        );
      });

      expect(mockValidateTenantExists).toHaveBeenCalledWith('test-tenant');
      expect(mockGetTenantConfig).toHaveBeenCalledWith('test-tenant');
    });

    it('should update when tenant ID changes', async () => {
      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockResolvedValue(mockTenantConfig);

      const { rerender } = render(
        <TenantProvider tenantId="test-tenant">
          <TestComponent />
        </TenantProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('tenant-id')).toHaveTextContent(
          'test-tenant'
        );
      });

      // Change tenant ID
      const newConfig = {
        ...mockTenantConfig,
        id: 'new-tenant',
        brideName: 'Alice',
      };
      mockGetTenantConfig.mockResolvedValue(newConfig);

      rerender(
        <TenantProvider tenantId="new-tenant">
          <TestComponent />
        </TenantProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('tenant-id')).toHaveTextContent('new-tenant');
        expect(screen.getByTestId('bride-name')).toHaveTextContent('Alice');
      });

      expect(mockValidateTenantExists).toHaveBeenCalledWith('new-tenant');
      expect(mockGetTenantConfig).toHaveBeenCalledWith('new-tenant');
    });
  });

  describe('TenantProvider error handling', () => {
    it('should handle non-existent tenant', async () => {
      mockValidateTenantExists.mockResolvedValue(false);

      render(
        <TenantProvider tenantId="non-existent">
          <TestComponent />
        </TenantProvider>
      );

      await waitFor(() => {
        expect(
          screen.getByText("Error: Tenant 'non-existent' not found or inactive")
        ).toBeInTheDocument();
      });

      expect(mockValidateTenantExists).toHaveBeenCalledWith('non-existent');
      expect(mockGetTenantConfig).not.toHaveBeenCalled();
    });

    it('should handle tenant validation errors', async () => {
      mockValidateTenantExists.mockRejectedValue(
        new Error('Validation failed')
      );

      render(
        <TenantProvider tenantId="error-tenant">
          <TestComponent />
        </TenantProvider>
      );

      await waitFor(() => {
        expect(
          screen.getByText(
            'Error: Failed to load tenant configuration: Validation failed'
          )
        ).toBeInTheDocument();
      });

      expect(mockValidateTenantExists).toHaveBeenCalledWith('error-tenant');
      expect(mockGetTenantConfig).not.toHaveBeenCalled();
    });

    it('should handle config loading errors', async () => {
      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockRejectedValue(new Error('Config load failed'));

      render(
        <TenantProvider tenantId="config-error">
          <TestComponent />
        </TenantProvider>
      );

      await waitFor(() => {
        expect(
          screen.getByText(
            'Error: Failed to load tenant configuration: Config load failed'
          )
        ).toBeInTheDocument();
      });

      expect(mockValidateTenantExists).toHaveBeenCalledWith('config-error');
      expect(mockGetTenantConfig).toHaveBeenCalledWith('config-error');
    });

    it('should handle null config response', async () => {
      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockResolvedValue(null);

      render(
        <TenantProvider tenantId="null-config">
          <TestComponent />
        </TenantProvider>
      );

      await waitFor(() => {
        expect(
          screen.getByText(
            "Error: Configuration not found for tenant 'null-config'"
          )
        ).toBeInTheDocument();
      });

      expect(mockValidateTenantExists).toHaveBeenCalledWith('null-config');
      expect(mockGetTenantConfig).toHaveBeenCalledWith('null-config');
    });

    it('should handle unknown errors', async () => {
      mockValidateTenantExists.mockRejectedValue('String error');

      render(
        <TenantProvider tenantId="unknown-error">
          <TestComponent />
        </TenantProvider>
      );

      await waitFor(() => {
        expect(
          screen.getByText(
            'Error: Failed to load tenant configuration: Unknown error occurred'
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe('TenantProvider loading states', () => {
    it('should show loading state during tenant validation', async () => {
      let resolveValidation: (value: boolean) => void;
      const validationPromise = new Promise<boolean>((resolve) => {
        resolveValidation = resolve;
      });
      mockValidateTenantExists.mockReturnValue(validationPromise);

      render(
        <TenantProvider tenantId="loading-tenant">
          <TestComponent />
        </TenantProvider>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Resolve the validation
      resolveValidation!(true);
      mockGetTenantConfig.mockResolvedValue(mockTenantConfig);

      await waitFor(() => {
        expect(screen.getByTestId('tenant-id')).toHaveTextContent(
          'loading-tenant'
        );
      });
    });

    it('should show loading state during config loading', async () => {
      mockValidateTenantExists.mockResolvedValue(true);

      let resolveConfig: (value: TenantConfig) => void;
      const configPromise = new Promise<TenantConfig>((resolve) => {
        resolveConfig = resolve;
      });
      mockGetTenantConfig.mockReturnValue(configPromise);

      render(
        <TenantProvider tenantId="config-loading">
          <TestComponent />
        </TenantProvider>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Resolve the config loading
      resolveConfig!(mockTenantConfig);

      await waitFor(() => {
        expect(screen.getByTestId('tenant-id')).toHaveTextContent(
          'config-loading'
        );
      });
    });
  });
});
