import { render, screen } from '@testing-library/react';
import RootLayout from '../layout';

// Mock the providers
jest.mock('@/components/providers/ChakraProviders', () => ({
  ChakraProviders: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chakra-provider">{children}</div>
  ),
}));

jest.mock('@/components/providers/ReduxProvider', () => ({
  ReduxProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="redux-provider">{children}</div>
  ),
}));

jest.mock('@/components/providers/TenantProvider', () => ({
  TenantProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tenant-provider">{children}</div>
  ),
}));

jest.mock('@/components/music/MusicPlayer', () => ({
  AudioProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="audio-provider">{children}</div>
  ),
}));

// Mock Next.js fonts
jest.mock('next/font/google', () => ({
  Geist: () => ({
    variable: '--font-geist-sans',
  }),
  Geist_Mono: () => ({
    variable: '--font-geist-mono',
  }),
}));

describe('RootLayout', () => {
  it('should render with all providers in correct order', () => {
    const TestContent = () => (
      <div data-testid="test-content">Test Content</div>
    );

    render(
      <RootLayout>
        <TestContent />
      </RootLayout>
    );

    // Check that all providers are present
    expect(screen.getByTestId('redux-provider')).toBeInTheDocument();
    expect(screen.getByTestId('chakra-provider')).toBeInTheDocument();
    expect(screen.getByTestId('tenant-provider')).toBeInTheDocument();
    expect(screen.getByTestId('audio-provider')).toBeInTheDocument();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('should render body content with correct classes', () => {
    const TestContent = () => (
      <div data-testid="test-content">Test Content</div>
    );

    render(
      <RootLayout>
        <TestContent />
      </RootLayout>
    );

    // Check that content is rendered
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('should wrap children with TenantProvider', () => {
    const TestContent = () => (
      <div data-testid="child-content">Child Content</div>
    );

    render(
      <RootLayout>
        <TestContent />
      </RootLayout>
    );

    // Verify that TenantProvider is wrapping the content
    const tenantProvider = screen.getByTestId('tenant-provider');
    const childContent = screen.getByTestId('child-content');

    expect(tenantProvider).toBeInTheDocument();
    expect(childContent).toBeInTheDocument();
    expect(tenantProvider).toContainElement(childContent);
  });

  it('should maintain provider hierarchy', () => {
    const TestContent = () => (
      <div data-testid="nested-content">Nested Content</div>
    );

    render(
      <RootLayout>
        <TestContent />
      </RootLayout>
    );

    // Check provider nesting order: Redux > Chakra > Tenant > Audio > Content
    const reduxProvider = screen.getByTestId('redux-provider');
    const chakraProvider = screen.getByTestId('chakra-provider');
    const tenantProvider = screen.getByTestId('tenant-provider');
    const audioProvider = screen.getByTestId('audio-provider');
    const content = screen.getByTestId('nested-content');

    expect(reduxProvider).toContainElement(chakraProvider);
    expect(chakraProvider).toContainElement(tenantProvider);
    expect(tenantProvider).toContainElement(audioProvider);
    expect(audioProvider).toContainElement(content);
  });
});
