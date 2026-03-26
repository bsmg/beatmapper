import type { Assign } from "@ark-ui/react";
import type { ListCollection } from "@ark-ui/react/collection";
import { Portal } from "@ark-ui/react/portal";
import { useSelectContext } from "@ark-ui/react/select";
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";
import { type ComponentProps, forwardRef, type RefObject } from "react";

import { ForListCollection } from "$/components/ui/atoms";
import { type UseInteractableOptions, useInteractable } from "$/components/ui/hooks/use-interactable";
import * as Builder from "$/components/ui/styled/select";

export interface SelectProps extends UseInteractableOptions {
	label?: string;
	placeholder?: string;
	clearable?: boolean;
	portalled?: boolean;
	portalRef?: RefObject<HTMLElement>;
}

function Overlay({ collection, portalled = true, portalRef }: SelectProps & { collection: ListCollection }) {
	return (
		<Portal disabled={!portalled} container={portalRef}>
			<Builder.Positioner>
				<Builder.Content>
					<ForListCollection collection={collection}>
						{(_, { value, label }) => (
							<Builder.Item key={value} item={value}>
								<Builder.ItemText>{label}</Builder.ItemText>
								<Builder.ItemIndicator>
									<CheckIcon size={16} />
								</Builder.ItemIndicator>
							</Builder.Item>
						)}
					</ForListCollection>
				</Builder.Content>
			</Builder.Positioner>
		</Portal>
	);
}

function Trigger({ placeholder }: SelectProps) {
	return (
		<Builder.Trigger>
			<Builder.ValueText placeholder={placeholder} />
			<Builder.Indicator>
				<ChevronsUpDownIcon size={16} />
			</Builder.Indicator>
		</Builder.Trigger>
	);
}
function ClearTrigger({ clearable }: SelectProps) {
	const api = useSelectContext();

	if (!api.value || !clearable) {
		return null;
	}

	return (
		<Builder.ClearTrigger>
			<XIcon size={16} />
		</Builder.ClearTrigger>
	);
}

export const Select = forwardRef<HTMLSelectElement, Assign<ComponentProps<typeof Builder.Root>, SelectProps & { collection: ListCollection }>>(function Select({ children, collection, label, placeholder, clearable, portalled, portalRef, unfocusOnPress, ...rest }, ref) {
	const { handlePress } = useInteractable({ unfocusOnPress });

	return (
		<Builder.Root collection={collection} {...rest} onKeyDown={(e) => e.stopPropagation()}>
			{label && <Builder.Label>{label}</Builder.Label>}
			<Builder.Control onClickCapture={handlePress} onKeyDownCapture={handlePress}>
				<Trigger placeholder={placeholder} />
				<ClearTrigger clearable={clearable} />
			</Builder.Control>
			<Overlay collection={collection} portalled={portalled} portalRef={portalRef} />
			<Builder.HiddenSelect ref={ref} />
		</Builder.Root>
	);
});
