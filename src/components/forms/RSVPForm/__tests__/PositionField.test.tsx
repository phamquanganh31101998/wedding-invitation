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
      screen.getByText('Your Relationship with the Couple')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('e.g., Friend, Family, Colleague...')
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
        'How do you know the couple? You can select from suggestions or type your own.'
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
      'e.g., Friend, Family, Colleague...'
    );
    fireEvent.change(input, { target: { value: 'Friend' } });

    expect(mockOnChange).toHaveBeenCalledWith('Friend');
  });

  it('should show suggestions dropdown on focus', async () => {
    render(
      <ChakraWrapper>
        <PositionField value="" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    const input = screen.getByPlaceholderText(
      'e.g., Friend, Family, Colleague...'
    );
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('Friend')).toBeInTheDocument();
      expect(screen.getByText('Family')).toBeInTheDocument();
      expect(screen.getByText('Colleague')).toBeInTheDocument();
    });
  });

  it('should filter suggestions based on input', async () => {
    render(
      <ChakraWrapper>
        <PositionField value="" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    const input = screen.getByPlaceholderText(
      'e.g., Friend, Family, Colleague...'
    );
    fireEvent.change(input, { target: { value: 'fri' } });

    await waitFor(() => {
      expect(screen.getByText('Friend')).toBeInTheDocument();
      expect(screen.getByText('College Friend')).toBeInTheDocument();
      expect(screen.getByText('Work Friend')).toBeInTheDocument();
      expect(screen.queryByText('Family')).not.toBeInTheDocument();
    });
  });

  it('should select suggestion when clicked', async () => {
    render(
      <ChakraWrapper>
        <PositionField value="" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    const input = screen.getByPlaceholderText(
      'e.g., Friend, Family, Colleague...'
    );
    fireEvent.focus(input);

    await waitFor(() => {
      const friendOption = screen.getByText('Friend');
      fireEvent.click(friendOption);
    });

    expect(mockOnChange).toHaveBeenCalledWith('Friend');
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
      'e.g., Friend, Family, Colleague...'
    );
    expect(input).toBeDisabled();
  });
});
