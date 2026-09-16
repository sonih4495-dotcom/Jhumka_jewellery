// File: components/auth/auth-error.ts

// Maps NextAuth error codes (from signIn() results and OAuth redirect
// `error` query params) to user-facing messages.
export function mapAuthError(code: string | null | undefined): string | null {
  if (!code) return null;

  switch (code) {
    case 'CredentialsSignin':
      return 'Invalid email or password.';
    case 'OAuthAccountNotLinked':
      return 'That email is already registered. Please sign in with your email & password.';
    case 'AccessDenied':
      return 'Access denied.';
    case 'Verification':
      return 'The sign-in link is no longer valid.';
    case 'Configuration':
      return 'Google Sign-In is not configured yet. Please provide GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.';
    case 'OAuthSignin':
      return 'Could not connect to Google Sign-In. Please check your Google OAuth credentials.';
    case 'OAuthCallback':
      return 'Google authentication error during callback. Please try again.';
    default:
      return 'Something went wrong while signing in. Please try again.';
  }
}
