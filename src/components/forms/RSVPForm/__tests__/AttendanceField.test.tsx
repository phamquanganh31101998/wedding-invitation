import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import AttendanceField from '../AttendanceField';

const ChakraWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ChakraProvider>{children}</ChakraProvider>;

describe('AttendanceField', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render with correct label', () => {
    render(
      <ChakraWrapper>
        <AttendanceField value="" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    expect(screen.getByText('Will you be attending?')).toBeInTheDocument();
  });

  it('should render all attendance options', () => {
    render(
      <ChakraWrapper>
        <AttendanceField value="" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    expect(screen.getByText("Yes, I'll be there")).toBeInTheDocument();
    expect(screen.getByText("No, I can't make it")).toBeInTheDocument();
    expect(screen.getByText('Maybe')).toBeInTheDocument();
  });

  it('should display option descriptions', () => {
    render(
      <ChakraWrapper>
        <AttendanceField value="" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    expect(
      screen.getByText('Looking forward to celebrating with you!')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Wishing you a wonderful celebration')
    ).toBeInTheDocument();
    expect(
      screen.getByText("I'm not sure yet, but I'll let you know")
    ).toBeInTheDocument();
  });

  it('should call onChange when option is selected', () => {
    render(
      <ChakraWrapper>
        <AttendanceField value="" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    const yesOption = screen.getByDisplayValue('yes');
    fireEvent.click(yesOption);

    expect(mockOnChange).toHaveBeenCalledWith('yes');
  });

  it('should show selected value', () => {
    render(
      <ChakraWrapper>
        <AttendanceField value="yes" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    const yesOption = screen.getByDisplayValue('yes');
    expect(yesOption).toBeChecked();
  });

  it('should display error message when provided', () => {
    render(
      <ChakraWrapper>
        <AttendanceField
          value=""
          onChange={mockOnChange}
          error="Custom error"
        />
      </ChakraWrapper>
    );

    expect(screen.getByText('Custom error')).toBeInTheDocument();
  });

  it('should display helper text when no error', () => {
    render(
      <ChakraWrapper>
        <AttendanceField value="yes" onChange={mockOnChange} />
      </ChakraWrapper>
    );

    expect(
      screen.getByText(
        "Please let us know if you'll be able to join us for our special day"
      )
    ).toBeInTheDocument();
  });

  it('should be disabled when isDisabled is true', () => {
    render(
      <ChakraWrapper>
        <AttendanceField value="" onChange={mockOnChange} isDisabled={true} />
      </ChakraWrapper>
    );

    const radioInputs = screen.getAllByRole('radio');

    radioInputs.forEach((radio) => {
      expect(radio).toBeDisabled();
    });
  });
});
