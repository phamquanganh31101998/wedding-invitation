import * as yup from 'yup';

// Database constraint constants
export const DB_CONSTRAINTS = {
  NAME_MAX_LENGTH: 100,
  NAME_MIN_LENGTH: 1,
  RELATIONSHIP_MAX_LENGTH: 50,
  RELATIONSHIP_MIN_LENGTH: 1,
  MESSAGE_MAX_LENGTH: 1000, // Increased from 500 to match TEXT field capacity
  TENANT_ID_MAX_LENGTH: 50,
  TENANT_ID_MIN_LENGTH: 2,
} as const;

// Attendance enum values (matching database CHECK constraint)
export const ATTENDANCE_VALUES = ['yes', 'no', 'maybe'] as const;
export type AttendanceValue = (typeof ATTENDANCE_VALUES)[number];

// Enhanced validation schema matching database constraints
export const rsvpValidationSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .trim()
    .min(DB_CONSTRAINTS.NAME_MIN_LENGTH, 'Name cannot be empty')
    .max(
      DB_CONSTRAINTS.NAME_MAX_LENGTH,
      `Name must be no more than ${DB_CONSTRAINTS.NAME_MAX_LENGTH} characters`
    )
    .matches(
      /^[a-zA-Z0-9\s\u00C0-\u017F\u1EA0-\u1EF9\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\u0400-\u04ff\u0590-\u05ff\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\uFB50-\uFDFF\uFE70-\uFEFF\u200C\u200D\u2019\u2018\u201C\u201D\u2013\u2014\u2026\u00A0\u202F\u2009\u200A\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u200B\u00AD\u061C\u200E\u200F\u202A\u202B\u202C\u202D\u202E\u2066\u2067\u2068\u2069\u206A\u206B\u206C\u206D\u206E\u206F\u00B7\u2022\u2023\u2043\u204C\u204D\u2047\u2048\u2049\u204A\u204B\u00B4\u0060\u00B8\u02C6\u02DC\u00A8\u02D8\u02D9\u02DA\u00B8\u02DD\u02DB\u02C7\u02C9\u00AF\u02D0\u02D1\u0384\u0385\u1FBD\u1FBF\u1FC0\u1FC1\u1FCD\u1FCE\u1FCF\u1FDD\u1FDE\u1FDF\u1FED\u1FEE\u1FEF\u1FFD\u1FFE\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E3-\u0902\u093A\u093C\u0941-\u0948\u094D\u0951-\u0957\u0962\u0963\u0981\u09BC\u09C1-\u09C4\u09CD\u09E2\u09E3\u0A01\u0A02\u0A3C\u0A41\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81\u0A82\u0ABC\u0AC1-\u0AC5\u0AC7\u0AC8\u0ACD\u0AE2\u0AE3\u0B01\u0B3C\u0B3F\u0B41-\u0B44\u0B4D\u0B56\u0B62\u0B63\u0B82\u0BC0\u0BCD\u0C00\u0C3E-\u0C40\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81\u0CBC\u0CBF\u0CC6\u0CCC\u0CCD\u0CE2\u0CE3\u0D01\u0D41-\u0D44\u0D4D\u0D62\u0D63\u0DCA\u0DD2-\u0DD4\u0DD6\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085\u1086\u108D\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17B5\u17B7-\u17BD\u17C6\u17C9-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17\u1A18\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80\u1B81\u1BA2-\u1BA5\u1BA8\u1BA9\u1BAB-\u1BAD\u1BE6\u1BE8\u1BE9\u1BED\u1BEF-\u1BF1\u1C2C-\u1C33\u1C36\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF5\u1DFC-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099\u309A\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA825\uA826\uA8C4\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA951\uA980-\uA982\uA9B3\uA9B6-\uA9B9\uA9BC\uA9E5\uAA29-\uAA2E\uAA31\uAA32\uAA35\uAA36\uAA43\uAA4C\uAA7C\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEC\uAAED\uAAF6\uABE5\uABE8\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F\u0027\u002D\u002E\u0028\u0029\u005B\u005D\u007B\u007D\u003A\u003B\u002C\u0021\u003F\u0040\u0023\u0024\u0025\u005E\u0026\u002A\u005F\u002B\u003D\u007C\u005C\u007E\u0060]+$/,
      'Name contains invalid characters'
    )
    .test('no-only-spaces', 'Name cannot contain only spaces', (value) => {
      return value ? value.trim().length > 0 : false;
    }),
  relationship: yup
    .string()
    .required('Relationship is required')
    .trim()
    .min(DB_CONSTRAINTS.RELATIONSHIP_MIN_LENGTH, 'Relationship cannot be empty')
    .max(
      DB_CONSTRAINTS.RELATIONSHIP_MAX_LENGTH,
      `Relationship must be no more than ${DB_CONSTRAINTS.RELATIONSHIP_MAX_LENGTH} characters`
    )
    .matches(
      /^[a-zA-Z0-9\s\u00C0-\u017F\u1EA0-\u1EF9\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\u0400-\u04ff\u0590-\u05ff\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\uFB50-\uFDFF\uFE70-\uFEFF\u200C\u200D\u2019\u2018\u201C\u201D\u2013\u2014\u2026\u00A0\u202F\u2009\u200A\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u200B\u00AD\u061C\u200E\u200F\u202A\u202B\u202C\u202D\u202E\u2066\u2067\u2068\u2069\u206A\u206B\u206C\u206D\u206E\u206F\u00B7\u2022\u2023\u2043\u204C\u204D\u2047\u2048\u2049\u204A\u204B\u00B4\u0060\u00B8\u02C6\u02DC\u00A8\u02D8\u02D9\u02DA\u00B8\u02DD\u02DB\u02C7\u02C9\u00AF\u02D0\u02D1\u0384\u0385\u1FBD\u1FBF\u1FC0\u1FC1\u1FCD\u1FCE\u1FCF\u1FDD\u1FDE\u1FDF\u1FED\u1FEE\u1FEF\u1FFD\u1FFE\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E3-\u0902\u093A\u093C\u0941-\u0948\u094D\u0951-\u0957\u0962\u0963\u0981\u09BC\u09C1-\u09C4\u09CD\u09E2\u09E3\u0A01\u0A02\u0A3C\u0A41\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81\u0A82\u0ABC\u0AC1-\u0AC5\u0AC7\u0AC8\u0ACD\u0AE2\u0AE3\u0B01\u0B3C\u0B3F\u0B41-\u0B44\u0B4D\u0B56\u0B62\u0B63\u0B82\u0BC0\u0BCD\u0C00\u0C3E-\u0C40\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81\u0CBC\u0CBF\u0CC6\u0CCC\u0CCD\u0CE2\u0CE3\u0D01\u0D41-\u0D44\u0D4D\u0D62\u0D63\u0DCA\u0DD2-\u0DD4\u0DD6\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085\u1086\u108D\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17B5\u17B7-\u17BD\u17C6\u17C9-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17\u1A18\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80\u1B81\u1BA2-\u1BA5\u1BA8\u1BA9\u1BAB-\u1BAD\u1BE6\u1BE8\u1BE9\u1BED\u1BEF-\u1BF1\u1C2C-\u1C33\u1C36\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF5\u1DFC-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099\u309A\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA825\uA826\uA8C4\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA951\uA980-\uA982\uA9B3\uA9B6-\uA9B9\uA9BC\uA9E5\uAA29-\uAA2E\uAA31\uAA32\uAA35\uAA36\uAA43\uAA4C\uAA7C\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEC\uAAED\uAAF6\uABE5\uABE8\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F\u0027\u002D\u002E\u0028\u0029\u005B\u005D\u007B\u007D\u003A\u003B\u002C\u0021\u003F\u0040\u0023\u0024\u0025\u005E\u0026\u002A\u005F\u002B\u003D\u007C\u005C\u007E\u0060]+$/,
      'Relationship contains invalid characters'
    )
    .test(
      'no-only-spaces',
      'Relationship cannot contain only spaces',
      (value) => {
        return value ? value.trim().length > 0 : false;
      }
    ),
  attendance: yup
    .string()
    .required('Attendance is required')
    .oneOf(
      ATTENDANCE_VALUES,
      `Attendance must be one of: ${ATTENDANCE_VALUES.join(', ')}`
    ),
  message: yup
    .string()
    .optional()
    .nullable()
    .max(
      DB_CONSTRAINTS.MESSAGE_MAX_LENGTH,
      `Message must be no more than ${DB_CONSTRAINTS.MESSAGE_MAX_LENGTH} characters`
    )
    .test(
      'safe-content',
      'Message contains potentially unsafe content',
      (value) => {
        if (!value) return true;
        // Basic XSS prevention - reject common script patterns
        const dangerousPatterns = [
          /<script/i,
          /javascript:/i,
          /on\w+\s*=/i,
          /<iframe/i,
          /<object/i,
          /<embed/i,
          /<link/i,
          /<meta/i,
          /data:text\/html/i,
          /vbscript:/i,
        ];
        return !dangerousPatterns.some((pattern) => pattern.test(value));
      }
    ),
});

