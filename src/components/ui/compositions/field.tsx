import type { Assign } from "@ark-ui/react";
import type { UseFieldProps } from "@ark-ui/react/field";
import { HelpCircleIcon } from "lucide-react";
import type { MDXComponents } from "mdx/types";
import { type ComponentProps, forwardRef } from "react";

import { MDXRemote } from "$/components/ui/atoms/mdx";
import { toPolymorphic, useRender } from "$/components/ui/hooks/use-render";
import * as Builder from "$/components/ui/styled/field";
import { css, cx } from "$:styled-system/css";
import { HStack } from "$:styled-system/jsx";
import { AnchorLink } from "./link";
import { Tooltip } from "./tooltip";

const FIELD_MDX_COMPONENTS: MDXComponents = {
	a: forwardRef(({ className, ...rest }, ref) => <AnchorLink ref={ref} target="_blank" {...rest} className={cx(css({ color: "yellow.500" }), className)} />),
};

export interface FieldProps extends UseFieldProps {
	label?: string;
	cosmetic?: boolean;
	helperText?: string;
	errorText?: string;
}

export function Field({ children, label, cosmetic, helperText, errorText, ...rest }: Assign<ComponentProps<typeof Builder.Root>, FieldProps>) {
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
