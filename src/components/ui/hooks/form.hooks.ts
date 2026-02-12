import { createFormHookContexts, useStore } from "@tanstack/react-form";

import type { FieldProps } from "$/components/ui/compositions/field";

export const { useFieldContext, useFormContext, fieldContext, formContext } = createFormHookContexts();

export function useFieldData<TData>({ ...rest }: FieldProps): [ReturnType<typeof useFieldContext<TData>>, FieldProps] {
	const field = useFieldContext<TData>();

	const invalid = useStore(field.store, (state) => !state.meta.isValid);
	const errorText = useStore(field.store, (state) => state.meta.errors[0]?.message);

	return [field, { ...rest, id: rest.id ?? field.name, invalid, errorText }];
}
