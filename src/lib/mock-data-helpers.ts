
/**
 * Helper functions for generating mock data with specific date ranges
 */

import { ExtendedAttack } from "./mock-data";

/**
 * Generates a random date between start and end dates
 * @param start Start date
 * @param end End date
 * @returns Random date between start and end
 */
export const generateRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

/**
 * Filter attacks to only include those within the specified date range
 * @param attacks Array of attacks
 * @param startDate Start date
 * @param endDate End date
 * @returns Filtered array of attacks
 */
export const filterAttacksByDateRange = (
  attacks: ExtendedAttack[],
  startDate: Date = new Date(2024, 0, 1),
  endDate: Date = new Date()
): ExtendedAttack[] => {
  return attacks.filter(attack => {
    const attackDate = new Date(attack.datetime);
    return attackDate >= startDate && attackDate <= endDate;
  });
};

/**
 * Validates a date object and returns true if it's valid
 * @param date Date object to validate
 * @returns boolean indicating if date is valid
 */
export const isValidDate = (date: Date): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Format a date as YYYY-MM-DD
 * @param date Date to format
 * @returns Formatted date string
 */
export const formatDateYYYYMMDD = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
