import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import HomeContent from '@/components/HomeContent';
import { TenantProvider } from '@/components/providers/TenantProvider';
import { getTenantConfig, validateTenantExists } from '@/utils/csv';
import { TenantConfig } from '@/types';

// Mock the utilities
jest.mock('@/utils/csv', () => ({
  getTenantConfig: jest.fn(),
  validateTenantExists: jest.fn(),
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: jest.fn(() => null),
  }),
}));

// Mock the guest hook
jest.mock('@/hooks/useGuest', () => ({
  useGuest: () => ({
    guest: null,
    loading: false,
  }),
}));

// Mock complex components to focus on tenant integration
jest.mock('@/components/layout/Layout', () => {
  return function MockLayout({ children, extraContent }: any) {
    return (
      <div data-testid="layout">
        {children}
        {extraContent && <div data-testid="extra-content">{extraContent}</div>}
      </div>
    );
  };
});

jest.mock('@/components/section/CountdownSection', () => {
  return function MockCountdownSection({ targetDate }: any) {
    return (
      <div data-testid="countdown-section">
        Countdown to: {targetDate.toISOString()}
      </div>
    );
  };
});

jest.mock('@/components/section/RSVPSection/RSVPSection', () => {
  return function MockRSVPSection({ guestId, guest, tenantId }: any) {
    return (
      <div data-testid="rsvp-section">
        <div data-testid="rsvp-tenant-id">{tenantId || 'No tenant'}</div>
        <div data-testid="rsvp-guest-id">{guestId || 'No guest'}</div>
      </div>
    );
  };
});

jest.mock('@/components/music/MusicPlayer', () => ({
  FloatingMusicButton: function MockFloatingMusicButton() {
    return <div data-testid="music-button">Music Button</div>;
  },
}));

jest.mock('@/components/section/MapSection', () => {
  return function MockMapSection() {
    return <div data-testid="map-section">Map Section</div>;
  };
});

const mockGetTenantConfig = getTenantConfig as jest.MockedFunction<
  typeof getTenantConfig
>;
const mockValidateTenantExists = validateTenantExists as jest.MockedFunction<
  typeof validateTenantExists
>;

