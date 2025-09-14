import { 
  getCurrentDateInTimezone, 
  getCurrentDateTimeInTimezone,
  isValidTimezone,
  getDefaultTimezone,
  COMMON_TIMEZONES 
} from '@/lib/timezone';

describe('Timezone Utilities', () => {
  test('should validate timezone correctly', () => {
    expect(isValidTimezone('America/New_York')).toBe(true);
    expect(isValidTimezone('Europe/London')).toBe(true);
    expect(isValidTimezone('Asia/Tokyo')).toBe(true);
    expect(isValidTimezone('Invalid/Timezone')).toBe(false);
    expect(isValidTimezone('')).toBe(false);
  });

  test('should get current date in timezone', () => {
    const utcDate = getCurrentDateInTimezone('UTC');
    const nyDate = getCurrentDateInTimezone('America/New_York');
    
    // Both should return valid date strings in YYYY-MM-DD format
    expect(utcDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(nyDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('should get default timezone', () => {
    const defaultTz = getDefaultTimezone();
    expect(isValidTimezone(defaultTz)).toBe(true);
  });

  test('should have common timezones available', () => {
    expect(COMMON_TIMEZONES.length).toBeGreaterThan(0);
    expect(COMMON_TIMEZONES[0]).toHaveProperty('value');
    expect(COMMON_TIMEZONES[0]).toHaveProperty('label');
    
    // Test that all common timezones are valid
    COMMON_TIMEZONES.forEach(tz => {
      expect(isValidTimezone(tz.value)).toBe(true);
    });
  });

  test('should handle timezone differences', () => {
    const utcDate = getCurrentDateInTimezone('UTC');
    const pacificDate = getCurrentDateInTimezone('America/Los_Angeles');
    
    // These might be different depending on the time of day
    // but both should be valid dates
    expect(utcDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(pacificDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
