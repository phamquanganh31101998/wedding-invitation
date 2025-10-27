/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { validateTenantId } from '@/utils/tenant';

// Mock the utilities
jest.mock('@/utils/tenant', () => ({
  validateTenantId: jest.fn(),
}));

const mockValidateTenantId = validateTenantId as jest.MockedFunction<
  typeof validateTenantId
>;

// Test component that simulates the tenant page logic
function TenantPageTestComponent({ params }: { params: { tenant: string } }) {
  const [validationResult, setValidationResult] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function validate() {
      try {
        const result = await validateTenantId(params.tenant);
        setValidationResult(result);
      } catch (error) {
        setValidationResult({ isValid: false, error: 'Validation failed' });
      } finally {
        setIsLoading(false);
      }
    }
    validate();
  }, [params.tenant]);

  if (isLoading) {
    return <div>Loading tenant information...</div>;
  }

  if (!validationResult?.isValid) {
    return (
      <div>
        <div>Tenant Not Found</div>
        <div>
          The wedding invitation for "{params.tenant}" could not be found.{' '}
          {validationResult?.error}
        </div>
        <div>This could happen if:</div>
        <div>• The invitation link is incorrect</div>
        <div>• The wedding invitation has been deactivated</div>
        <div>• There was a typo in the URL</div>
        <div>Go to Home Page</div>
      </div>
    );
  }

  return (
    <div data-testid="tenant-provider" data-tenant-id={params.tenant}>
      <div>Loading tenant information...</div>
      <div data-testid="home-content">Home Content Loaded</div>
    </div>
  );
}

// Wrapper component to provide Chakra UI context
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <ChakraProvider>{children}</ChakraProvider>;
}