// Mock tenant configs
const mockTenantConfig: TenantConfig = {
  id: 'test-tenant',
  brideName: 'Jane Smith',
  groomName: 'John Doe',
  weddingDate: '2024-12-25',
  venue: {
    name: 'Grand Ballroom',
    address: '123 Wedding St, City, State',
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

const mockTenantConfig2: TenantConfig = {
  id: 'smith-wedding',
  brideName: 'Alice Johnson',
  groomName: 'Bob Smith',
  weddingDate: '2025-06-15',
  venue: {
    name: 'Beach Resort',
    address: '456 Ocean Ave, Beach City',
    mapLink: 'beach-map-link',
  },
  theme: {
    primaryColor: '#38B2AC',
    secondaryColor: '#1A202C',
  },
  isActive: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

// Wrapper component to provide necessary contexts
function TestWrapper({
  children,
  tenantId,
}: {
  children: React.ReactNode;
  tenantId?: string | null;
}) {
  return (
    <ChakraProvider>
      <TenantProvider tenantId={tenantId}>{children}</TenantProvider>
    </ChakraProvider>
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

describe('HomeContent Integration with Tenant Context', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Default tenant behavior', () => {
    it('should render with default placeholders when no tenant is provided', async () => {
      render(
        <TestWrapper>
          <HomeContent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(
          screen.getByText('Xin chào. Chúng tôi sắp kết hôn!')
        ).toBeInTheDocument();
        expect(
          screen.getByText('[Bride Name] & [Groom Name]')
        ).toBeInTheDocument();
        expect(
          screen.getByText(/\[Wedding Date\] • \[Venue Location\]/)
        ).toBeInTheDocument();
      });

      // Should pass null tenant to RSVP section
      expect(screen.getByTestId('rsvp-tenant-id')).toHaveTextContent(
        'No tenant'
      );

      // Should use default countdown date
      expect(screen.getByTestId('countdown-section')).toHaveTextContent(
        '2025-12-29'
      );
    });

    it('should render with default placeholders when tenant is null', async () => {
      render(
        <TestWrapper tenantId={null}>
          <HomeContent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(
          screen.getByText('[Bride Name] & [Groom Name]')
        ).toBeInTheDocument();
        expect(screen.getByTestId('rsvp-tenant-id')).toHaveTextContent(
          'No tenant'
        );
      });
    });
  });

  describe('Valid tenant behavior', () => {
    it('should render tenant-specific content for valid tenant', async () => {
      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockResolvedValue(mockTenantConfig);

      render(
        <TestWrapper tenantId="test-tenant">
          <HomeContent />
        </TestWrapper>
      );

      // Should show loading initially
      expect(screen.getByText('Đang tải...')).toBeInTheDocument();

      // Should load tenant-specific content
      await waitFor(() => {
        expect(screen.getByText('Jane Smith & John Doe')).toBeInTheDocument();
        expect(
          screen.getByText(
            '2024-12-25 • Grand Ballroom, 123 Wedding St, City, State'
          )
        ).toBeInTheDocument();
      });

      // Should pass tenant ID to RSVP section
      expect(screen.getByTestId('rsvp-tenant-id')).toHaveTextContent(
        'test-tenant'
      );

      // Should use tenant-specific countdown date
      expect(screen.getByTestId('countdown-section')).toHaveTextContent(
        '2024-12-25'
      );
    });

    it('should render different tenant content correctly', async () => {
      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockResolvedValue(mockTenantConfig2);

      render(
        <TestWrapper tenantId="smith-wedding">
          <HomeContent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(
          screen.getByText('Alice Johnson & Bob Smith')
        ).toBeInTheDocument();
        expect(
          screen.getByText(
            '2025-06-15 • Beach Resort, 456 Ocean Ave, Beach City'
          )
        ).toBeInTheDocument();
      });

      expect(screen.getByTestId('rsvp-tenant-id')).toHaveTextContent(
        'smith-wedding'
      );
      expect(screen.getByTestId('countdown-section')).toHaveTextContent(
        '2025-06-15'
      );
    });

    it('should handle tenant config without venue address', async () => {
      const configWithoutAddress = {
        ...mockTenantConfig,
        venue: {
          name: 'Simple Venue',
          address: '',
          mapLink: 'simple-map',
        },
      };

      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockResolvedValue(configWithoutAddress);

      render(
        <TestWrapper tenantId="simple-tenant">
          <HomeContent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(
          screen.getByText('2024-12-25 • Simple Venue')
        ).toBeInTheDocument();
      });
    });

    it('should handle partial tenant config gracefully', async () => {
      const partialConfig = {
        ...mockTenantConfig,
        brideName: '',
        groomName: 'John Only',
        venue: {
          name: '',
          address: '',
          mapLink: '',
        },
      };

      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockResolvedValue(partialConfig);

      render(
        <TestWrapper tenantId="partial-tenant">
          <HomeContent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(
          screen.getByText('[Bride Name] & John Only')
        ).toBeInTheDocument();
        expect(
          screen.getByText('2024-12-25 • [Venue Location]')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Tenant error handling', () => {
    it('should show error message when tenant loading fails', async () => {
      mockValidateTenantExists.mockResolvedValue(false);

      render(
        <TestWrapper tenantId="invalid-tenant">
          <HomeContent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(
          screen.getByText("Tenant 'invalid-tenant' not found or inactive")
        ).toBeInTheDocument();
      });

      // Should not render main content
      expect(
        screen.queryByText('Chúng tôi sắp kết hôn!')
      ).not.toBeInTheDocument();
    });

    it('should show error message when config loading fails', async () => {
      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockRejectedValue(new Error('Config load failed'));

      render(
        <TestWrapper tenantId="config-error">
          <HomeContent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(
          screen.getByText(
            'Failed to load tenant configuration: Config load failed'
          )
        ).toBeInTheDocument();
      });
    });

    it('should show error message when config is null', async () => {
      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockResolvedValue(null);

      render(
        <TestWrapper tenantId="null-config">
          <HomeContent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(
          screen.getByText("Configuration not found for tenant 'null-config'")
        ).toBeInTheDocument();
      });
    });
  });

  describe('Loading states', () => {
    it('should show loading state during tenant loading', async () => {
      let resolveValidation: (value: boolean) => void;
      const validationPromise = new Promise<boolean>((resolve) => {
        resolveValidation = resolve;
      });
      mockValidateTenantExists.mockReturnValue(validationPromise);

      render(
        <TestWrapper tenantId="loading-tenant">
          <HomeContent />
        </TestWrapper>
      );

      expect(screen.getByText('Đang tải...')).toBeInTheDocument();

      // Resolve validation
      resolveValidation!(true);
      mockGetTenantConfig.mockResolvedValue(mockTenantConfig);

      await waitFor(() => {
        expect(screen.getByText('Jane Smith & John Doe')).toBeInTheDocument();
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
        <TestWrapper tenantId="config-loading">
          <HomeContent />
        </TestWrapper>
      );

      expect(screen.getByText('Đang tải...')).toBeInTheDocument();

      // Resolve config loading
      resolveConfig!(mockTenantConfig);

      await waitFor(() => {
        expect(screen.getByText('Jane Smith & John Doe')).toBeInTheDocument();
      });
    });
  });

  describe('Component integration', () => {
    it('should render all main components with tenant context', async () => {
      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockResolvedValue(mockTenantConfig);

      render(
        <TestWrapper tenantId="full-test">
          <HomeContent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('layout')).toBeInTheDocument();
        expect(screen.getByTestId('countdown-section')).toBeInTheDocument();
        expect(screen.getByTestId('rsvp-section')).toBeInTheDocument();
        expect(screen.getByTestId('music-button')).toBeInTheDocument();
        expect(screen.getByTestId('extra-content')).toBeInTheDocument();
        expect(screen.getByTestId('map-section')).toBeInTheDocument();
      });
    });

    it('should pass correct props to child components', async () => {
      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockResolvedValue(mockTenantConfig);

      render(
        <TestWrapper tenantId="props-test">
          <HomeContent />
        </TestWrapper>
      );

      await waitFor(() => {
        // Check RSVP section receives tenant ID
        expect(screen.getByTestId('rsvp-tenant-id')).toHaveTextContent(
          'props-test'
        );

        // Check countdown section receives correct date
        expect(screen.getByTestId('countdown-section')).toHaveTextContent(
          '2024-12-25'
        );
      });
    });
  });

  describe('Tenant switching', () => {
    it('should update content when tenant changes', async () => {
      mockValidateTenantExists.mockResolvedValue(true);
      mockGetTenantConfig.mockResolvedValue(mockTenantConfig);

      const { rerender } = render(
        <TestWrapper tenantId="tenant-1">
          <HomeContent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Jane Smith & John Doe')).toBeInTheDocument();
      });

      // Switch to different tenant
      mockGetTenantConfig.mockResolvedValue(mockTenantConfig2);

      rerender(
        <TestWrapper tenantId="tenant-2">
          <HomeContent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(
          screen.getByText('Alice Johnson & Bob Smith')
        ).toBeInTheDocument();
        expect(screen.getByTestId('rsvp-tenant-id')).toHaveTextContent(
          'tenant-2'
        );
      });
    });
  });
});
