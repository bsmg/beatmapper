import { LoaderIcon, type LucideProps } from "lucide-react";
import type { ComponentProps, ComponentType } from "react";

import { Spinner as Styled } from "$/components/ui/styled/spinner";

export interface SpinnerProps extends ComponentProps<typeof Styled> {
	icon?: ComponentType<LucideProps>;
	size?: number;
}
export function Spinner({ icon: Icon = LoaderIcon, size, ...rest }: SpinnerProps) {
	return (
		<Styled {...rest}>
			<Icon size={size} />
		</Styled>
	);
}
