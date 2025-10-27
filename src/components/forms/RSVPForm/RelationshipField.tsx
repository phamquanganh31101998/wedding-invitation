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
  'Bạn bè',
  'Gia đình',
  'Đồng nghiệp',
  'Hàng xóm',
  'Khác',
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

    return (
      <FormControl
        isInvalid={!!error}
        isRequired={isRequired}
        ref={containerRef}
        position="relative"
      >
        <FormLabel htmlFor="position-field">
          Mối Quan Hệ Với Cô Dâu Chú Rể
        </FormLabel>
        <Input
          ref={ref || inputRef}
          id="position-field"
          name="position"
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder="ví dụ: Bạn bè, Gia đình, Đồng nghiệp..."
          isDisabled={isDisabled}
          aria-describedby={error ? 'position-error' : 'position-helper'}
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

        {error ? (
          <FormErrorMessage id="position-error" textAlign="left">
            {error}
          </FormErrorMessage>
        ) : (
          <FormHelperText id="position-helper" textAlign="left">
            Bạn quen biết cô dâu chú rể như thế nào?
          </FormHelperText>
        )}
      </FormControl>
    );
  }
);

PositionField.displayName = 'PositionField';

export default PositionField;
