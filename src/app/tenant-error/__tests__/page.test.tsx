import { render, screen } from '@testing-library/react';
import TenantErrorPage, { generateMetadata } from '../page';

// Mock Chakra UI components
jest.mock('@chakra-ui/react', () => ({
  Container: ({ children }: any) => (
    <div data-testid="container">{children}</div>
  ),
  VStack: ({ children }: any) => <div data-testid="vstack">{children}</div>,
  Alert: ({ children }: any) => <div data-testid="alert">{children}</div>,
  AlertIcon: () => <div data-testid="alert-icon" />,
  AlertTitle: ({ children }: any) => (
    <div data-testid="alert-title">{children}</div>
  ),
  AlertDescription: ({ children }: any) => (
    <div data-testid="alert-description">{children}</div>
  ),
  Button: ({ children, href }: any) => (
    <a data-testid="button" href={href}>
      {children}
    </a>
  ),
  Text: ({ children }: any) => <p data-testid="text">{children}</p>,
  Heading: ({ children }: any) => <h1 data-testid="heading">{children}</h1>,
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} data-testid="link" {...props}>
      {children}
    </a>
  );
});

describe('TenantErrorPage', () => {
  it('should render error page with tenant information', () => {
    const searchParams = {
      tenant: 'invalid-tenant',
      error: 'Tenant not found or inactive',
    };

    render(<TenantErrorPage searchParams={searchParams} />);

    expect(screen.getByTestId('heading')).toHaveTextContent(
      'Wedding Invitation Not Found'
    );
    expect(screen.getByTestId('alert-title')).toHaveTextContent(
      'Tenant "invalid-tenant" Not Found'
    );
    expect(screen.getByTestId('alert-description')).toHaveTextContent(
      'Tenant not found or inactive'
    );
  });

  it('should render error page without tenant information', () => {
    const searchParams = {};

    render(<TenantErrorPage searchParams={searchParams} />);

    expect(screen.getByTestId('heading')).toHaveTextContent(
      'Wedding Invitation Not Found'
    );
    expect(screen.getByTestId('alert-title')).toHaveTextContent(
      'Invalid Request'
    );
    expect(screen.getByTestId('alert-description')).toHaveTextContent(
      'The requested wedding invitation could not be found.'
    );
  });

  it('should render default error message when no error provided', () => {
    const searchParams = {
      tenant: 'some-tenant',
    };

    render(<TenantErrorPage searchParams={searchParams} />);

    expect(screen.getByTestId('alert-title')).toHaveTextContent(
      'Tenant "some-tenant" Not Found'
    );
    expect(screen.getByTestId('alert-description')).toHaveTextContent(
      'The requested wedding invitation could not be found.'
    );
  });

  it('should render home page link', () => {
    const searchParams = {
      tenant: 'test-tenant',
      error: 'Test error',
    };

    render(<TenantErrorPage searchParams={searchParams} />);

    const homeLink = screen.getByTestId('button');
    expect(homeLink).toHaveAttribute('href', '/');
    expect(homeLink).toHaveTextContent('Go to Home Page');
  });

  it('should show helpful error reasons', () => {
    const searchParams = {
      tenant: 'test-tenant',
    };

    render(<TenantErrorPage searchParams={searchParams} />);

    expect(screen.getByText('This could happen if:')).toBeInTheDocument();
    expect(
      screen.getByText('• The invitation link is incorrect or expired')
    ).toBeInTheDocument();
    expect(
      screen.getByText('• The wedding invitation has been deactivated')
    ).toBeInTheDocument();
    expect(
      screen.getByText('• There was a typo in the URL')
    ).toBeInTheDocument();
    expect(
      screen.getByText('• The couple has not set up their invitation yet')
    ).toBeInTheDocument();
  });

  it('should show additional help text when tenant is provided', () => {
    const searchParams = {
      tenant: 'test-tenant',
    };

    render(<TenantErrorPage searchParams={searchParams} />);

    expect(
      screen.getByText(
        'Looking for a different invitation? Check the URL and try again.'
      )
    ).toBeInTheDocument();
  });

  it('should not show additional help text when no tenant provided', () => {
    const searchParams = {};

    render(<TenantErrorPage searchParams={searchParams} />);

    expect(
      screen.queryByText(
        'Looking for a different invitation? Check the URL and try again.'
      )
    ).not.toBeInTheDocument();
  });
});

describe('generateMetadata', () => {
  it('should generate metadata with tenant information', () => {
    const searchParams = {
      tenant: 'john-jane',
    };

    const metadata = generateMetadata({ searchParams });

    expect(metadata.title).toBe('Wedding Invitation Not Found - john-jane');
    expect(metadata.description).toBe(
      'The requested wedding invitation could not be found. Please check the URL and try again.'
    );
  });

  it('should generate metadata without tenant information', () => {
    const searchParams = {};

    const metadata = generateMetadata({ searchParams });

    expect(metadata.title).toBe('Wedding Invitation Not Found');
    expect(metadata.description).toBe(
      'The requested wedding invitation could not be found. Please check the URL and try again.'
    );
  });
});
