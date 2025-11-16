// lib/helpers/dateHelpers.ts

/**
 * Format date for display: "Monday, November 18, 2025"
 */
export const formatDateLong = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  /**
   * Format date for display: "Nov 18, 2025"
   */
  export const formatDateMedium = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  /**
   * Format date for API/database: "2025-11-18"
   */
  export const formatDateAPI = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  /**
   * Check if date is today
   */
  export const isToday = (date: Date): boolean => {
    const today = new Date();
    return formatDateAPI(date) === formatDateAPI(today);
  };
  
  /**
   * Get previous day
   */
  export const getPreviousDay = (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 1);
    return newDate;
  };
  
  /**
   * Get next day
   */
  export const getNextDay = (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    return newDate;
  };
  
  /**
   * Get today's date (reset to midnight)
   */
  export const getToday = (): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };
  
  /**
   * Compare two dates (ignoring time)
   */
  export const isSameDay = (date1: Date, date2: Date): boolean => {
    return formatDateAPI(date1) === formatDateAPI(date2);
  };
  
  /**
   * Get day of week (0 = Sunday, 6 = Saturday)
   */
  export const getDayOfWeek = (date: Date): number => {
    return date.getDay();
  };
  
  /**
   * Check if date is weekend
   */
  export const isWeekend = (date: Date): boolean => {
    const day = getDayOfWeek(date);
    return day === 0 || day === 6;
  };
  
  /**
   * Get relative date description: "Today", "Yesterday", or date string
   */
  export const getRelativeDateText = (date: Date): string => {
    const today = getToday();
    const yesterday = getPreviousDay(today);
    
    if (isSameDay(date, today)) {
      return 'Today';
    } else if (isSameDay(date, yesterday)) {
      return 'Yesterday';
    } else {
      return formatDateMedium(date);
    }
  };