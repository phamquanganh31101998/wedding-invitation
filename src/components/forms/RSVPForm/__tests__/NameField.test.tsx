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

    expect(screen.getByText('Họ và Tên')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Nhập họ và tên đầy đủ')
    ).toBeInTheDocument();
  });

  it('should display helper text when no error', () => {
    render(
      <ChakraWrapper>
        <NameField value="John" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    expect(
      screen.getByText('Nhập họ và tên đầy đủ như bạn muốn hiển thị')
    ).toBeInTheDocument();
  });

  it('should call onChange when input value changes', () => {
    render(
      <ChakraWrapper>
        <NameField value="" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    const input = screen.getByPlaceholderText('Nhập họ và tên đầy đủ');
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

    const input = screen.getByPlaceholderText('Nhập họ và tên đầy đủ');
    expect(input).toHaveAttribute('aria-required', 'true');
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

    const input = screen.getByPlaceholderText('Nhập họ và tên đầy đủ');
    expect(input).toBeDisabled();
  });
});
