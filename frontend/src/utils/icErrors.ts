/**
 * Utility for parsing Internet Computer (IC) rejection errors into
 * human-readable messages suitable for display to end users.
 */

interface ICRejectionError {
  reject_code?: number;
  reject_message?: string;
  error_code?: string;
}

/**
 * Parses an IC rejection error (or any error) and returns a user-friendly message.
 *
 * Known IC rejection codes:
 *  - 3: Canister not found / destination invalid
 *  - 4: Canister out of cycles
 *  - 5: Canister stopped / canister is stopped (IC0508)
 */
export function parseICError(error: unknown): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  // Try to extract structured IC rejection info from the error object
  const err = error as Record<string, unknown>;

  // Check for reject_code directly on the error object
  const rejectCode =
    typeof err.reject_code === 'number'
      ? err.reject_code
      : typeof err.rejectCode === 'number'
        ? err.rejectCode
        : null;

  if (rejectCode === 5) {
    return 'The server is temporarily unavailable. Please try again shortly.';
  }
  if (rejectCode === 4) {
    return 'Service temporarily unavailable. Please try again later.';
  }
  if (rejectCode === 3) {
    return 'Service unavailable. The requested resource could not be found.';
  }

  // Check the error message string for known patterns
  const message =
    typeof err.message === 'string'
      ? err.message
      : typeof error === 'string'
        ? error
        : '';

  if (
    message.includes('is stopped') ||
    message.includes('IC0508') ||
    message.includes('Canister is stopped') ||
    message.includes('canister is stopped')
  ) {
    return 'The server is temporarily unavailable. Please try again shortly.';
  }

  if (
    message.includes('out of cycles') ||
    message.includes('IC0508') ||
    message.includes('IC0301')
  ) {
    return 'Service temporarily unavailable. Please try again later.';
  }

  if (
    message.includes('not found') &&
    (message.includes('canister') || message.includes('Canister'))
  ) {
    return 'Service unavailable. The requested resource could not be found.';
  }

  // Check nested body for IC rejection structure (from HTTP response bodies)
  if (err.body && typeof err.body === 'object') {
    const body = err.body as ICRejectionError;
    if (body.reject_code === 5 || body.error_code === 'IC0508') {
      return 'The server is temporarily unavailable. Please try again shortly.';
    }
    if (body.reject_code === 4) {
      return 'Service temporarily unavailable. Please try again later.';
    }
    if (body.reject_code === 3) {
      return 'Service unavailable. The requested resource could not be found.';
    }
    if (body.reject_message) {
      if (
        body.reject_message.includes('is stopped') ||
        body.reject_message.includes('IC0508')
      ) {
        return 'The server is temporarily unavailable. Please try again shortly.';
      }
    }
  }

  // Return the original message if it's meaningful and doesn't contain raw IC internals
  if (message && !message.includes('Reject code') && !message.includes('reject_code')) {
    return message;
  }

  return 'An unexpected error occurred. Please try again.';
}
