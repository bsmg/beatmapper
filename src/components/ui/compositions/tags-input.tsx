import { XIcon } from "lucide-react";
import type { ComponentProps } from "react";

import * as Builder from "$/components/ui/styled/tags-input";
import type { VirtualColorPalette } from "$/styles/types";
import { css } from "$:styled-system/css";

export interface TagsInputProps extends ComponentProps<typeof Builder.Root> {
	placeholder?: string;
	colorPalette?: VirtualColorPalette;
}
export function TagsInput({ id, placeholder = "Add...", colorPalette = "pink", children, ...rest }: TagsInputProps) {
	return (
		<Builder.Root {...rest}>
			{children && <Builder.Label>{children}</Builder.Label>}
			<Builder.Control className={css({ colorPalette: colorPalette })}>
				<Builder.Context>
					{(api) => {
						return api.value.map((value, index) => (
							<Builder.Item key={value} index={index} value={value}>
								<Builder.ItemPreview>
									<Builder.ItemText>{value}</Builder.ItemText>
									<Builder.ItemDeleteTrigger asChild>
										<XIcon />
									</Builder.ItemDeleteTrigger>
								</Builder.ItemPreview>
								<Builder.ItemInput />
								<Builder.HiddenInput />
							</Builder.Item>
						));
					}}
				</Builder.Context>
				<Builder.Input placeholder={placeholder} />
				<Builder.ClearTrigger>
					<XIcon size={16} />
				</Builder.ClearTrigger>
			</Builder.Control>
		</Builder.Root>
	);
}
