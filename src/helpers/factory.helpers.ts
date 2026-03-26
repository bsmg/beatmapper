import type { StandardSchemaV1 } from "@standard-schema/spec";

// beatmap serialization is a bit more complex since we have to manage four separate versions of the map format with different sets of supported fields and features.
// to consolidate things a bit, we're providing factory functions that can unify serial type definitions under custom wrapper(s).
// this makes it easier to consolidate serial type conversions using a consistent function call with preserved type-safety and inference.

type Serials<T = unknown> = { [key: PropertyKey]: T };
type Context<T> = (T extends infer R ? R : never) extends never ? { [key: string]: never } : T;

interface DataSerializer<TWrapper, TSerial, TSerializeContext, TDeserializeContext> {
	serialize: (data: TWrapper, context: Context<TSerializeContext>) => TSerial;
	deserialize: (data: TSerial, context: Context<TDeserializeContext>) => TWrapper;
}
interface DataValidator<TSerial, TValidateContext> {
	constructor: (context: Context<TValidateContext>) => StandardSchemaV1<TSerial>;
}

interface IBaseFactoryBuilder {
	name?: string;
}

interface IDataFactoryBuilder<TWrapper, TSerial, TSerializeOptions = never, TDeserializeOptions = never, TValidateOptions = never> extends IBaseFactoryBuilder {
	container: DataSerializer<TWrapper, TSerial, TSerializeOptions, TDeserializeOptions>;
	validator?: DataValidator<TSerial, TValidateOptions>;
}
interface IDataFactory<TWrapper, TSerial, TSerializeContext, TDeserializeContext, TValidateContext> {
	serialize: (data: TWrapper, context: Context<TSerializeContext>) => TSerial;
	deserialize: (data: TSerial, context: Context<TDeserializeContext>) => TWrapper;
	validate: (data: unknown, context: Context<TValidateContext>) => void;
}
export function createDataFactory<const TWrapper, const TSerial, const TSerializeContext = never, const TDeserializeContext = never, const TValidateContext = never>(
	builder: IDataFactoryBuilder<TWrapper, TSerial, TSerializeContext, TDeserializeContext, TValidateContext>,
): IDataFactory<TWrapper, TSerial, TSerializeContext, TDeserializeContext, TValidateContext> {
	const { name, container, validator } = builder;

	return {
		serialize: (data, context) => {
			if (!container) {
				throw new Error(`Missing serializer for data`, { cause: `${name}` });
			}
			return container.serialize(data, context);
		},
		deserialize: (data, context) => {
			if (!container) {
				throw new Error(`Missing deserializer for data`, { cause: `${name}` });
			}
			return container.deserialize(data, context);
		},
		validate: (data, context) => {
			if (!validator) {
				throw new Error(`Missing validator for data`, { cause: `${name}` });
			}
			const schema = validator.constructor(context);
			return schema["~standard"].validate(data);
		},
	};
}

interface IEntityFactoryBuilder<TWrapper, TSerials extends Serials, TSerializeOptions = never, TDeserializeOptions = never, TValidateOptions = never> extends IBaseFactoryBuilder {
	resolveKey: <const TVersion extends keyof TSerials>(data: TSerials[TVersion]) => keyof TSerials;
	container: {
		[TVersion in keyof TSerials]: DataSerializer<TWrapper, TSerials[TVersion], TSerializeOptions, TDeserializeOptions>;
	};
	validator?: NoInfer<{ [TVersion in keyof TSerials]?: DataValidator<TSerials[TVersion], TValidateOptions> }>;
}
interface IEntityFactory<TWrapper, TSerials extends Serials, TSerializeContext, TDeserializeContext, TValidateContext> {
	serialize: <const TVersion extends keyof TSerials>(data: TWrapper, version: TVersion, context: Context<TSerializeContext>) => TSerials[TVersion];
	deserialize: <const TVersion extends keyof TSerials>(data: TSerials[TVersion], version: TVersion | null, context: Context<TDeserializeContext>) => TWrapper;
	validate: <const TVersion extends keyof TSerials>(data: TSerials[TVersion], version: TVersion, context: Context<TValidateContext>) => void;
}
export function createEntityFactory<const TWrapper, const TSerials extends Serials, const TSerializeContext = never, const TDeserializeContext = never, const TValidateContext = never>(
	builder: IEntityFactoryBuilder<TWrapper, TSerials, TSerializeContext, TDeserializeContext, TValidateContext>,
): IEntityFactory<TWrapper, TSerials, TSerializeContext, TDeserializeContext, TValidateContext> {
	const { name, resolveKey, container, validator } = builder;

	return {
		serialize: (data, version, context) => {
			if (!container[version]) {
				throw new Error(`Missing serializer for entity`, { cause: `${name}/${version.toString()}` });
			}
			return container[version].serialize(data, context);
		},
		deserialize: (data, key, context) => {
			const version = key ?? resolveKey(data);
			if (!container[version]) {
				throw new Error(`Missing deserializer for entity`, { cause: `${name}/${version.toString()}` });
			}
			return container[version].deserialize(data, context);
		},
		validate: (data, version, context) => {
			if (!validator || !validator[version]) {
				throw new Error(`Missing validator for data`, { cause: `${name}` });
			}
			const schema = validator[version].constructor(context) as StandardSchemaV1<TSerials[typeof version]>;
			return schema["~standard"].validate(data);
		},
	};
}
