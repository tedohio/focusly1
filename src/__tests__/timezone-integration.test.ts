import { getToday, getTomorrow, getYesterday } from '@/lib/date';
import { getCurrentDateInTimezone } from '@/lib/timezone';

describe('Timezone Integration Tests', () => {
  test('should get today with different timezones', () => {
    const utcToday = getToday('UTC');
    const nyToday = getToday('America/New_York');
    const tokyoToday = getToday('Asia/Tokyo');
    
    // All should be valid date strings
    expect(utcToday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(nyToday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(tokyoToday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    
    // Should match the timezone utility function
    expect(utcToday).toBe(getCurrentDateInTimezone('UTC'));
    expect(nyToday).toBe(getCurrentDateInTimezone('America/New_York'));
    expect(tokyoToday).toBe(getCurrentDateInTimezone('Asia/Tokyo'));
  });

  test('should get tomorrow with different timezones', () => {
    const utcTomorrow = getTomorrow('UTC');
    const nyTomorrow = getTomorrow('America/New_York');
    
    expect(utcTomorrow).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(nyTomorrow).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    
    // Tomorrow should be one day after today
    const utcToday = getToday('UTC');
    const nyToday = getToday('America/New_York');
    
    const utcTodayDate = new Date(utcToday);
    const utcTomorrowDate = new Date(utcTomorrow);
    const utcDiff = (utcTomorrowDate.getTime() - utcTodayDate.getTime()) / (1000 * 60 * 60 * 24);
    expect(utcDiff).toBe(1);
    
    const nyTodayDate = new Date(nyToday);
    const nyTomorrowDate = new Date(nyTomorrow);
    const nyDiff = (nyTomorrowDate.getTime() - nyTodayDate.getTime()) / (1000 * 60 * 60 * 24);
    expect(nyDiff).toBe(1);
  });

  test('should get yesterday with different timezones', () => {
    const utcYesterday = getYesterday('UTC');
    const nyYesterday = getYesterday('America/New_York');
    
    expect(utcYesterday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(nyYesterday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    
    // Yesterday should be one day before today
    const utcToday = getToday('UTC');
    const nyToday = getToday('America/New_York');
    
    const utcTodayDate = new Date(utcToday);
    const utcYesterdayDate = new Date(utcYesterday);
    const utcDiff = (utcTodayDate.getTime() - utcYesterdayDate.getTime()) / (1000 * 60 * 60 * 24);
    expect(utcDiff).toBe(1);
    
    const nyTodayDate = new Date(nyToday);
    const nyYesterdayDate = new Date(nyYesterday);
    const nyDiff = (nyTodayDate.getTime() - nyYesterdayDate.getTime()) / (1000 * 60 * 60 * 24);
    expect(nyDiff).toBe(1);
  });

  test('should handle timezone edge cases', () => {
    // Test with invalid timezone (should fallback gracefully)
    const invalidToday = getToday('Invalid/Timezone');
    expect(invalidToday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    
    // Test with undefined timezone (should use UTC)
    const undefinedToday = getToday(undefined);
    expect(undefinedToday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    
    // Test with empty string timezone (should use UTC)
    const emptyToday = getToday('');
    expect(emptyToday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('should maintain consistency across timezone operations', () => {
    const timezone = 'America/Los_Angeles';
    
    const today = getToday(timezone);
    const tomorrow = getTomorrow(timezone);
    const yesterday = getYesterday(timezone);
    
    // All should be valid dates
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(tomorrow).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(yesterday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    
    // Verify the relationships
    const todayDate = new Date(today);
    const tomorrowDate = new Date(tomorrow);
    const yesterdayDate = new Date(yesterday);
    
    const tomorrowDiff = (tomorrowDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24);
    const yesterdayDiff = (todayDate.getTime() - yesterdayDate.getTime()) / (1000 * 60 * 60 * 24);
    
    expect(tomorrowDiff).toBe(1);
    expect(yesterdayDiff).toBe(1);
  });
});
