import type { Assign } from "@ark-ui/react";
import { useTagsInputContext } from "@ark-ui/react/tags-input";
import { XIcon } from "lucide-react";
import { type ComponentProps, forwardRef } from "react";

import { For } from "$/components/ui/atoms";
import { useFieldData } from "$/components/ui/hooks/form.hooks";
import * as Builder from "$/components/ui/styled/tags-input";
import { css } from "$:styled-system/css";
import type { SystemStyleObject } from "$:styled-system/types";
import { Field, type FieldProps } from "./field";

export interface TagsInputProps extends Pick<SystemStyleObject, "colorPalette"> {
	label?: string;
	placeholder?: string;
}

function Items() {
	const api = useTagsInputContext();

	return (
		<For each={api.value}>
			{(value, index) => (
				<Builder.Item key={value} index={index} value={value}>
					<Builder.ItemPreview>
						<Builder.ItemText>{value}</Builder.ItemText>
						<Builder.ItemDeleteTrigger>
							<XIcon size={16} />
						</Builder.ItemDeleteTrigger>
					</Builder.ItemPreview>
					<Builder.ItemInput />
				</Builder.Item>
			)}
		</For>
	);
}

export const TagsInput = forwardRef<HTMLInputElement, Assign<ComponentProps<typeof Builder.Root>, TagsInputProps>>(function TagsInput({ children, label, placeholder = "Add...", colorPalette = "pink", ...rest }, ref) {
	return (
		<Builder.Root {...rest}>
			{label && <Builder.Label>{label}</Builder.Label>}
			<Builder.Control className={css({ colorPalette })}>
				<Items />
				<Builder.Input placeholder={placeholder} />
				<Builder.ClearTrigger>
					<XIcon size={16} />
				</Builder.ClearTrigger>
			</Builder.Control>
			<Builder.HiddenInput ref={ref} />
		</Builder.Root>
	);
});

export function TagsInputDataField({ label, helperText, ...rest }: Assign<ComponentProps<typeof TagsInput>, FieldProps>) {
	const [field, { id, required, invalid, errorText }] = useFieldData<string[]>(rest);

	return (
		<Field id={id} label={label} helperText={helperText} required={required} invalid={invalid} errorText={errorText}>
			<TagsInput {...rest} value={field.state.value} onValueChange={(details) => field.handleChange(details.value)} />
		</Field>
	);
}
