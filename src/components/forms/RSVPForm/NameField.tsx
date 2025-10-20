'use client';

import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  FormHelperText,
} from '@chakra-ui/react';
import { forwardRef } from 'react';

interface NameFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
}

const NameField = forwardRef<HTMLInputElement, NameFieldProps>(
  ({ value, onChange, error, isRequired = true, isDisabled = false }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(newValue);
    };

    return (
      <FormControl isInvalid={!!error} isRequired={isRequired}>
        <FormLabel htmlFor="name-field">Full Name</FormLabel>
        <Input
          ref={ref}
          id="name-field"
          name="name"
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Enter your full name"
          isDisabled={isDisabled}
          aria-describedby={error ? 'name-error' : 'name-helper'}
          minH="44px" // Ensure 44px minimum touch target
          fontSize="16px" // Prevent zoom on iOS
        />
        {error ? (
          <FormErrorMessage id="name-error" textAlign="left">
            {error}
          </FormErrorMessage>
        ) : (
          <FormHelperText id="name-helper" textAlign="left">
            Enter your full name as you&apos;d like it to appear
          </FormHelperText>
        )}
      </FormControl>
    );
  }
);

NameField.displayName = 'NameField';

export default NameField;
