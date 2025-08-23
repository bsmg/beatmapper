import { HelpCircleIcon } from "lucide-react";
import type { ComponentProps } from "react";

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
	return (
		<Builder.Root {...rest}>
			{label && (
				<HStack gap={1}>
					<Builder.Label asChild={cosmetic} data-required={rest.required}>
						<span>{label}</span>
					</Builder.Label>
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
	return (
		<Builder.Input asChild>
			<BaseInput {...rest} />
		</Builder.Input>
	);
}
export function FieldSelect({ ...rest }: ComponentProps<typeof BaseSelect>) {
	return (
		<Builder.Select asChild>
			<BaseSelect {...rest} />
		</Builder.Select>
	);
}
export function FieldTextarea({ ...rest }: ComponentProps<typeof BaseTextarea>) {
	return (
		<Builder.Textarea asChild>
			<BaseTextarea {...rest} />
		</Builder.Textarea>
	);
}
