import * as yup from 'yup';

// Validation schema for RSVP data
export const rsvpValidationSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be no more than 50 characters'),
  relationship: yup
    .string()
    .required('Relationship is required')
    .trim()
    .min(1, 'Relationship is required')
    .max(100, 'Relationship must be no more than 100 characters'),
  attendance: yup
    .string()
    .required('Attendance is required')
    .oneOf(['yes', 'no', 'maybe'], 'Attendance must be one of: yes, no, maybe'),
  message: yup
    .string()
    .optional()
    .max(500, 'Message must be no more than 500 characters'),
});
