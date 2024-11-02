// biome-ignore lint/complexity/noBannedTypes: acceptable (heh) use case
type Acceptable<As> = As & Readonly<Object>;
/** Creates a loose type (one that accepts a wider definition while providing autocomplete for known values). */
export type Accept<T, As> = T | Acceptable<As>;

/** Pick values from an iterable object with the inferred union type. Useful for creating lightweight enums using the `as const` declarative syntax. */
export type Member<T> = T extends Readonly<Array<unknown>> ? T[number] : T extends Readonly<Record<PropertyKey, unknown>> ? T[keyof T] : never;

export type Predicate<Item, Index, Object, Result> = (value: Item, index: Index, object: Object) => Result;
export type ArrayPredicate<T, R> = Predicate<T, number, T[], R>;
