'use client';

import {
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Stack,
  FormErrorMessage,
  FormHelperText,
} from '@chakra-ui/react';
import { forwardRef } from 'react';

interface AttendanceFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
}

const ATTENDANCE_OPTIONS = [
  {
    value: 'yes',
    label: 'Yes, I&apos;ll be there',
    description: 'Looking forward to celebrating with you!',
  },
  {
    value: 'no',
    label: 'No, I can&apos;t make it',
    description: 'Wishing you a wonderful celebration',
  },
  {
    value: 'maybe',
    label: 'Maybe',
    description: 'I&apos;m not sure yet, but I&apos;ll let you know',
  },
];

const AttendanceField = forwardRef<HTMLDivElement, AttendanceFieldProps>(
  ({ value, onChange, error, isRequired = true, isDisabled = false }, ref) => {
    const validateAttendance = (attendance: string): string | undefined => {
      if (isRequired && !attendance) {
        return 'Please select your attendance status';
      }

      const validOptions = ATTENDANCE_OPTIONS.map((option) => option.value);
      if (attendance && !validOptions.includes(attendance)) {
        return 'Please select a valid attendance option';
      }

      return undefined;
    };

    const validationError = validateAttendance(value) || error;

    return (
      <FormControl
        isInvalid={!!validationError}
        isRequired={isRequired}
        ref={ref}
      >
        <FormLabel htmlFor="attendance-field">Will you be attending?</FormLabel>
        <RadioGroup
          id="attendance-field"
          name="attendance"
          value={value}
          onChange={onChange}
          isDisabled={isDisabled}
          aria-describedby={
            validationError ? 'attendance-error' : 'attendance-helper'
          }
        >
          <Stack spacing={4} direction="column">
            {ATTENDANCE_OPTIONS.map((option) => (
              <Radio
                key={option.value}
                value={option.value}
                size="lg"
                minH="44px" // Ensure 44px minimum touch target
                display="flex"
                alignItems="center"
                _focus={{
                  boxShadow: 'outline',
                }}
                aria-describedby={`attendance-${option.value}-description`}
              >
                <Stack spacing={1} ml={2}>
                  <span>{option.label}</span>
                  <FormHelperText
                    id={`attendance-${option.value}-description`}
                    mt={0}
                    fontSize="sm"
                    color="gray.600"
                  >
                    {option.description}
                  </FormHelperText>
                </Stack>
              </Radio>
            ))}
          </Stack>
        </RadioGroup>
        {validationError ? (
          <FormErrorMessage id="attendance-error">
            {validationError}
          </FormErrorMessage>
        ) : (
          <FormHelperText id="attendance-helper">
            Please let us know if you&apos;ll be able to join us for our special
            day
          </FormHelperText>
        )}
      </FormControl>
    );
  }
);

AttendanceField.displayName = 'AttendanceField';

export default AttendanceField;