// Tenant slug validation schema (renamed from tenantId for clarity)
export const tenantIdValidationSchema = yup.object({
  tenantId: yup
    .string()
    .required('Tenant slug is required')
    .trim()
    .min(
      DB_CONSTRAINTS.TENANT_ID_MIN_LENGTH,
      `Tenant slug must be at least ${DB_CONSTRAINTS.TENANT_ID_MIN_LENGTH} characters`
    )
    .max(
      DB_CONSTRAINTS.TENANT_ID_MAX_LENGTH,
      `Tenant slug must be no more than ${DB_CONSTRAINTS.TENANT_ID_MAX_LENGTH} characters`
    )
    .matches(
      /^[a-zA-Z0-9-_]+$/,
      'Tenant slug can only contain letters, numbers, hyphens, and underscores'
    )
    .test(
      'no-consecutive-hyphens',
      'Tenant slug cannot contain consecutive hyphens',
      (value) => {
        return value ? !value.includes('--') : true;
      }
    )
    .test(
      'no-start-end-hyphen',
      'Tenant slug cannot start or end with a hyphen',
      (value) => {
        return value ? !value.startsWith('-') && !value.endsWith('-') : true;
      }
    ),
});

// Alias for backward compatibility
export const tenantSlugValidationSchema = tenantIdValidationSchema;

// Guest ID validation for API endpoints
export const guestIdValidationSchema = yup.object({
  id: yup
    .string()
    .required('Guest ID is required')
    .matches(/^\d+$/, 'Guest ID must be a valid number')
    .test(
      'positive-integer',
      'Guest ID must be a positive integer',
      (value) => {
        if (!value) return false;
        const num = parseInt(value, 10);
        return num > 0 && num <= 2147483647; // PostgreSQL INTEGER max value
      }
    ),
});
