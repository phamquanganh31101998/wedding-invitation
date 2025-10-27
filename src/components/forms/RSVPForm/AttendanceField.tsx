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
    label: 'Có',
  },
  {
    value: 'no',
    label: 'Không',
  },
];

const AttendanceField = forwardRef<HTMLDivElement, AttendanceFieldProps>(
  ({ value, onChange, error, isRequired = true, isDisabled = false }, ref) => {
    return (
      <FormControl isInvalid={!!error} isRequired={isRequired} ref={ref}>
        <FormLabel htmlFor="attendance-field">Bạn có tham dự không?</FormLabel>
        <RadioGroup
          id="attendance-field"
          name="attendance"
          value={value}
          onChange={onChange}
          isDisabled={isDisabled}
          aria-describedby={error ? 'attendance-error' : 'attendance-helper'}
        >
          <Stack spacing={1} direction="column">
            {ATTENDANCE_OPTIONS.map((option) => (
              <Radio
                key={option.value}
                value={option.value}
                size="lg"
                minH="44px" // Ensure 44px minimum touch target
                display="flex"
                alignItems="center"
                justifyContent="flex-start"
                _focus={{
                  boxShadow: 'outline',
                }}
                textAlign="left"
                aria-describedby={`attendance-${option.value}-description`}
              >
                <Stack spacing={1} ml={2} textAlign="left" align="flex-start">
                  <span>{option.label}</span>
                </Stack>
              </Radio>
            ))}
          </Stack>
        </RadioGroup>
        {error ? (
          <FormErrorMessage id="attendance-error" textAlign="left">
            {error}
          </FormErrorMessage>
        ) : (
          <FormHelperText id="attendance-helper" textAlign="left">
            Vui lòng cho chúng tôi biết bạn có thể tham dự ngày đặc biệt của
            chúng tôi không
          </FormHelperText>
        )}
      </FormControl>
    );
  }
);

AttendanceField.displayName = 'AttendanceField';

export default AttendanceField;
