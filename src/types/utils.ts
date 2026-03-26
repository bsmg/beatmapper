type Acceptable<As> = As & NonNullable<As>;
/** Creates a loose type (one that accepts a wider definition while providing autocomplete for known values). */
export type Accept<T, As> = T | Acceptable<As>;

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

/** Pick values from an iterable object with the inferred union type. Useful for creating lightweight enums using the `as const` declarative syntax. */
export type Member<T> = T extends Readonly<Array<unknown>> ? T[number] : T extends Readonly<Record<PropertyKey, unknown>> ? T[keyof T] : never;

export type RequiredKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
