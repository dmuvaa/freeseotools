/**
 * Maps technical errors (Supabase/Postgres) to user-friendly messages.
 * 
 * @param error The error object returned from a catch block or Supabase client
 * @param context Optional context to refine the message (e.g., 'create_project')
 * @returns A user-friendly string
 */
export function getFriendlyErrorMessage(error: any, context?: string): string {
    if (!error) return 'An unknown error occurred.';

    // Extract raw message and code
    const rawMessage = (error.message || error.error_description || (typeof error === 'string' ? error : '')).toLowerCase();
    const code = error.code || '';

    // 1. RLS / Permission Errors
    // Postgres code 42501: insufficient_privilege
    if (code === '42501' || rawMessage.includes('violates row-level security') || rawMessage.includes('permission denied')) {
        return "You don't have permission to perform this action. Please check your workspace access.";
    }

    // 2. Uniqueness Violations
    // Postgres code 23505: unique_violation
    if (code === '23505' || rawMessage.includes('unique constraint') || rawMessage.includes('already exists')) {
        if (context === 'create_project') {
            return "A project with this name already exists in your organization.";
        }
        return "This record already exists.";
    }

    // 3. Foreign Key Violations
    // Postgres code 23503: foreign_key_violation
    if (code === '23503' || rawMessage.includes('foreign key constraint')) {
        return "This action references a record that doesn't exist.";
    }

    // 4. Invalid Input / Check Violations
    // Postgres code 23514: check_violation
    if (code === '23514' || rawMessage.includes('check constraint')) {
        return "The provided data is invalid. Please check your inputs.";
    }

    // 5. Network / Connection Errors
    if (rawMessage.includes('fetch') || rawMessage.includes('network') || rawMessage.includes('connection')) {
        return "Unable to connect to the server. Please check your internet connection.";
    }

    // Fallback: Use the raw message if it looks safe/readable, otherwise generic
    // We try to return the raw message if it's short, as it might be a custom application error
    if (rawMessage && rawMessage.length < 100) {
        // Capitalize first letter
        return rawMessage.charAt(0).toUpperCase() + rawMessage.slice(1);
    }

    return "An unexpected error occurred. Please try again.";
}
