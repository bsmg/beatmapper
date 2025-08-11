import { type LucideProps, MinusIcon, XIcon } from "lucide-react";
import { type ComponentProps, type ComponentType, forwardRef, type KeyboardEvent, type MouseEvent, useCallback } from "react";

import * as Builder from "$/components/ui/styled/checkbox";

export interface CheckboxProps extends ComponentProps<typeof Builder.Root> {
	icon?: ComponentType<LucideProps>;
	unfocusOnClick?: boolean;
}
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ icon: Icon = XIcon, children, unfocusOnClick, ...rest }, ref) => {
	const handleUnfocus = useCallback(
		(event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
			if (unfocusOnClick) event.currentTarget.blur();
		},
		[unfocusOnClick],
	);

	return (
		<Builder.Root {...rest}>
			<Builder.Control onClickCapture={handleUnfocus} onKeyDownCapture={handleUnfocus}>
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
