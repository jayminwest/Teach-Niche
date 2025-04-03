// Utility Types for the application

/**
 * Makes some properties in T optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Makes some properties in T required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Makes all properties in T nullable
 */
export type Nullable<T> = { [P in keyof T]: T[P] | null };

/**
 * Non-nullable version of a type
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * Pick properties from a nested object type
 */
export type NestedPick<T, K extends string> = K extends `${infer A}.${infer B}`
  ? A extends keyof T
    ? { [P in A]: NestedPick<T[A], B> }
    : never
  : K extends keyof T
  ? { [P in K]: T[P] }
  : never;

/**
 * Recursively makes all properties in an object optional
 */
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

/**
 * Represents a promise result with data and error
 */
export interface AsyncResult<T, E = Error> {
  data: T | null;
  error: E | null;
  loading: boolean;
}

/**
 * Type for pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Type for pagination results
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Type for sorting parameters
 */
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * Type for filter parameters
 */
export interface FilterParams {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in';
  value: string | number | boolean | null | Array<string | number | boolean>;
}
