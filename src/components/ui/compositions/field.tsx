import { HelpCircleIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { toPolymorphic, useRender } from "$/components/ui/hooks/use-render";
import * as Builder from "$/components/ui/styled/field";
import { HStack } from "$:styled-system/jsx";
import { Input as BaseInput, NativeSelect as BaseSelect, Textarea as BaseTextarea } from "./input";
import { MDXRender } from "./mdx";
import { Tooltip } from "./tooltip";

export interface FieldProps extends Omit<ComponentProps<typeof Builder.Root>, "label"> {
	label?: React.ReactNode;
	cosmetic?: boolean;
	helperText?: React.ReactNode;
	errorText?: React.ReactNode;
}
export function Field({ label, cosmetic, children, helperText, errorText, ...rest }: FieldProps) {
	const Label = useRender(Builder.Label, toPolymorphic(cosmetic ? "span" : "label"));

	return (
		<Builder.Root {...rest}>
			{label && (
				<HStack gap={1}>
					<Label>{label}</Label>
					{helperText && (
						<Tooltip interactive render={() => (typeof helperText === "string" ? <MDXRender code={helperText} /> : helperText)}>
							<Builder.HelperText>
								<HelpCircleIcon size={16} />
							</Builder.HelperText>
						</Tooltip>
					)}
				</HStack>
			)}
			{children}
			<Builder.ErrorText>{errorText}</Builder.ErrorText>
		</Builder.Root>
	);
}

export function FieldInput({ ...rest }: ComponentProps<typeof BaseInput>) {
	return <BaseInput as={Builder.Input} {...rest} />;
}
export function FieldSelect({ ...rest }: ComponentProps<typeof BaseSelect>) {
	return <BaseSelect as={Builder.Select} {...rest} />;
}
export function FieldTextarea({ ...rest }: ComponentProps<typeof BaseTextarea>) {
	return <BaseTextarea as={Builder.Textarea} {...rest} />;
}
