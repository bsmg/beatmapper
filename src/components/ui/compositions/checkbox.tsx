import { type LucideProps, MinusIcon, XIcon } from "lucide-react";
import { type ComponentProps, type ComponentType, forwardRef } from "react";

import { type UseInteractableOptions, useInteractable } from "$/components/ui/hooks/use-interactable";
import * as Builder from "$/components/ui/styled/checkbox";

export interface CheckboxProps extends ComponentProps<typeof Builder.Root>, UseInteractableOptions {
	icon?: ComponentType<LucideProps>;
}
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ icon: Icon = XIcon, children, unfocusOnPress, ...rest }, ref) => {
	const { handlePress } = useInteractable({ unfocusOnPress });

	return (
		<Builder.Root {...rest}>
			<Builder.Control onClickCapture={handlePress} onKeyDownCapture={handlePress}>
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
