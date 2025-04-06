import { XIcon } from "lucide-react";
import { type ComponentProps, Fragment } from "react";

import { css } from "$:styled-system/css";
import * as Builder from "../styled/tags-input";
import type { VirtualColorPalette } from "../types";

export interface TagsInputProps extends ComponentProps<typeof Builder.Root> {
	placeholder?: string;
	colorPalette?: VirtualColorPalette;
}
export function TagsInput({ id, placeholder = "Add...", colorPalette = "pink", children, ...rest }: TagsInputProps) {
	return (
		<Builder.Root {...rest}>
			{children && <Builder.Label>{children}</Builder.Label>}
			<Fragment>
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
			</Fragment>
		</Builder.Root>
	);
}
