import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import RSVPForm from '../RSVPForm';

// Mock fetch
global.fetch = jest.fn();

const ChakraWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ChakraProvider>{children}</ChakraProvider>;

describe('RSVPForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  const fillValidForm = async () => {
    const nameInput = screen.getByPlaceholderText('Enter your full name');
    const relationshipInput = screen.getByPlaceholderText(
      'e.g., Friend, Family, Colleague...'
    );

    fireEvent.change(nameInput, {
      target: { value: 'John Doe' },
    });
    fireEvent.change(relationshipInput, {
      target: { value: 'Friend' },
    });
    fireEvent.click(screen.getByDisplayValue('yes'));

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: 'Submit RSVP' });
      expect(submitButton).not.toBeDisabled();
    });
  };

  it('should render all form fields', () => {
    render(
      <ChakraWrapper>
        <RSVPForm onSuccess={mockOnSuccess} onError={mockOnError} />
      </ChakraWrapper>
    );

    expect(
      screen.getByPlaceholderText('Enter your full name')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('e.g., Friend, Family, Colleague...')
    ).toBeInTheDocument();
    expect(screen.getByText('Will you be attending?')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        'Share your excitement or well-wishes with the couple...'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Submit RSVP' })
    ).toBeInTheDocument();
  });

  it('should disable submit button when form is invalid', () => {
    render(
      <ChakraWrapper>
        <RSVPForm onSuccess={mockOnSuccess} onError={mockOnError} />
      </ChakraWrapper>
    );

    const submitButton = screen.getByRole('button', { name: 'Submit RSVP' });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when form is valid', async () => {
    render(
      <ChakraWrapper>
        <RSVPForm onSuccess={mockOnSuccess} onError={mockOnError} />
      </ChakraWrapper>
    );

    await fillValidForm();
  });

  it('should submit form with valid data', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        message: 'RSVP submitted successfully',
        data: {
          id: '123',
          name: 'John Doe',
          relationship: 'Friend',
          attendance: 'yes',
          message: 'Congratulations!',
          submittedAt: '2023-01-01T00:00:00.000Z',
        },
      }),
    };

    (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(
      <ChakraWrapper>
        <RSVPForm onSuccess={mockOnSuccess} onError={mockOnError} />
      </ChakraWrapper>
    );

    // Fill out the form
    const nameInput = screen.getByPlaceholderText('Enter your full name');
    const relationshipInput = screen.getByPlaceholderText(
      'e.g., Friend, Family, Colleague...'
    );
    const messageInput = screen.getByPlaceholderText(
      'Share your excitement or well-wishes with the couple...'
    );

    fireEvent.change(nameInput, {
      target: { value: 'John Doe' },
    });
    fireEvent.change(relationshipInput, {
      target: { value: 'Friend' },
    });
    fireEvent.click(screen.getByDisplayValue('yes'));
    fireEvent.change(messageInput, {
      target: { value: 'Congratulations!' },
    });

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: 'Submit RSVP' });
      expect(submitButton).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Submit RSVP' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'John Doe',
          relationship: 'Friend',
          attendance: 'yes',
          message: 'Congratulations!',
        }),
      });
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should handle API error response', async () => {
    const mockResponse = {
      ok: false,
      json: async () => ({
        error: 'Validation failed',
      }),
    };

    (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(
      <ChakraWrapper>
        <RSVPForm onSuccess={mockOnSuccess} onError={mockOnError} />
      </ChakraWrapper>
    );

    await fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Submit RSVP' }));

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Validation failed');
    });
  });

  it('should handle network error', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(
      <ChakraWrapper>
        <RSVPForm onSuccess={mockOnSuccess} onError={mockOnError} />
      </ChakraWrapper>
    );

    await fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Submit RSVP' }));

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Network error');
    });
  });

  it('should show success message after successful submission', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        message: 'RSVP submitted successfully',
        data: {
          id: '123',
          name: 'John Doe',
          relationship: 'Friend',
          attendance: 'yes',
          message: '',
          submittedAt: '2023-01-01T00:00:00.000Z',
        },
      }),
    };

    (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(
      <ChakraWrapper>
        <RSVPForm onSuccess={mockOnSuccess} onError={mockOnError} />
      </ChakraWrapper>
    );

    await fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Submit RSVP' }));

    await waitFor(() => {
      expect(
        screen.getByText('RSVP Submitted Successfully!')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Thank you for your response. We look forward to celebrating with you!'
        )
      ).toBeInTheDocument();
    });
  });

  it('should reset form when "Submit Another RSVP" is clicked', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        message: 'RSVP submitted successfully',
        data: {
          id: '123',
          name: 'John Doe',
          relationship: 'Friend',
          attendance: 'yes',
          message: '',
          submittedAt: '2023-01-01T00:00:00.000Z',
        },
      }),
    };

    (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(
      <ChakraWrapper>
        <RSVPForm onSuccess={mockOnSuccess} onError={mockOnError} />
      </ChakraWrapper>
    );

    await fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Submit RSVP' }));

    await waitFor(() => {
      expect(
        screen.getByText('RSVP Submitted Successfully!')
      ).toBeInTheDocument();
    });

    // Click "Submit Another RSVP"
    fireEvent.click(
      screen.getByRole('button', { name: 'Submit Another RSVP' })
    );

    // Form should be reset and visible again
    expect(
      screen.getByPlaceholderText('Enter your full name')
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your full name')).toHaveValue('');
  });

  it('should show loading state during submission', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        message: 'RSVP submitted successfully',
        data: {
          id: '123',
          name: 'John Doe',
          relationship: 'Friend',
          attendance: 'yes',
          message: '',
          submittedAt: '2023-01-01T00:00:00.000Z',
        },
      }),
    };

    // Delay the response to test loading state
    (fetch as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) => setTimeout(() => resolve(mockResponse), 100))
    );

    render(
      <ChakraWrapper>
        <RSVPForm onSuccess={mockOnSuccess} onError={mockOnError} />
      </ChakraWrapper>
    );

    await fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Submit RSVP' }));

    // Should show loading text
    expect(screen.getByText('Submitting RSVP...')).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText('RSVP Submitted Successfully!')
      ).toBeInTheDocument();
    });
  });
});
