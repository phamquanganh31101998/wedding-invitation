import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import RSVPSuccessAlert from '../RSVPSuccessAlert';

const ChakraWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ChakraProvider>{children}</ChakraProvider>;

describe('RSVPSuccessAlert', () => {
  const mockOnReset = jest.fn();

  beforeEach(() => {
    mockOnReset.mockClear();
  });

  it('should render success message', () => {
    render(
      <ChakraWrapper>
        <RSVPSuccessAlert onReset={mockOnReset} />
      </ChakraWrapper>
    );

    expect(screen.getByText('Gửi RSVP Thành Công!')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Cảm ơn phản hồi của bạn. Chúng tôi mong được ăn mừng cùng bạn!'
      )
    ).toBeInTheDocument();
  });

  it('should render reset button', () => {
    render(
      <ChakraWrapper>
        <RSVPSuccessAlert onReset={mockOnReset} />
      </ChakraWrapper>
    );

    expect(
      screen.getByRole('button', { name: 'Gửi RSVP Khác' })
    ).toBeInTheDocument();
  });

  it('should call onReset when reset button is clicked', () => {
    render(
      <ChakraWrapper>
        <RSVPSuccessAlert onReset={mockOnReset} />
      </ChakraWrapper>
    );

    const resetButton = screen.getByRole('button', {
      name: 'Gửi RSVP Khác',
    });
    fireEvent.click(resetButton);

    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it('should have success alert styling', () => {
    render(
      <ChakraWrapper>
        <RSVPSuccessAlert onReset={mockOnReset} />
      </ChakraWrapper>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('data-status', 'success');
  });

  it('should display success icon', () => {
    render(
      <ChakraWrapper>
        <RSVPSuccessAlert onReset={mockOnReset} />
      </ChakraWrapper>
    );

    // Check for the presence of the success icon (CheckCircleIcon from Chakra UI)
    const icon = screen.getByRole('alert').querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});
