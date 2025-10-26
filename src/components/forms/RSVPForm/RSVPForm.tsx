'use client';

import {
  Box,
  VStack,
  Button,
  Alert,
  AlertIcon,
  AlertDescription,
  useToast,
} from '@chakra-ui/react';
import { Formik, Form, FormikHelpers } from 'formik';
import { useState } from 'react';
import { RSVPFormData, RSVPData } from '@/types';
import { validationSchema } from './validation';
import RSVPSuccessAlert from './RSVPSuccessAlert';
import MessageField from './MessageField';
import NameField from './NameField';
import PositionField from './RelationshipField';
import AttendanceField from './AttendanceField';

interface RSVPFormProps {
  onSuccess?: (data: RSVPData) => void;
  onError?: (error: string) => void;
}

interface FormState {
  submitError: string | null;
  isSubmitted: boolean;
}

const initialValues: RSVPFormData = {
  name: '',
  relationship: '',
  attendance: '',
  message: '',
};

const RSVPForm: React.FC<RSVPFormProps> = ({ onSuccess, onError }) => {
  const [formState, setFormState] = useState<FormState>({
    submitError: null,
    isSubmitted: false,
  });

  const toast = useToast();

  const handleSubmit = async (
    values: RSVPFormData,
    { setSubmitting }: FormikHelpers<RSVPFormData>
  ) => {
    // Clear previous errors
    setFormState((prev) => ({ ...prev, submitError: null }));

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit RSVP');
      }

      const result = await response.json();

      setFormState((prev) => ({
        ...prev,
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
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormState({
      submitError: null,
      isSubmitted: false,
    });
  };

  if (formState.isSubmitted) {
    return <RSVPSuccessAlert onReset={handleReset} />;
  }

  return (
    <Box maxW={{ base: '100%', sm: 'md' }} p={{ base: 4, sm: 6 }} w="full">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        validateOnChange={false}
        onSubmit={handleSubmit}
      >
        {({ values, errors, setFieldValue, isSubmitting, isValid }) => (
          <Form>
            <VStack spacing={{ base: 4, sm: 6 }} align="stretch">
              {/* Form Error Display */}
              {formState.submitError && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription>{formState.submitError}</AlertDescription>
                </Alert>
              )}

              {/* Name Field */}
              <NameField
                value={values.name}
                onChange={(value) => setFieldValue('name', value)}
                error={errors.name}
                isDisabled={isSubmitting}
              />

              {/* Relationship Field */}
              <PositionField
                value={values.relationship}
                onChange={(value) => setFieldValue('relationship', value)}
                error={errors.relationship}
                isDisabled={isSubmitting}
              />

              {/* Attendance Field */}
              <AttendanceField
                value={values.attendance}
                onChange={(value) => setFieldValue('attendance', value)}
                error={errors.attendance}
                isDisabled={isSubmitting}
              />

              {/* Message Field */}
              <MessageField
                value={values.message || ''}
                onChange={(value) => setFieldValue('message', value)}
                error={errors.message}
                isDisabled={isSubmitting}
                isRequired={false}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                minH="44px"
                w="full"
                fontSize={{ base: 'md', sm: 'lg' }}
                isLoading={isSubmitting}
                loadingText="Submitting RSVP..."
                isDisabled={!isValid || isSubmitting}
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
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default RSVPForm;
