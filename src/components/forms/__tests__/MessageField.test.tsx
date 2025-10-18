import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import MessageField from '../MessageField';

const ChakraWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ChakraProvider>{children}</ChakraProvider>;

describe('MessageField', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render with correct label and placeholder', () => {
    render(
      <ChakraWrapper>
        <MessageField value="" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    expect(
      screen.getByLabelText('Message for the Couple (Optional)')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        'Share your excitement or well-wishes with the couple...'
      )
    ).toBeInTheDocument();
  });

  it('should display helper text and character counter', () => {
    render(
      <ChakraWrapper>
        <MessageField value="" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    expect(
      screen.getByText(
        'Share your thoughts, well-wishes, or excitement for the big day'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('0/500')).toBeInTheDocument();
  });

  it('should call onChange when textarea value changes', () => {
    render(
      <ChakraWrapper>
        <MessageField value="" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    const textarea = screen.getByLabelText('Message for the Couple (Optional)');
    fireEvent.change(textarea, { target: { value: 'Congratulations!' } });

    expect(mockOnChange).toHaveBeenCalledWith('Congratulations!');
  });

  it('should update character counter', () => {
    render(
      <ChakraWrapper>
        <MessageField value="Hello world" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    expect(screen.getByText('11/500')).toBeInTheDocument();
  });

  it('should prevent input beyond character limit', () => {
    const longMessage = 'A'.repeat(500);
    render(
      <ChakraWrapper>
        <MessageField value={longMessage} onChange={mockOnChange} />
      </ChakraWrapper>
    );

    const textarea = screen.getByLabelText('Message for the Couple (Optional)');
    fireEvent.change(textarea, { target: { value: longMessage + 'B' } });

    // Should not call onChange if exceeding limit
    expect(mockOnChange).not.toHaveBeenCalledWith(longMessage + 'B');
  });

  it('should show warning color when near character limit', () => {
    const nearLimitMessage = 'A'.repeat(450); // 90% of 500
    render(
      <ChakraWrapper>
        <MessageField value={nearLimitMessage} onChange={mockOnChange} />
      </ChakraWrapper>
    );

    const counter = screen.getByText('450/500');
    expect(counter).toHaveStyle('color: var(--chakra-colors-orange-500)');
  });

  it('should validate maximum length', () => {
    const longMessage = 'A'.repeat(501);
    render(
      <ChakraWrapper>
        <MessageField value={longMessage} onChange={mockOnChange} />
      </ChakraWrapper>
    );

    expect(
      screen.getByText('Message must be no more than 500 characters long')
    ).toBeInTheDocument();
  });

  it('should display error message when provided', () => {
    render(
      <ChakraWrapper>
        <MessageField value="" onChange={mockOnChange} error="Custom error" />
      </ChakraWrapper>
    );

    expect(screen.getByText('Custom error')).toBeInTheDocument();
  });

  it('should validate required field when isRequired is true', () => {
    render(
      <ChakraWrapper>
        <MessageField value="" onChange={mockOnChange} isRequired={true} />
      </ChakraWrapper>
    );

    expect(screen.getByText('Message is required')).toBeInTheDocument();
  });

  it('should be disabled when isDisabled is true', () => {
    render(
      <ChakraWrapper>
        <MessageField value="" onChange={mockOnChange} isDisabled={true} />
      </ChakraWrapper>
    );

    const textarea = screen.getByLabelText('Message for the Couple (Optional)');
    expect(textarea).toBeDisabled();
  });

  it('should not be required by default', () => {
    render(
      <ChakraWrapper>
        <MessageField value="" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    const textarea = screen.getByLabelText('Message for the Couple (Optional)');
    expect(textarea).not.toHaveAttribute('aria-required', 'true');
  });
});
