import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { RSVPForm } from '..';

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
    const nameInput = screen.getByPlaceholderText('Nhập họ và tên đầy đủ');
    const relationshipInput = screen.getByPlaceholderText(
      'ví dụ: Bạn bè, Gia đình, Đồng nghiệp...'
    );

    fireEvent.change(nameInput, {
      target: { value: 'John Doe' },
    });
    fireEvent.change(relationshipInput, {
      target: { value: 'Friend' },
    });
    fireEvent.click(screen.getByDisplayValue('yes'));

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: 'Gửi RSVP' });
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
      screen.getByPlaceholderText('Nhập họ và tên đầy đủ')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('ví dụ: Bạn bè, Gia đình, Đồng nghiệp...')
    ).toBeInTheDocument();
    expect(screen.getByText('Bạn có tham dự không?')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        'Chia sẻ niềm vui hoặc lời chúc tốt đẹp với cô dâu chú rể...'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Gửi RSVP' })
    ).toBeInTheDocument();
  });

  it('should disable submit button when form is invalid after interaction', async () => {
    render(
      <ChakraWrapper>
        <RSVPForm onSuccess={mockOnSuccess} onError={mockOnError} />
      </ChakraWrapper>
    );

    const submitButton = screen.getByRole('button', { name: 'Gửi RSVP' });
    const nameInput = screen.getByPlaceholderText('Nhập họ và tên đầy đủ');

    // Interact with form to trigger validation
    fireEvent.focus(nameInput);
    fireEvent.blur(nameInput);

    // With Formik, the button is disabled when form is invalid after validation runs
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
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
    const nameInput = screen.getByPlaceholderText('Nhập họ và tên đầy đủ');
    const relationshipInput = screen.getByPlaceholderText(
      'ví dụ: Bạn bè, Gia đình, Đồng nghiệp...'
    );
    const messageInput = screen.getByPlaceholderText(
      'Chia sẻ niềm vui hoặc lời chúc tốt đẹp với cô dâu chú rể...'
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
      const submitButton = screen.getByRole('button', { name: 'Gửi RSVP' });
      expect(submitButton).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Gửi RSVP' }));

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
      expect(mockOnError).toHaveBeenCalledWith('Xác thực thất bại');
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
    fireEvent.click(screen.getByRole('button', { name: 'Gửi RSVP' }));

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
    fireEvent.click(screen.getByRole('button', { name: 'Gửi RSVP' }));

    await waitFor(() => {
      expect(
        screen.getAllByText('Gửi RSVP Thành Công!')[0]
      ).toBeInTheDocument();
      expect(
        screen.getAllByText(
          'Cảm ơn phản hồi của bạn. Chúng tôi mong được ăn mừng cùng bạn!'
        )[0]
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
    fireEvent.click(screen.getByRole('button', { name: 'Gửi RSVP' }));

    await waitFor(() => {
      expect(
        screen.getAllByText('Gửi RSVP Thành Công!')[0]
      ).toBeInTheDocument();
    });

    // Click "Submit Another RSVP"
    fireEvent.click(screen.getByRole('button', { name: 'Gửi RSVP Khác' }));

    // Form should be reset and visible again
    expect(
      screen.getByPlaceholderText('Nhập họ và tên đầy đủ')
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nhập họ và tên đầy đủ')).toHaveValue(
      ''
    );
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
    fireEvent.click(screen.getByRole('button', { name: 'Gửi RSVP' }));

    // Should show loading text
    expect(screen.getByText('Đang gửi RSVP...')).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getAllByText('Gửi RSVP Thành Công!')[0]
      ).toBeInTheDocument();
    });
  });
});
