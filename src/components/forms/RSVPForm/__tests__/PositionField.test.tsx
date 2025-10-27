import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import PositionField from '../RelationshipField';

const ChakraWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ChakraProvider>{children}</ChakraProvider>;

describe('PositionField', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render with correct label and placeholder', () => {
    render(
      <ChakraWrapper>
        <PositionField value="Friend" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    expect(
      screen.getByText('Mối Quan Hệ Với Cô Dâu Chú Rể')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('ví dụ: Bạn bè, Gia đình, Đồng nghiệp...')
    ).toBeInTheDocument();
  });

  it('should display helper text when no error', () => {
    render(
      <ChakraWrapper>
        <PositionField value="Friend" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    expect(
      screen.getByText(
        'Bạn quen biết cô dâu chú rể như thế nào? Bạn có thể chọn từ gợi ý hoặc tự nhập.'
      )
    ).toBeInTheDocument();
  });

  it('should call onChange when input value changes', () => {
    render(
      <ChakraWrapper>
        <PositionField value="" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    const input = screen.getByPlaceholderText(
      'ví dụ: Bạn bè, Gia đình, Đồng nghiệp...'
    );
    fireEvent.change(input, { target: { value: 'Bạn bè' } });

    expect(mockOnChange).toHaveBeenCalledWith('Bạn bè');
  });

  it('should show suggestions dropdown on focus', async () => {
    render(
      <ChakraWrapper>
        <PositionField value="" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    const input = screen.getByPlaceholderText(
      'ví dụ: Bạn bè, Gia đình, Đồng nghiệp...'
    );
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('Bạn bè')).toBeInTheDocument();
      expect(screen.getByText('Gia đình')).toBeInTheDocument();
      expect(screen.getByText('Đồng nghiệp')).toBeInTheDocument();
    });
  });

  it('should filter suggestions based on input', async () => {
    render(
      <ChakraWrapper>
        <PositionField value="" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    const input = screen.getByPlaceholderText(
      'ví dụ: Bạn bè, Gia đình, Đồng nghiệp...'
    );
    fireEvent.change(input, { target: { value: 'bạn' } });

    await waitFor(() => {
      expect(screen.getByText('Bạn bè')).toBeInTheDocument();
      expect(screen.queryByText('Gia đình')).not.toBeInTheDocument();
    });
  });

  it('should select suggestion when clicked', async () => {
    render(
      <ChakraWrapper>
        <PositionField value="" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    const input = screen.getByPlaceholderText(
      'ví dụ: Bạn bè, Gia đình, Đồng nghiệp...'
    );
    fireEvent.focus(input);

    await waitFor(() => {
      const friendOption = screen.getByText('Bạn bè');
      fireEvent.click(friendOption);
    });

    expect(mockOnChange).toHaveBeenCalledWith('Bạn bè');
  });

  it('should display error message when provided', () => {
    render(
      <ChakraWrapper>
        <PositionField value="" onChange={mockOnChange} error="Custom error" />
      </ChakraWrapper>
    );

    expect(screen.getByText('Custom error')).toBeInTheDocument();
  });

  it('should be disabled when isDisabled is true', () => {
    render(
      <ChakraWrapper>
        <PositionField value="" onChange={mockOnChange} isDisabled={true} />
      </ChakraWrapper>
    );

    const input = screen.getByPlaceholderText(
      'ví dụ: Bạn bè, Gia đình, Đồng nghiệp...'
    );
    expect(input).toBeDisabled();
  });
});
