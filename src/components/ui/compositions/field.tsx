import { HelpCircleIcon } from "lucide-react";
import type { ComponentProps } from "react";

import * as Builder from "../styled/field";
import { Input as BaseInput, NativeSelect as BaseSelect, Textarea as BaseTextarea } from "./input";
import { Tooltip } from "./tooltip";

export interface FieldProps extends Omit<ComponentProps<typeof Builder.Root>, "label"> {
	label?: React.ReactNode;
	helperText?: React.ReactNode;
	errorText?: React.ReactNode;
}
export function Field({ label, children, helperText, errorText, ...rest }: FieldProps) {
	return (
		<Builder.Root {...rest}>
			{label && (
				<Builder.Label data-required={rest.required}>
					{label}
					{helperText && (
						<Tooltip render={() => helperText}>
							<Builder.HelperText>
								<HelpCircleIcon size={16} />
							</Builder.HelperText>
						</Tooltip>
					)}
				</Builder.Label>
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
