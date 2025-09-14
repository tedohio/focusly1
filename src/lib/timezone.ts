/**
 * Timezone utility functions for handling user timezone operations
 * DANGEROUS DANGEROUS DANGEROUS - Critical timezone handling
 * If these functions are wrong, all date/time operations will be incorrect
 */

// Common timezones for the dropdown
export const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona Time (MST)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKST)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Europe/Rome', label: 'Rome (CET/CEST)' },
  { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (CET/CEST)' },
  { value: 'Europe/Stockholm', label: 'Stockholm (CET/CEST)' },
  { value: 'Europe/Zurich', label: 'Zurich (CET/CEST)' },
  { value: 'Europe/Vienna', label: 'Vienna (CET/CEST)' },
  { value: 'Europe/Prague', label: 'Prague (CET/CEST)' },
  { value: 'Europe/Warsaw', label: 'Warsaw (CET/CEST)' },
  { value: 'Europe/Athens', label: 'Athens (EET/EEST)' },
  { value: 'Europe/Helsinki', label: 'Helsinki (EET/EEST)' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Seoul', label: 'Seoul (KST)' },
  { value: 'Asia/Kolkata', label: 'Mumbai/Delhi (IST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Bangkok', label: 'Bangkok (ICT)' },
  { value: 'Asia/Jakarta', label: 'Jakarta (WIB)' },
  { value: 'Asia/Manila', label: 'Manila (PHT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEST/AEDT)' },
  { value: 'Australia/Perth', label: 'Perth (AWST)' },
  { value: 'Australia/Adelaide', label: 'Adelaide (ACST/ACDT)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)' },
  { value: 'America/Toronto', label: 'Toronto (EST/EDT)' },
  { value: 'America/Vancouver', label: 'Vancouver (PST/PDT)' },
  { value: 'America/Mexico_City', label: 'Mexico City (CST/CDT)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (ART)' },
  { value: 'America/Lima', label: 'Lima (PET)' },
  { value: 'America/Bogota', label: 'Bogotá (COT)' },
  { value: 'America/Santiago', label: 'Santiago (CLT/CLST)' },
  { value: 'Africa/Cairo', label: 'Cairo (EET)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)' },
  { value: 'Africa/Lagos', label: 'Lagos (WAT)' },
  { value: 'Africa/Nairobi', label: 'Nairobi (EAT)' },
];

/**
 * Get the current date in the user's timezone
 * DANGEROUS DANGEROUS DANGEROUS - Critical date calculation
 * This determines what "today" means for the user
 */
export function getCurrentDateInTimezone(timezone: string): string {
  try {
    const now = new Date();
    const dateInTimezone = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
    
    return dateInTimezone; // Returns YYYY-MM-DD format
  } catch (error) {
    console.error('Error getting current date in timezone:', error);
    // Fallback to UTC if timezone is invalid
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Get the current datetime in the user's timezone
 * DANGEROUS DANGEROUS DANGEROUS - Critical datetime calculation
 * This determines the exact moment in the user's timezone
 */
export function getCurrentDateTimeInTimezone(timezone: string): Date {
  try {
    const now = new Date();
    // Create a date string in the user's timezone
    const dateTimeString = new Intl.DateTimeFormat('sv-SE', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(now);
    
    return new Date(dateTimeString + 'Z'); // Add Z to make it UTC
  } catch (error) {
    console.error('Error getting current datetime in timezone:', error);
    // Fallback to current UTC time
    return new Date();
  }
}

/**
 * Convert a date to the user's timezone
 * DANGEROUS DANGEROUS DANGEROUS - Critical date conversion
 * This ensures dates are displayed correctly for the user
 */
export function convertDateToTimezone(date: Date | string, timezone: string): Date {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Get the date components in the user's timezone
    const year = new Intl.DateTimeFormat('en', { timeZone: timezone, year: 'numeric' }).format(dateObj);
    const month = new Intl.DateTimeFormat('en', { timeZone: timezone, month: '2-digit' }).format(dateObj);
    const day = new Intl.DateTimeFormat('en', { timeZone: timezone, day: '2-digit' }).format(dateObj);
    
    return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  } catch (error) {
    console.error('Error converting date to timezone:', error);
    return typeof date === 'string' ? new Date(date) : date;
  }
}

/**
 * Get the start of day in the user's timezone
 * DANGEROUS DANGEROUS DANGEROUS - Critical day boundary calculation
 * This determines when a new day starts for the user
 */
export function getStartOfDayInTimezone(timezone: string, date?: Date | string): Date {
  try {
    const targetDate = date ? (typeof date === 'string' ? new Date(date) : date) : new Date();
    
    // Get the date string in the user's timezone
    const dateString = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(targetDate);
    
    // Create a date at midnight in the user's timezone
    return new Date(`${dateString}T00:00:00.000Z`);
  } catch (error) {
    console.error('Error getting start of day in timezone:', error);
    const fallbackDate = date ? (typeof date === 'string' ? new Date(date) : date) : new Date();
    return new Date(fallbackDate.getFullYear(), fallbackDate.getMonth(), fallbackDate.getDate());
  }
}

/**
 * Get the end of day in the user's timezone
 * DANGEROUS DANGEROUS DANGEROUS - Critical day boundary calculation
 * This determines when a day ends for the user
 */
export function getEndOfDayInTimezone(timezone: string, date?: Date | string): Date {
  try {
    const targetDate = date ? (typeof date === 'string' ? new Date(date) : date) : new Date();
    
    // Get the date string in the user's timezone
    const dateString = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(targetDate);
    
    // Create a date at 23:59:59 in the user's timezone
    return new Date(`${dateString}T23:59:59.999Z`);
  } catch (error) {
    console.error('Error getting end of day in timezone:', error);
    const fallbackDate = date ? (typeof date === 'string' ? new Date(date) : date) : new Date();
    return new Date(fallbackDate.getFullYear(), fallbackDate.getMonth(), fallbackDate.getDate(), 23, 59, 59, 999);
  }
}

/**
 * Validate if a timezone is valid
 * DANGEROUS DANGEROUS DANGEROUS - Critical timezone validation
 * Invalid timezones will break all date operations
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get user's default timezone (browser detected)
 * DANGEROUS DANGEROUS DANGEROUS - Critical default timezone detection
 * This is used as fallback when user hasn't set a timezone
 */
export function getDefaultTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error('Error getting default timezone:', error);
    return 'UTC';
  }
}

/**
 * Format a date for display in the user's timezone
 * DANGEROUS DANGEROUS DANGEROUS - Critical date formatting
 * This ensures dates are displayed correctly to the user
 */
export function formatDateInTimezone(date: Date | string, timezone: string, options?: Intl.DateTimeFormatOptions): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    };
    
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj);
  } catch (error) {
    console.error('Error formatting date in timezone:', error);
    return typeof date === 'string' ? date : date.toDateString();
  }
}
