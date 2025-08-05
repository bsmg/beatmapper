import { CheckIcon, CopyIcon } from "lucide-react";
import type { ComponentProps } from "react";

import * as Builder from "$/components/ui/styled/clipboard";

export interface ClipboardProps extends ComponentProps<typeof Builder.Root> {}
export function Clipboard({ children, ...rest }: ClipboardProps) {
	return (
		<Builder.Root {...rest}>
			{children}
			<Builder.Trigger>
				<Builder.Indicator copied={<CheckIcon size={16} />}>
					<CopyIcon size={16} />
				</Builder.Indicator>
			</Builder.Trigger>
		</Builder.Root>
	);
}
