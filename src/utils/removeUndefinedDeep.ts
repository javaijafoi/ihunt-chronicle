import { Timestamp } from 'firebase/firestore';

export const removeUndefinedDeep = <T>(value: T): T => {
  if (value === undefined || value === null) return value;

  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => removeUndefinedDeep(item)) as T;
  }

  if (value instanceof Timestamp || value instanceof Date) {
    return value;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, removeUndefinedDeep(v)]);

    return Object.fromEntries(entries) as T;
  }

  return value;
};

export const sanitizeOptionalString = (value?: string | null): string | undefined => {
  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};
