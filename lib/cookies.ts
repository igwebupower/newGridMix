// Cookie Consent Management - GDPR Compliant

export interface CookiePreferences {
  necessary: boolean; // Always true, cannot be disabled
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
};

const CONSENT_COOKIE_NAME = 'gridmix-cookie-consent';
const PREFERENCES_COOKIE_NAME = 'gridmix-cookie-preferences';

// Check if user has made a consent decision
export function hasConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(CONSENT_COOKIE_NAME) !== null;
}

// Get current cookie preferences
export function getCookiePreferences(): CookiePreferences {
  if (typeof window === 'undefined') return defaultPreferences;

  const stored = localStorage.getItem(PREFERENCES_COOKIE_NAME);
  if (!stored) return defaultPreferences;

  try {
    return JSON.parse(stored);
  } catch {
    return defaultPreferences;
  }
}

// Save cookie preferences
export function saveCookiePreferences(preferences: CookiePreferences): void {
  if (typeof window === 'undefined') return;

  // Ensure necessary is always true
  const validPreferences = { ...preferences, necessary: true };

  localStorage.setItem(PREFERENCES_COOKIE_NAME, JSON.stringify(validPreferences));
  localStorage.setItem(CONSENT_COOKIE_NAME, new Date().toISOString());

  // Trigger custom event for components to react to preference changes
  window.dispatchEvent(new CustomEvent('cookiePreferencesChanged', {
    detail: validPreferences
  }));
}

// Accept all cookies
export function acceptAllCookies(): void {
  saveCookiePreferences({
    necessary: true,
    analytics: true,
    marketing: true,
    preferences: true,
  });
}

// Reject optional cookies (keep only necessary)
export function rejectOptionalCookies(): void {
  saveCookiePreferences(defaultPreferences);
}

// Clear all consent data (for testing)
export function clearConsent(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CONSENT_COOKIE_NAME);
  localStorage.removeItem(PREFERENCES_COOKIE_NAME);
}

// Check if specific cookie type is allowed
export function isCookieAllowed(type: keyof CookiePreferences): boolean {
  const preferences = getCookiePreferences();
  return preferences[type];
}

// Get readable descriptions for cookie types
export function getCookieTypeInfo(type: keyof CookiePreferences): {
  title: string;
  description: string;
  required: boolean;
} {
  const info = {
    necessary: {
      title: 'Necessary Cookies',
      description: 'Essential for the website to function properly. These cookies enable basic functions like page navigation and access to secure areas. The website cannot function properly without these cookies.',
      required: true,
    },
    analytics: {
      title: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve the website experience.',
      required: false,
    },
    marketing: {
      title: 'Marketing Cookies',
      description: 'Used to track visitors across websites to display relevant advertisements. These cookies help us show you content that may interest you.',
      required: false,
    },
    preferences: {
      title: 'Preference Cookies',
      description: 'Enable the website to remember information that changes the way the website behaves or looks, like your preferred language or the region you are in.',
      required: false,
    },
  };

  return info[type];
}
