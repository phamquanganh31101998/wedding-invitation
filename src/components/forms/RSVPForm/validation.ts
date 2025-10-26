import * as Yup from 'yup';

// Yup validation schema for RSVP form
export const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be no more than 50 characters'),
  relationship: Yup.string()
    .required('Relationship is required')
    .min(1, 'Relationship must be at least 1 character long')
    .max(100, 'Relationship must be no more than 100 characters long'),
  attendance: Yup.string()
    .required('Please select your attendance status')
    .oneOf(['yes', 'no', 'maybe'], 'Please select a valid attendance option'),
  message: Yup.string()
    .max(500, 'Message must be no more than 500 characters long')
    .optional(),
});
