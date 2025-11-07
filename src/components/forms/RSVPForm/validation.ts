import * as Yup from 'yup';

// Yup validation schema for RSVP form
export const validationSchema = Yup.object({
  name: Yup.string()
    .required('Tên là bắt buộc')
    .trim()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(50, 'Tên không được quá 50 ký tự'),
  relationship: Yup.string()
    .required('Mối quan hệ là bắt buộc')
    .min(1, 'Mối quan hệ phải có ít nhất 1 ký tự')
    .max(100, 'Mối quan hệ không được quá 100 ký tự'),
  attendance: Yup.string().required('Hãy chọn trạng thái tham dự'),
  message: Yup.string()
    .max(500, 'Tin nhắn không được quá 500 ký tự')
    .optional(),
});
