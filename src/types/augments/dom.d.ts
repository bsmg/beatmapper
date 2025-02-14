declare interface ObjectConstructor {
	keys<T extends Iterable<unknown>>(o: T): [...(keyof T)[]];
	values<T extends Iterable<unknown>>(o: T): [...T[keyof T][]];
	entries<T extends Iterable<unknown>>(o: T): [keyof T, T[keyof T]][];
}
