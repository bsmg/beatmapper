import { type LucideProps, MinusIcon, XIcon } from "lucide-react";
import { type ComponentProps, type ComponentType, forwardRef } from "react";

import * as Builder from "../styled/checkbox";

export interface CheckboxProps extends ComponentProps<typeof Builder.Root> {
	icon?: ComponentType<LucideProps>;
}
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ icon: Icon = XIcon, children, ...rest }, ref) => {
	return (
		<Builder.Root {...rest}>
			<Builder.Control>
				<Builder.Indicator>
					<Icon size={16} />
				</Builder.Indicator>
				<Builder.Indicator indeterminate>
					<MinusIcon size={16} />
				</Builder.Indicator>
			</Builder.Control>
			{children && <Builder.Label>{children}</Builder.Label>}
			<Builder.HiddenInput ref={ref} />
		</Builder.Root>
	);
});
