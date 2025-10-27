'use client';

import {
  FormControl,
  FormLabel,
  Textarea,
  FormErrorMessage,
  FormHelperText,
  Text,
  Flex,
} from '@chakra-ui/react';
import { forwardRef } from 'react';

interface MessageFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
}

const MAX_MESSAGE_LENGTH = 500;

const MessageField = forwardRef<HTMLTextAreaElement, MessageFieldProps>(
  ({ value, onChange, error, isRequired = false, isDisabled = false }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      // Only update if within character limit
      if (newValue.length <= MAX_MESSAGE_LENGTH) {
        onChange(newValue);
      }
    };
    const characterCount = value.length;
    const isNearLimit = characterCount > MAX_MESSAGE_LENGTH * 0.8; // 80% of limit

    return (
      <FormControl isInvalid={!!error} isRequired={isRequired}>
        <FormLabel htmlFor="message-field">
          Lời Nhắn Gửi Cô Dâu Chú Rể
        </FormLabel>
        <Textarea
          ref={ref}
          id="message-field"
          name="message"
          value={value}
          onChange={handleChange}
          placeholder="Chia sẻ niềm vui hoặc lời chúc tốt đẹp với cô dâu chú rể..."
          isDisabled={isDisabled}
          aria-describedby={error ? 'message-error' : 'message-helper'}
          minH={{ base: '100px', sm: '120px' }} // Responsive height
          fontSize="16px" // Prevent zoom on iOS
          resize="vertical"
          _focus={{
            borderColor: 'blue.500',
            boxShadow: 'outline',
          }}
        />

        {/* Character Counter and Helper/Error Text */}
        <Flex justify="space-between" align="center" mt={2}>
          <div>
            {error ? (
              <FormErrorMessage id="message-error" mt={0} textAlign="left">
                {error}
              </FormErrorMessage>
            ) : (
              <FormHelperText id="message-helper" mt={0} textAlign="left">
                Chia sẻ suy nghĩ, lời chúc tốt đẹp hoặc niềm vui cho ngày trọng
                đại
              </FormHelperText>
            )}
          </div>
          <Text
            fontSize="sm"
            color={isNearLimit ? 'orange.500' : 'gray.500'}
            fontWeight={isNearLimit ? 'medium' : 'normal'}
            ml={4}
            flexShrink={0}
          >
            {characterCount}/{MAX_MESSAGE_LENGTH}
          </Text>
        </Flex>
      </FormControl>
    );
  }
);

MessageField.displayName = 'MessageField';

export default MessageField;