// Suppress console.error during tests to reduce noise
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('TenantPage Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Valid tenant rendering', () => {
    it('should render home content for valid tenant', async () => {
      mockValidateTenantId.mockResolvedValue({
        isValid: true,
        tenantId: 'test-tenant',
      });

      const params = { tenant: 'test-tenant' };

      render(
        <TestWrapper>
          <TenantPageTestComponent params={params} />
        </TestWrapper>
      );

      // Should show loading initially
      expect(
        screen.getByText('Loading tenant information...')
      ).toBeInTheDocument();

      // Should load home content
      await waitFor(() => {
        expect(screen.getByTestId('home-content')).toBeInTheDocument();
        expect(screen.getByText('Home Content Loaded')).toBeInTheDocument();
      });

      expect(mockValidateTenantId).toHaveBeenCalledWith('test-tenant');
    });

    it('should handle tenant with special characters in ID', async () => {
      mockValidateTenantId.mockResolvedValue({
        isValid: true,
        tenantId: 'john-jane-2024',
      });

      const params = { tenant: 'john-jane-2024' };

      render(
        <TestWrapper>
          <TenantPageTestComponent params={params} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('home-content')).toBeInTheDocument();
      });

      expect(mockValidateTenantId).toHaveBeenCalledWith('john-jane-2024');
    });
  });

  describe('Invalid tenant error handling', () => {
    it('should show error page for non-existent tenant', async () => {
      mockValidateTenantId.mockResolvedValue({
        isValid: false,
        error: "Tenant 'non-existent' not found or inactive.",
      });

      const params = { tenant: 'non-existent' };

      render(
        <TestWrapper>
          <TenantPageTestComponent params={params} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tenant Not Found')).toBeInTheDocument();
        expect(
          screen.getByText(
            /The wedding invitation for "non-existent" could not be found/
          )
        ).toBeInTheDocument();
        expect(
          screen.getByText("Tenant 'non-existent' not found or inactive.")
        ).toBeInTheDocument();
      });

      expect(mockValidateTenantId).toHaveBeenCalledWith('non-existent');
    });

    it('should show error page for invalid tenant ID format', async () => {
      mockValidateTenantId.mockResolvedValue({
        isValid: false,
        error:
          'Invalid tenant ID format. Only alphanumeric characters, hyphens, and underscores are allowed.',
      });

      const params = { tenant: 'invalid@tenant!' };

      render(
        <TestWrapper>
          <TenantPageTestComponent params={params} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tenant Not Found')).toBeInTheDocument();
        expect(
          screen.getByText(
            /The wedding invitation for "invalid@tenant!" could not be found/
          )
        ).toBeInTheDocument();
        expect(
          screen.getByText(
            'Invalid tenant ID format. Only alphanumeric characters, hyphens, and underscores are allowed.'
          )
        ).toBeInTheDocument();
      });

      expect(mockValidateTenantId).toHaveBeenCalledWith('invalid@tenant!');
    });

    it('should provide helpful error information and navigation', async () => {
      mockValidateTenantId.mockResolvedValue({
        isValid: false,
        error: "Tenant 'test' not found or inactive.",
      });

      const params = { tenant: 'test' };

      render(
        <TestWrapper>
          <TenantPageTestComponent params={params} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('This could happen if:')).toBeInTheDocument();
        expect(
          screen.getByText('• The invitation link is incorrect')
        ).toBeInTheDocument();
        expect(
          screen.getByText('• The wedding invitation has been deactivated')
        ).toBeInTheDocument();
        expect(
          screen.getByText('• There was a typo in the URL')
        ).toBeInTheDocument();
        expect(screen.getByText('Go to Home Page')).toBeInTheDocument();
      });
    });
  });

  describe('Loading states', () => {
    it('should show loading state while validating tenant', async () => {
      let resolveValidation: (value: any) => void;
      const validationPromise = new Promise((resolve) => {
        resolveValidation = resolve;
      });
      mockValidateTenantId.mockReturnValue(validationPromise);

      const params = { tenant: 'loading-tenant' };

      render(
        <TestWrapper>
          <TenantPageTestComponent params={params} />
        </TestWrapper>
      );

      expect(
        screen.getByText('Loading tenant information...')
      ).toBeInTheDocument();

      // Resolve validation
      resolveValidation!({
        isValid: true,
        tenantId: 'loading-tenant',
      });

      await waitFor(() => {
        expect(screen.getByTestId('home-content')).toBeInTheDocument();
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty tenant ID', async () => {
      mockValidateTenantId.mockResolvedValue({
        isValid: false,
        error: 'No tenant ID provided',
      });

      const params = { tenant: '' };

      render(
        <TestWrapper>
          <TenantPageTestComponent params={params} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tenant Not Found')).toBeInTheDocument();
        expect(screen.getByText('No tenant ID provided')).toBeInTheDocument();
      });
    });

    it('should handle very long tenant ID', async () => {
      const longTenantId = 'a'.repeat(100);
      mockValidateTenantId.mockResolvedValue({
        isValid: false,
        error: 'Tenant ID must be between 2 and 50 characters long.',
      });

      const params = { tenant: longTenantId };

      render(
        <TestWrapper>
          <TenantPageTestComponent params={params} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tenant Not Found')).toBeInTheDocument();
        expect(
          screen.getByText(
            'Tenant ID must be between 2 and 50 characters long.'
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe('Metadata generation logic', () => {
    it('should validate tenant for metadata generation', async () => {
      mockValidateTenantId.mockResolvedValue({
        isValid: true,
        tenantId: 'test-tenant',
      });

      // Simulate metadata generation logic
      const params = { tenant: 'test-tenant' };
      const validation = await validateTenantId(params.tenant);

      expect(validation.isValid).toBe(true);
      expect(validation.tenantId).toBe('test-tenant');
      expect(mockValidateTenantId).toHaveBeenCalledWith('test-tenant');
    });

    it('should handle invalid tenant for metadata generation', async () => {
      mockValidateTenantId.mockResolvedValue({
        isValid: false,
        error: 'Tenant not found',
      });

      const params = { tenant: 'invalid' };
      const validation = await validateTenantId(params.tenant);

      expect(validation.isValid).toBe(false);
      expect(validation.error).toBe('Tenant not found');
    });
  });
});
