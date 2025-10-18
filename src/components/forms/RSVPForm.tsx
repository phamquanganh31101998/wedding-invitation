'use client';

import {
  Box,
  VStack,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { useState } from 'react';
import { RSVPFormData, RSVPData } from '@/types';
import { NameField, PositionField, AttendanceField, MessageField } from './';

interface RSVPFormProps {
  onSuccess?: (data: RSVPData) => void;
  onError?: (error: string) => void;
}

interface FormState {
  isSubmitting: boolean;
  submitError: string | null;
  isSubmitted: boolean;
}

const RSVPForm: React.FC<RSVPFormProps> = ({ onSuccess, onError }) => {
  const [formState, setFormState] = useState<FormState>({
    isSubmitting: false,
    submitError: null,
    isSubmitted: false,
  });

  const toast = useToast();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<RSVPFormData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      relationship: '',
      attendance: undefined,
      message: '',
    },
  });

  const validateForm = (data: RSVPFormData): Record<string, string> => {
    const validationErrors: Record<string, string> = {};

    // Name validation
    if (!data.name.trim()) {
      validationErrors.name = 'Name is required';
    } else if (data.name.length < 2) {
      validationErrors.name = 'Name must be at least 2 characters long';
    } else if (data.name.length > 50) {
      validationErrors.name = 'Name must be no more than 50 characters long';
    } else if (!/^[a-zA-Z\s\-']+$/.test(data.name)) {
      validationErrors.name =
        'Name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Relationship validation
    if (!data.relationship.trim()) {
      validationErrors.relationship = 'Relationship is required';
    } else if (data.relationship.length < 1) {
      validationErrors.relationship =
        'Relationship must be at least 1 character long';
    } else if (data.relationship.length > 100) {
      validationErrors.relationship =
        'Relationship must be no more than 100 characters long';
    }

    // Attendance validation
    if (!data.attendance) {
      validationErrors.attendance = 'Please select your attendance status';
    } else if (!['yes', 'no', 'maybe'].includes(data.attendance)) {
      validationErrors.attendance = 'Please select a valid attendance option';
    }

    // Message validation (optional field)
    if (data.message && data.message.length > 500) {
      validationErrors.message =
        'Message must be no more than 500 characters long';
    }

    return validationErrors;
  };

  const onSubmit = async (data: RSVPFormData) => {
    // Clear previous errors
    setFormState((prev) => ({ ...prev, submitError: null }));

    // Validate form data
    const validationErrors = validateForm(data);
    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.values(validationErrors)[0];
      setFormState((prev) => ({ ...prev, submitError: firstError }));
      onError?.(firstError);
      return;
    }

    setFormState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit RSVP');
      }

      const result = await response.json();

      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
        isSubmitted: true,
        submitError: null,
      }));

      toast({
        title: 'RSVP Submitted Successfully!',
        description:
          'Thank you for your response. We look forward to celebrating with you!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onSuccess?.(result.data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';

      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
        submitError: errorMessage,
      }));

      toast({
        title: 'Submission Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      onError?.(errorMessage);
    }
  };

  const handleReset = () => {
    reset();
    setFormState({
      isSubmitting: false,
      submitError: null,
      isSubmitted: false,
    });
  };

  if (formState.isSubmitted) {
    return (
      <Box
        maxW={{ base: '100%', sm: 'md' }}
        mx="auto"
        p={{ base: 4, sm: 6 }}
        w="full"
      >
        <Alert
          status="success"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          minHeight={{ base: '180px', sm: '200px' }}
          borderRadius="lg"
          p={{ base: 4, sm: 6 }}
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            RSVP Submitted Successfully!
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            Thank you for your response. We look forward to celebrating with
            you!
          </AlertDescription>
          <Button
            mt={4}
            colorScheme="blue"
            variant="outline"
            onClick={handleReset}
            size={{ base: 'sm', sm: 'md' }}
            minH="44px"
          >
            Submit Another RSVP
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      maxW={{ base: '100%', sm: 'md' }}
      mx="auto"
      p={{ base: 4, sm: 6 }}
      w="full"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={{ base: 4, sm: 6 }} align="stretch">
          {/* Form Error Display */}
          {formState.submitError && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <AlertDescription>{formState.submitError}</AlertDescription>
            </Alert>
          )}

          {/* Name Field */}
          <Controller
            name="name"
            control={control}
            rules={{
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters long',
              },
              maxLength: {
                value: 50,
                message: 'Name must be no more than 50 characters long',
              },
              pattern: {
                value: /^[a-zA-Z\s\-']+$/,
                message:
                  'Name can only contain letters, spaces, hyphens, and apostrophes',
              },
            }}
            render={({ field }) => (
              <NameField
                value={field.value}
                onChange={field.onChange}
                error={errors.name?.message}
                isDisabled={formState.isSubmitting}
              />
            )}
          />

          {/* Relationship Field */}
          <Controller
            name="relationship"
            control={control}
            rules={{
              required: 'Relationship is required',
              minLength: {
                value: 1,
                message: 'Relationship must be at least 1 character long',
              },
              maxLength: {
                value: 100,
                message:
                  'Relationship must be no more than 100 characters long',
              },
            }}
            render={({ field }) => (
              <PositionField
                value={field.value}
                onChange={field.onChange}
                error={errors.relationship?.message}
                isDisabled={formState.isSubmitting}
              />
            )}
          />

          {/* Attendance Field */}
          <Controller
            name="attendance"
            control={control}
            rules={{
              required: 'Please select your attendance status',
              validate: (value) =>
                ['yes', 'no', 'maybe'].includes(value) ||
                'Please select a valid attendance option',
            }}
            render={({ field }) => (
              <AttendanceField
                value={field.value}
                onChange={field.onChange}
                error={errors.attendance?.message}
                isDisabled={formState.isSubmitting}
              />
            )}
          />

          {/* Message Field */}
          <Controller
            name="message"
            control={control}
            rules={{
              maxLength: {
                value: 500,
                message: 'Message must be no more than 500 characters long',
              },
            }}
            render={({ field }) => (
              <MessageField
                value={field.value || ''}
                onChange={field.onChange}
                error={errors.message?.message}
                isDisabled={formState.isSubmitting}
                isRequired={false}
              />
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            minH="44px"
            w="full"
            fontSize={{ base: 'md', sm: 'lg' }}
            isLoading={formState.isSubmitting}
            loadingText="Submitting RSVP..."
            isDisabled={!isValid || formState.isSubmitting}
            _hover={{
              transform: 'translateY(-1px)',
              boxShadow: 'lg',
            }}
            _active={{
              transform: 'translateY(0)',
            }}
          >
            Submit RSVP
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default RSVPForm;
