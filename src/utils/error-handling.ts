import { NextResponse } from 'next/server';
import * as yup from 'yup';

// Error types for better categorization
export enum ErrorType {
  VALIDATION = 'validation',
  DATABASE = 'database',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  RATE_LIMIT = 'rate_limit',
  SYSTEM = 'system',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Structured error interface
export interface ApiError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  details?: string | string[];
  code?: string;
  statusCode: number;
  timestamp: string;
  requestId?: string;
}

// Database error patterns
const DATABASE_ERROR_PATTERNS = {
  CONNECTION: /connection|connect|timeout|network/i,
  CONSTRAINT: /constraint|violates|duplicate|unique/i,
  FOREIGN_KEY: /foreign key|fkey|references/i,
  NOT_NULL: /not null|null value/i,
  CHECK_CONSTRAINT: /check constraint|check violation/i,
  DATA_TYPE: /invalid input|type|cast/i,
  PERMISSION: /permission|access|denied|unauthorized/i,
} as const;

// Create standardized API error
export function createApiError(
  type: ErrorType,
  message: string,
  statusCode: number,
  details?: string | string[],
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  code?: string
): ApiError {
  return {
    type,
    severity,
    message,
    details,
    code,
    statusCode,
    timestamp: new Date().toISOString(),
  };
}

// Handle Yup validation errors
export function handleValidationError(error: yup.ValidationError): ApiError {
  return createApiError(
    ErrorType.VALIDATION,
    'Validation failed',
    400,
    error.errors,
    ErrorSeverity.LOW,
    'VALIDATION_ERROR'
  );
}

// Handle database errors with pattern matching
export function handleDatabaseError(error: Error): ApiError {
  const errorMessage = error.message.toLowerCase();

  // Connection errors
  if (DATABASE_ERROR_PATTERNS.CONNECTION.test(errorMessage)) {
    return createApiError(
      ErrorType.DATABASE,
      'Database connection error',
      503,
      'Unable to connect to the database. Please try again later.',
      ErrorSeverity.HIGH,
      'DB_CONNECTION_ERROR'
    );
  }

  // Constraint violations
  if (DATABASE_ERROR_PATTERNS.CONSTRAINT.test(errorMessage)) {
    if (errorMessage.includes('duplicate') || errorMessage.includes('unique')) {
      return createApiError(
        ErrorType.DATABASE,
        'Duplicate entry',
        409,
        'A record with this information already exists.',
        ErrorSeverity.LOW,
        'DB_DUPLICATE_ERROR'
      );
    }

    return createApiError(
      ErrorType.DATABASE,
      'Data constraint violation',
      400,
      'The provided data violates database constraints.',
      ErrorSeverity.MEDIUM,
      'DB_CONSTRAINT_ERROR'
    );
  }

  // Foreign key violations
  if (DATABASE_ERROR_PATTERNS.FOREIGN_KEY.test(errorMessage)) {
    return createApiError(
      ErrorType.DATABASE,
      'Invalid reference',
      400,
      'Referenced record does not exist.',
      ErrorSeverity.MEDIUM,
      'DB_FOREIGN_KEY_ERROR'
    );
  }

  // Not null violations
  if (DATABASE_ERROR_PATTERNS.NOT_NULL.test(errorMessage)) {
    return createApiError(
      ErrorType.DATABASE,
      'Missing required data',
      400,
      'Required fields cannot be empty.',
      ErrorSeverity.MEDIUM,
      'DB_NOT_NULL_ERROR'
    );
  }

  // Check constraint violations
  if (DATABASE_ERROR_PATTERNS.CHECK_CONSTRAINT.test(errorMessage)) {
    return createApiError(
      ErrorType.DATABASE,
      'Invalid data value',
      400,
      'The provided data does not meet the required format or constraints.',
      ErrorSeverity.MEDIUM,
      'DB_CHECK_CONSTRAINT_ERROR'
    );
  }

  // Data type errors
  if (DATABASE_ERROR_PATTERNS.DATA_TYPE.test(errorMessage)) {
    return createApiError(
      ErrorType.DATABASE,
      'Invalid data type',
      400,
      'The provided data is not in the correct format.',
      ErrorSeverity.MEDIUM,
      'DB_DATA_TYPE_ERROR'
    );
  }

  // Permission errors
  if (DATABASE_ERROR_PATTERNS.PERMISSION.test(errorMessage)) {
    return createApiError(
      ErrorType.DATABASE,
      'Database access denied',
      403,
      'Insufficient permissions to perform this operation.',
      ErrorSeverity.HIGH,
      'DB_PERMISSION_ERROR'
    );
  }

  // Generic database error
  return createApiError(
    ErrorType.DATABASE,
    'Database operation failed',
    500,
    'An unexpected database error occurred.',
    ErrorSeverity.HIGH,
    'DB_GENERIC_ERROR'
  );
}

