import { camelizeKeys, decamelizeKeys } from 'humps';

/**
 * Converts object keys from snake_case to camelCase
 * Used when sending data from server to client
 */
export function toCamelCase<T>(obj: Record<string, unknown>): T {
  return camelizeKeys(obj) as T;
}

/**
 * Converts object keys from camelCase to snake_case
 * Used when sending data from client to server
 */
export function toSnakeCase<T>(obj: Record<string, unknown>): T {
  return decamelizeKeys(obj) as T;
}

/**
 * Converts array of objects from snake_case to camelCase
 */
export function arrayToCamelCase<T>(arr: Record<string, unknown>[]): T[] {
  return arr.map((item) => toCamelCase<T>(item));
}

/**
 * Converts array of objects from camelCase to snake_case
 */
export function arrayToSnakeCase<T>(arr: Record<string, unknown>[]): T[] {
  return arr.map((item) => toSnakeCase<T>(item));
}
