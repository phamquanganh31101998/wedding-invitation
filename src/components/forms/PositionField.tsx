'use client';

import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  FormHelperText,
  Box,
  List,
  ListItem,
  Button,
  useDisclosure,
  useOutsideClick,
} from '@chakra-ui/react';
import { forwardRef, useRef, useState } from 'react';

interface PositionFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
}

const COMMON_RELATIONSHIPS = [
  'Friend',
  'Family',
  'Colleague',
  'Classmate',
  'Neighbor',
  'College Friend',
  'Work Friend',
  'Childhood Friend',
  'Cousin',
  'Sibling',
  'Extended Family',
  'Other',
];

const PositionField = forwardRef<HTMLInputElement, PositionFieldProps>(
  ({ value, onChange, error, isRequired = true, isDisabled = false }, ref) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>(
      []
    );
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useOutsideClick({
      ref: containerRef,
      handler: onClose,
    });

    const validatePosition = (position: string): string | undefined => {
      if (isRequired && !position.trim()) {
        return 'Relationship is required';
      }

      if (position.length < 1) {
        return 'Relationship must be at least 1 character long';
      }

      if (position.length > 100) {
        return 'Relationship must be no more than 100 characters long';
      }

      return undefined;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(newValue);

      // Filter suggestions based on input
      if (newValue.trim()) {
        const filtered = COMMON_RELATIONSHIPS.filter((relationship) =>
          relationship.toLowerCase().includes(newValue.toLowerCase())
        );
        setFilteredSuggestions(filtered);
        if (filtered.length > 0 && !isOpen) {
          onOpen();
        }
      } else {
        setFilteredSuggestions(COMMON_RELATIONSHIPS);
        if (!isOpen) {
          onOpen();
        }
      }
    };

    const handleFocus = () => {
      setFilteredSuggestions(
        value.trim()
          ? COMMON_RELATIONSHIPS.filter((relationship) =>
              relationship.toLowerCase().includes(value.toLowerCase())
            )
          : COMMON_RELATIONSHIPS
      );
      onOpen();
    };

    const handleSuggestionClick = (suggestion: string) => {
      onChange(suggestion);
      onClose();
      inputRef.current?.focus();
    };

    const validationError = validatePosition(value) || error;

    return (
      <FormControl
        isInvalid={!!validationError}
        isRequired={isRequired}
        ref={containerRef}
        position="relative"
      >
        <FormLabel htmlFor="position-field">
          Your Relationship with the Couple
        </FormLabel>
        <Input
          ref={ref || inputRef}
          id="position-field"
          name="position"
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder="e.g., Friend, Family, Colleague..."
          isDisabled={isDisabled}
          aria-describedby={
            validationError ? 'position-error' : 'position-helper'
          }
          minH="44px" // Ensure 44px minimum touch target
          fontSize="16px" // Prevent zoom on iOS
          autoComplete="off"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
        />

        {/* Suggestions Dropdown */}
        {isOpen && filteredSuggestions.length > 0 && (
          <Box
            position="absolute"
            top="100%"
            left={0}
            right={0}
            zIndex={10}
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            boxShadow="lg"
            maxH="200px"
            overflowY="auto"
            mt={1}
          >
            <List role="listbox" spacing={0}>
              {filteredSuggestions.map((suggestion) => (
                <ListItem key={suggestion} role="option">
                  <Button
                    variant="ghost"
                    width="100%"
                    justifyContent="flex-start"
                    px={3}
                    py={2}
                    minH="44px" // Ensure 44px minimum touch target
                    borderRadius={0}
                    fontWeight="normal"
                    _hover={{
                      bg: 'gray.50',
                    }}
                    _focus={{
                      bg: 'blue.50',
                      boxShadow: 'outline',
                    }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    tabIndex={-1} // Prevent tab navigation to suggestions
                  >
                    {suggestion}
                  </Button>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {validationError ? (
          <FormErrorMessage id="position-error">
            {validationError}
          </FormErrorMessage>
        ) : (
          <FormHelperText id="position-helper">
            How do you know the couple? You can select from suggestions or type
            your own.
          </FormHelperText>
        )}
      </FormControl>
    );
  }
);

PositionField.displayName = 'PositionField';

export default PositionField;
