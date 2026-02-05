import { HelpCircleIcon } from "lucide-react";
import type { MDXComponents } from "mdx/types";
import { type ComponentProps, forwardRef } from "react";

import { MDXRemote } from "$/components/ui/atoms/mdx";
import { toPolymorphic, useRender } from "$/components/ui/hooks/use-render";
import * as Builder from "$/components/ui/styled/field";
import { css, cx } from "$:styled-system/css";
import { HStack } from "$:styled-system/jsx";
import { Input as BaseInput, NativeSelect as BaseSelect, Textarea as BaseTextarea } from "./input";
import { AnchorLink } from "./link";
import { Tooltip } from "./tooltip";

const FIELD_MDX_COMPONENTS: MDXComponents = {
	a: forwardRef(({ className, ...rest }, ref) => <AnchorLink ref={ref} target="_blank" {...rest} className={cx(css({ color: "yellow.500" }), className)} />),
};

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
						<Tooltip interactive render={() => (typeof helperText === "string" ? <MDXRemote components={FIELD_MDX_COMPONENTS}>{helperText}</MDXRemote> : helperText)}>
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
