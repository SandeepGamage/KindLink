/**
 * Comprehensive input validation helpers for KindLink
 */

/**
 * Validates an email address with format, domain, and common typo checks.
 * Returns an error string if invalid, or null if valid.
 */
export function validateEmailAddress(email: string): string | null {
  const trimmed = email.trim();

  if (!trimmed) {
    return 'Please enter your email address.';
  }

  // Spaces check
  if (/\s/.test(trimmed)) {
    return 'Email address cannot contain spaces.';
  }

  // Basic structure check
  if (!trimmed.includes('@')) {
    return 'Email address must include an "@" symbol.';
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return 'Email address can only contain one "@" symbol.';
  }

  const [localPart, domainPart] = parts;

  if (!localPart || localPart.length === 0) {
    return 'Please enter the username before the "@" symbol.';
  }

  if (!domainPart || domainPart.length === 0) {
    return 'Please enter a domain after the "@" symbol.';
  }

  if (trimmed.includes('..')) {
    return 'Email address cannot contain consecutive dots (..).';
  }

  if (!domainPart.includes('.')) {
    return 'Email domain must include a domain extension (e.g. .com, .org).';
  }

  if (domainPart.startsWith('.')) {
    return 'Email domain cannot start with a dot.';
  }

  if (domainPart.endsWith('.')) {
    return 'Email domain cannot end with a dot.';
  }

  // Check common typos for major email providers
  const lowerDomain = domainPart.toLowerCase();
  const typoDomainMap: Record<string, string> = {
    'gmail.co': 'gmail.com',
    'gmail.c': 'gmail.com',
    'gmail.cm': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'yahoo.co': 'yahoo.com',
    'yahoo.c': 'yahoo.com',
    'hotmail.co': 'hotmail.com',
    'hotmail.c': 'hotmail.com',
    'outlook.co': 'outlook.com',
    'outlook.c': 'outlook.com',
    'icloud.co': 'icloud.com',
    'icloud.c': 'icloud.com',
  };

  if (typoDomainMap[lowerDomain]) {
    return `Invalid domain: Did you mean @${typoDomainMap[lowerDomain]}?`;
  }

  // Standard email format regex check
  const strictEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  if (!strictEmailRegex.test(trimmed)) {
    return 'Please enter a valid email address (e.g. yourname@example.com).';
  }

  // TLD validation
  const domainSegments = domainPart.split('.');
  const tld = domainSegments[domainSegments.length - 1];
  if (!tld || tld.length < 2) {
    return 'Domain extension must be at least 2 characters.';
  }
  if (!/^[a-zA-Z]+$/.test(tld)) {
    return 'Domain extension must only contain letters.';
  }

  return null;
}

/**
 * Validates a full name
 */
export function validateFullName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'Please enter your full name.';
  }
  if (trimmed.length < 2) {
    return 'Full name must be at least 2 characters.';
  }
  if (trimmed.length > 60) {
    return 'Full name must be 60 characters or fewer.';
  }
  if (!/^[a-zA-Z\s'.\-]+$/.test(trimmed)) {
    return 'Full name can only contain letters and spaces.';
  }
  return null;
}

/**
 * Validates a mobile phone number
 */
export function validateMobileNumber(mobile: string): string | null {
  const trimmed = mobile.trim();
  if (!trimmed) {
    return 'Please enter your mobile phone number.';
  }
  if (!/^[0-9+\-\s()]+$/.test(trimmed)) {
    return 'Mobile number contains invalid characters.';
  }
  const cleanDigits = trimmed.replace(/\D/g, '');
  const is10Digits = cleanDigits.length === 10;
  const isLKWithCode = cleanDigits.startsWith('94') && cleanDigits.length === 11;
  if (!is10Digits && !isLKWithCode) {
    return 'Mobile number must be exactly 10 digits (e.g. 077 123 4567).';
  }
  return null;
}

/**
 * Validates age (optional, but if provided, must be within valid range)
 */
export function validateAge(age: string, isElderly: boolean = true): string | null {
  const trimmed = age.trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) {
    return 'Age must be a valid whole number.';
  }
  const parsed = parseInt(trimmed, 10);
  if (isElderly && (parsed < 40 || parsed > 120)) {
    return 'Please enter a valid age (between 40 and 120).';
  }
  if (!isElderly && (parsed < 16 || parsed > 100)) {
    return 'Volunteer age must be between 16 and 100 years.';
  }
  return null;
}

/**
 * Validates home address (optional, but if provided, must be realistic)
 */
export function validateAddress(address: string): string | null {
  const trimmed = address.trim();
  if (!trimmed) return null;
  if (trimmed.length < 5) {
    return 'Home address must be at least 5 characters.';
  }
  if (trimmed.length > 200) {
    return 'Home address must be 200 characters or fewer.';
  }
  return null;
}

/**
 * Validates emergency contact name
 */
export function validateEmergencyName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'Please enter contact person name.';
  }
  if (trimmed.length < 2) {
    return 'Contact person name must be at least 2 characters.';
  }
  if (trimmed.length > 60) {
    return 'Contact person name must be 60 characters or fewer.';
  }
  if (!/^[a-zA-Z\s'.\-]+$/.test(trimmed)) {
    return 'Contact person name can only contain letters and spaces.';
  }
  return null;
}

/**
 * Validates emergency contact phone number
 */
export function validateEmergencyPhone(phone: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed) {
    return 'Please enter contact person phone number.';
  }
  if (!/^[0-9+\-\s()]+$/.test(trimmed)) {
    return 'Phone number contains invalid characters.';
  }
  const cleanDigits = trimmed.replace(/\D/g, '');
  const is10Digits = cleanDigits.length === 10;
  const isLKWithCode = cleanDigits.startsWith('94') && cleanDigits.length === 11;
  if (!is10Digits && !isLKWithCode) {
    return 'Phone number must be exactly 10 digits (e.g. 077 123 4567).';
  }
  return null;
}

