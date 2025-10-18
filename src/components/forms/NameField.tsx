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
    const validateName = (name: string): string | undefined => {
      if (isRequired && !name.trim()) {
        return 'Name is required';
      }

      if (name.length < 2) {
        return 'Name must be at least 2 characters long';
      }

      if (name.length > 50) {
        return 'Name must be no more than 50 characters long';
      }

      // Allow letters, spaces, hyphens, and apostrophes only
      const validNamePattern = /^[a-zA-Z\s\-']+$/;
      if (!validNamePattern.test(name)) {
        return 'Name can only contain letters, spaces, hyphens, and apostrophes';
      }

      return undefined;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(newValue);
    };

    const validationError = validateName(value) || error;

    return (
      <FormControl isInvalid={!!validationError} isRequired={isRequired}>
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
          aria-describedby={validationError ? 'name-error' : 'name-helper'}
          minH="44px" // Ensure 44px minimum touch target
          fontSize="16px" // Prevent zoom on iOS
        />
        {validationError ? (
          <FormErrorMessage id="name-error">{validationError}</FormErrorMessage>
        ) : (
          <FormHelperText id="name-helper">
            Enter your full name as you&apos;d like it to appear
          </FormHelperText>
        )}
      </FormControl>
    );
  }
);

NameField.displayName = 'NameField';

export default NameField;
