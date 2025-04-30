import type { StandardSchemaV1 } from "@standard-schema/spec";
import { schemaCheck } from "bsmap";

import type { AnyObject, Merge } from "$/types";

export type ImplicitVersion = 1 | 2 | 3 | 4;

// beatmap serialization is a bit more complex since we have to manage four separate versions of the map format with different sets of supported fields and features.
// to consolidate things a bit, we're providing factory functions that can unify serial type definitions under custom wrapper(s).
// this makes it easier to consolidate serial type conversions using a consistent function call with preserved type-safety and inference.

type Serials = [...(object | undefined)[]];
type InferSerial<TSerials extends Serials, TVersion extends ImplicitVersion> = TVersion extends 0 ? never : [_: never, ...TSerials][TVersion] extends undefined ? never : [_: never, ...TSerials][TVersion];

type SerializationOptions = [shared: object, ...object[]];

interface SerializationFactoryConfiguration<TVersion extends ImplicitVersion, TWrapper extends AnyObject | undefined, TSerials extends Serials, TSerializationOptions extends SerializationOptions, TDeserializationOptions extends SerializationOptions> {
	/** The container used for serialization between the wrapper and serial data. */
	container: {
		serialize: (data: TWrapper, options: Merge<TSerializationOptions[0], TSerializationOptions[TVersion]>) => InferSerial<TSerials, TVersion>;
		deserialize: (data: InferSerial<TSerials, TVersion>, options: Merge<TDeserializationOptions[0], TDeserializationOptions[TVersion]>) => TWrapper;
	};
	/** The schema used for serial validation. */
	schema?: StandardSchemaV1;
}
type SerializationFactoryOptions<TWrapper extends AnyObject | undefined, TSerials extends Serials, TSerialziationOptions extends SerializationOptions, TDeserializationOptions extends SerializationOptions> = {
	[TVersion in ImplicitVersion]?: SerializationFactoryConfiguration<TVersion, TWrapper, TSerials, TSerialziationOptions, TDeserializationOptions>;
};

export function createSerializationFactory<TWrapper extends AnyObject | undefined, TSerials extends Serials, TSerializationOptions extends SerializationOptions, TDeserializationOptions extends SerializationOptions>(
	name: string,
	builder: () => SerializationFactoryOptions<TWrapper, TSerials, TSerializationOptions, TDeserializationOptions>,
) {
	const entries = builder();

	function serialize<TVersion extends ImplicitVersion>(version: TVersion, data: TWrapper, options: Merge<TSerializationOptions[0], TSerializationOptions[TVersion]>): InferSerial<TSerials, TVersion> {
		if (!entries[version]) throw new Error(`No configuration found for version ${version}`);
		const { container } = entries[version];
		return container.serialize(data, options);
	}
	function deserialize<TVersion extends ImplicitVersion>(version: TVersion, data: InferSerial<TSerials, TVersion>, options: Merge<TDeserializationOptions[0], TDeserializationOptions[TVersion]>) {
		if (!entries[version]) throw new Error(`No configuration found for version ${version}`);
		const { schema, container } = entries[version];
		const label = `${name}/v${version}`;
		if (data && schema) schemaCheck(data, schema, label);
		return container.deserialize(data, options);
	}

	return { serialize, deserialize };
}

interface PropertySerializationFactoryOptions<TWrapper, TSerial, TSerializationOptions extends AnyObject, TDeserializationOptions extends AnyObject> {
	validate?: (data: TSerial, options: TDeserializationOptions) => void;
	container: {
		serialize: (data: TWrapper, options: TSerializationOptions) => TSerial;
		deserialize: (data: TSerial, options: TDeserializationOptions) => TWrapper;
	};
}
export function createPropertySerializationFactory<TWrapper, TSerial, TSerializationOptions extends AnyObject = AnyObject, TDeserializationOptions extends AnyObject = AnyObject>(builder: () => PropertySerializationFactoryOptions<TWrapper, TSerial, TSerializationOptions, TDeserializationOptions>) {
	const { validate, container } = builder();

	function serialize(data: TWrapper, options: TSerializationOptions) {
		return container.serialize(data, options);
	}
	function deserialize(data: TSerial, options: TDeserializationOptions) {
		if (validate) {
			try {
				validate(data, options);
			} catch (e) {
				throw new Error(e as string);
			}
		}
		return container.deserialize(data, options);
	}

	return { serialize, deserialize };
}