// Handle tenant-related errors
export function handleTenantError(
  tenantSlug: string,
  details?: string
): ApiError {
  return createApiError(
    ErrorType.NOT_FOUND,
    'Tenant not found',
    404,
    details || `Tenant '${tenantSlug}' not found or inactive.`,
    ErrorSeverity.MEDIUM,
    'TENANT_NOT_FOUND'
  );
}

// Handle guest/RSVP not found errors
export function handleGuestNotFoundError(guestId: string | number): ApiError {
  return createApiError(
    ErrorType.NOT_FOUND,
    'Guest not found',
    404,
    `Guest with ID '${guestId}' not found.`,
    ErrorSeverity.LOW,
    'GUEST_NOT_FOUND'
  );
}

// Handle system errors
export function handleSystemError(error: Error): ApiError {
  // Log the full error for debugging (in production, use proper logging)
  console.error('System error:', error);

  return createApiError(
    ErrorType.SYSTEM,
    'Internal server error',
    500,
    'An unexpected error occurred. Please try again later.',
    ErrorSeverity.CRITICAL,
    'SYSTEM_ERROR'
  );
}

// Convert ApiError to NextResponse
export function errorToResponse(error: ApiError): NextResponse {
  // In production, you might want to sanitize error details based on severity
  const responseBody = {
    error: error.message,
    type: error.type,
    code: error.code,
    timestamp: error.timestamp,
    ...(error.details && { details: error.details }),
  };

  return NextResponse.json(responseBody, { status: error.statusCode });
}

// Main error handler for API routes
export function handleApiError(error: unknown): NextResponse {
  // Yup validation errors
  if (error instanceof yup.ValidationError) {
    return errorToResponse(handleValidationError(error));
  }

  // Standard Error objects
  if (error instanceof Error) {
    // Check if it's a database error
    if (
      error.message.includes('Database') ||
      error.message.includes('SQL') ||
      error.message.includes('connection') ||
      error.message.includes('constraint')
    ) {
      return errorToResponse(handleDatabaseError(error));
    }

    // Check if it's a tenant error
    if (error.message.includes('tenant') || error.message.includes('Tenant')) {
      const tenantMatch = error.message.match(/tenant '([^']+)'/i);
      const tenantId = tenantMatch ? tenantMatch[1] : 'unknown';
      return errorToResponse(handleTenantError(tenantId, error.message));
    }

    // Generic system error
    return errorToResponse(handleSystemError(error));
  }

  // Unknown error type
  return errorToResponse(
    createApiError(
      ErrorType.SYSTEM,
      'Unknown error occurred',
      500,
      'An unexpected error occurred.',
      ErrorSeverity.CRITICAL,
      'UNKNOWN_ERROR'
    )
  );
}

// Input sanitization utilities
export class InputSanitizer {
  // Sanitize string input to prevent XSS and injection
  static sanitizeString(input: string): string {
    if (!input) return '';

    return input
      .trim()
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .substring(0, 1000); // Limit length
  }

  // Sanitize tenant ID
  static sanitizeTenantId(input: string): string {
    if (!input) return '';

    return input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '') // Only allow alphanumeric, hyphens, underscores
      .replace(/--+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .substring(0, 50); // Limit to database constraint
  }

  // Sanitize numeric ID
  static sanitizeNumericId(input: string): number | null {
    if (!input) return null;

    const cleaned = input.replace(/[^\d]/g, '');
    const num = parseInt(cleaned, 10);

    if (isNaN(num) || num <= 0 || num > 2147483647) {
      return null;
    }

    return num;
  }

  // Validate and sanitize message content
  static sanitizeMessage(input: string): string {
    if (!input) return '';

    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .substring(0, 1000); // Limit length
  }
}
