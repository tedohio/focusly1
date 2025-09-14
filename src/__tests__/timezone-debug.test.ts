import { getCurrentDateInTimezone } from '@/lib/timezone';

describe('Timezone Debug Tests', () => {
  test('should show current date in different timezones', () => {
    const utcDate = getCurrentDateInTimezone('UTC');
    const nyDate = getCurrentDateInTimezone('America/New_York');
    const laDate = getCurrentDateInTimezone('America/Los_Angeles');
    const tokyoDate = getCurrentDateInTimezone('Asia/Tokyo');
    
    console.log('Current date in different timezones:');
    console.log('UTC:', utcDate);
    console.log('New York:', nyDate);
    console.log('Los Angeles:', laDate);
    console.log('Tokyo:', tokyoDate);
    
    // All should be valid dates
    expect(utcDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(nyDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(laDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(tokyoDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('should show what day of week it is in different timezones', () => {
    const utcDate = getCurrentDateInTimezone('UTC');
    const nyDate = getCurrentDateInTimezone('America/New_York');
    
    const utcDay = new Date(utcDate + 'T00:00:00Z').getDay();
    const nyDay = new Date(nyDate + 'T00:00:00Z').getDay();
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    console.log('Day of week:');
    console.log('UTC:', dayNames[utcDay], '(' + utcDate + ')');
    console.log('New York:', dayNames[nyDay], '(' + nyDate + ')');
    
    expect(utcDay).toBeGreaterThanOrEqual(0);
    expect(utcDay).toBeLessThanOrEqual(6);
    expect(nyDay).toBeGreaterThanOrEqual(0);
    expect(nyDay).toBeLessThanOrEqual(6);
  });
});
