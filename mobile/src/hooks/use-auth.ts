/**
 * use-auth.ts
 *
 * Login form state, client-side validation, and API orchestration.
 * Security: Validates email format and min password length before any network call.
 */

import { useState, useCallback } from 'react';
import { AuthError } from '@/services/auth.service';
import { useAuthContext } from '@/context/auth-context';

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required.';
  if (!EMAIL_REGEX.test(email.trim())) return 'Please enter a valid email address.';
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return 'Password is required.';
  if (password.length < MIN_PASSWORD_LENGTH)
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  return null;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseLoginReturn {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  emailError: string | null;
  passwordError: string | null;
  serverError: string | null;
  isLoading: boolean;
  handleLogin: () => Promise<void>;
  clearErrors: () => void;
}

/**
 * Encapsulates login form state & logic.
 * @param onSuccess — called with (token, user) after a successful login
 */
export function useLogin(
  onSuccess?: (token: string, user: object) => void,
): UseLoginReturn {
  const { login: contextLogin } = useAuthContext();
  const [email, setEmailRaw] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Clear individual field error on change
  const setEmail = useCallback((value: string) => {
    setEmailRaw(value);
    if (emailError) setEmailError(null);
    if (serverError) setServerError(null);
  }, [emailError, serverError]);

  const clearErrors = useCallback(() => {
    setEmailError(null);
    setPasswordError(null);
    setServerError(null);
  }, []);

  const handleLogin = useCallback(async () => {
    // Client-side validation
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);

    if (eErr || pErr) return;

    setIsLoading(true);
    setServerError(null);

    try {
      const result = await contextLogin(email, password);
      onSuccess?.(result.token, result.user);
    } catch (err) {
      if (err instanceof AuthError) {
        setServerError(err.message);
      } else {
        setServerError('Something went wrong. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, password, onSuccess, contextLogin]);

  return {
    email,
    setEmail,
    password,
    setPassword: useCallback((v: string) => {
      setPassword(v);
      if (passwordError) setPasswordError(null);
      if (serverError) setServerError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [passwordError, serverError]),
    emailError,
    passwordError,
    serverError,
    isLoading,
    handleLogin,
    clearErrors,
  };
}

// ---------------------------------------------------------------------------
// useRegister hook
// ---------------------------------------------------------------------------

export interface UseRegisterReturn {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  emailError: string | null;
  passwordError: string | null;
  confirmPasswordError: string | null;
  serverError: string | null;
  isLoading: boolean;
  handleRegister: () => Promise<void>;
}

/**
 * Encapsulates registration form state & logic.
 * @param onSuccess — called after successful registration
 */
export function useRegister(onSuccess?: () => void): UseRegisterReturn {
  const { register: contextRegister } = useAuthContext();
  const [email, setEmailRaw] = useState('');
  const [password, setPasswordRaw] = useState('');
  const [confirmPassword, setConfirmPasswordRaw] = useState('');

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setEmail = useCallback((v: string) => {
    setEmailRaw(v);
    setEmailError(null);
    setServerError(null);
  }, []);

  const setPassword = useCallback((v: string) => {
    setPasswordRaw(v);
    setPasswordError(null);
    setServerError(null);
  }, []);

  const setConfirmPassword = useCallback((v: string) => {
    setConfirmPasswordRaw(v);
    setConfirmPasswordError(null);
  }, []);

  const handleRegister = useCallback(async () => {
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    const cErr = !confirmPassword
      ? 'Please confirm your password.'
      : confirmPassword !== password
        ? 'Passwords do not match.'
        : null;

    setEmailError(eErr);
    setPasswordError(pErr);
    setConfirmPasswordError(cErr);

    if (eErr || pErr || cErr) return;

    setIsLoading(true);
    setServerError(null);

    try {
      await contextRegister(email, password);
      onSuccess?.();
    } catch (err) {
      if (err instanceof AuthError) {
        setServerError(err.message);
      } else {
        setServerError('Something went wrong. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, password, confirmPassword, onSuccess, contextRegister]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    emailError,
    passwordError,
    confirmPasswordError,
    serverError,
    isLoading,
    handleRegister,
  };
}

