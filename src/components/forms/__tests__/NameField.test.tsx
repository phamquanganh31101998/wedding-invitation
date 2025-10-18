import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import NameField from '../NameField';

const ChakraWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ChakraProvider>{children}</ChakraProvider>;

describe('NameField', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render with correct label and placeholder', () => {
    render(
      <ChakraWrapper>
        <NameField value="John" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    expect(screen.getByText('Full Name')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter your full name')
    ).toBeInTheDocument();
  });

  it('should display helper text when no error', () => {
    render(
      <ChakraWrapper>
        <NameField value="John" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    expect(
      screen.getByText("Enter your full name as you'd like it to appear")
    ).toBeInTheDocument();
  });

  it('should call onChange when input value changes', () => {
    render(
      <ChakraWrapper>
        <NameField value="" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    const input = screen.getByPlaceholderText('Enter your full name');
    fireEvent.change(input, { target: { value: 'John Doe' } });

    expect(mockOnChange).toHaveBeenCalledWith('John Doe');
  });

  it('should display error message when provided', () => {
    render(
      <ChakraWrapper>
        <NameField value="" onChange={mockOnChange} error="Custom error" />
      </ChakraWrapper>
    );

    expect(screen.getByText('Custom error')).toBeInTheDocument();
  });

  it('should validate required field', () => {
    render(
      <ChakraWrapper>
        <NameField value="" onChange={mockOnChange} isRequired={true} />
      </ChakraWrapper>
    );

    const input = screen.getByPlaceholderText('Enter your full name');
    expect(input).toHaveAttribute('aria-required', 'true');
  });

  it('should validate minimum length', () => {
    render(
      <ChakraWrapper>
        <NameField value="A" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    expect(
      screen.getByText('Name must be at least 2 characters long')
    ).toBeInTheDocument();
  });

  it('should validate maximum length', () => {
    const longName = 'A'.repeat(51);
    render(
      <ChakraWrapper>
        <NameField value={longName} onChange={mockOnChange} />
      </ChakraWrapper>
    );

    expect(
      screen.getByText('Name must be no more than 50 characters long')
    ).toBeInTheDocument();
  });

  it('should validate character pattern', () => {
    render(
      <ChakraWrapper>
        <NameField value="John123" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    expect(
      screen.getByText(
        'Name can only contain letters, spaces, hyphens, and apostrophes'
      )
    ).toBeInTheDocument();
  });

  it('should accept valid names with special characters', () => {
    render(
      <ChakraWrapper>
        <NameField value="Mary-Jane O'Connor" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should be disabled when isDisabled is true', () => {
    render(
      <ChakraWrapper>
        <NameField value="" onChange={mockOnChange} isDisabled={true} />
      </ChakraWrapper>
    );

    const input = screen.getByPlaceholderText('Enter your full name');
    expect(input).toBeDisabled();
  });
});
