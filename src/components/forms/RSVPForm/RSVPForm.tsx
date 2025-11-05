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
import { useSubmitGuest } from '@/features/guest/services/guest.hooks';
import RSVPSuccessAlert from './RSVPSuccessAlert';
import MessageField from './MessageField';
import NameField from './NameField';
import PositionField from './RelationshipField';
import AttendanceField from './AttendanceField';

interface RSVPFormProps {
  guestId?: string | number | null;
  initialData?: RSVPData | null;
  tenantSlug?: string | null; // The tenant slug from URL
  onSuccess?: (data: RSVPData) => void;
  onError?: (error: string) => void;
}

interface FormState {
  submitError: string | null;
  isSubmitted: boolean;
}

const RSVPForm: React.FC<RSVPFormProps> = ({
  guestId,
  initialData,
  tenantSlug,
  onSuccess,
  onError,
}) => {
  const initialValues: RSVPFormData = {
    name: initialData?.name || '',
    relationship: initialData?.relationship || '',
    attendance: (initialData?.attendance as 'yes' | 'no' | 'maybe' | '') || '',
    message: initialData?.message || '',
  };
  const [formState, setFormState] = useState<FormState>({
    submitError: null,
    isSubmitted: false,
  });

  const toast = useToast();

  // Use React Query mutation for form submission
  const submitMutation = useSubmitGuest({
    onSuccess: (data) => {
      setFormState((prev) => ({
        ...prev,
        isSubmitted: true,
        submitError: null,
      }));

      const isUpdate = initialData !== null;
      toast({
        title: isUpdate ? 'Cập Nhật RSVP Thành Công!' : 'Gửi RSVP Thành Công!',
        description: isUpdate
          ? 'RSVP của bạn đã được cập nhật. Cảm ơn bạn!'
          : 'Cảm ơn phản hồi của bạn. Chúng tôi mong được ăn mừng cùng bạn!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onSuccess?.(data);
    },
    onError: (errorMessage) => {
      setFormState((prev) => ({
        ...prev,
        submitError: errorMessage,
      }));

      toast({
        title: 'Gửi Thất Bại',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      onError?.(errorMessage);
    },
  });

  const handleSubmit = async (
    values: RSVPFormData,
    { setSubmitting }: FormikHelpers<RSVPFormData>
  ) => {
    // Clear previous errors
    setFormState((prev) => ({ ...prev, submitError: null }));

    try {
      await submitMutation.mutateAsync({
        data: values,
        guestId,
        tenantSlug,
      });
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
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        validateOnChange={false}
        onSubmit={handleSubmit}
      >
        {({ values, errors, setFieldValue, isSubmitting }) => (
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
                loadingText="Đang gửi RSVP..."
                isDisabled={isSubmitting}
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: 'lg',
                }}
                _active={{
                  transform: 'translateY(0)',
                }}
              >
                Gửi RSVP
              </Button>
            </VStack>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default RSVPForm;
