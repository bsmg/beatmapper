import type { Assign } from "@ark-ui/react";
import { LoaderIcon, type LucideProps } from "lucide-react";
import type { ComponentProps, ComponentType } from "react";

import { Spinner as Styled } from "$/components/ui/styled/spinner";

export interface SpinnerProps {
	icon?: ComponentType<LucideProps>;
	size?: number;
}

export function Spinner({ icon: Icon = LoaderIcon, size, ...rest }: Assign<ComponentProps<typeof Styled>, SpinnerProps>) {
	return (
		<Styled {...rest}>
			<Icon size={size} />
		</Styled>
	);
}
