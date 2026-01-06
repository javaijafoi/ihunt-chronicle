const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

export const sanitizeFirestoreData = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((item) =>
      sanitizeFirestoreData(item === undefined ? null : item)
    ) as T;
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        key,
        sanitizeFirestoreData(val === undefined ? null : val),
      ])
    ) as T;
  }

  return (value === undefined ? null : value) as T;
};
