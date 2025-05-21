import { ark } from "@ark-ui/react/factory";
import type { SwitchCheckedChangeDetails } from "@ark-ui/react/switch";
import { type PropsWithChildren, type ReactNode, useCallback, useState } from "react";

import { HStack, styled } from "$:styled-system/jsx";
import { Collapsible, Heading, Switch, Tooltip } from "$/components/ui/compositions";
import { HelpCircleIcon } from "lucide-react";

interface Props extends PropsWithChildren {
	label: string;
	render: () => ReactNode;
	checked?: boolean;
	onCheckedChange?: (open: boolean) => void;
}
function SongDetailsModule({ label, render, checked: initialOpen, onCheckedChange: onOpenChange, children }: Props) {
	const [open, setOpen] = useState(initialOpen ?? false);

	const handleOpenChange = useCallback(
		(details: SwitchCheckedChangeDetails) => {
			setOpen(details.checked);
			if (onOpenChange) onOpenChange(details.checked);
		},
		[onOpenChange],
	);

	return (
		<Collapsible open={open} lazyMount unmountOnExit render={render}>
			<Heading rank={3}>
				<HStack gap={2}>
					<Switch checked={open} onCheckedChange={handleOpenChange} />
					<HStack gap={1}>
						{label}
						{children && (
							<Tooltip interactive render={() => children}>
								<IconWrapper asChild>
									<HelpCircleIcon size={16} />
								</IconWrapper>
							</Tooltip>
						)}
					</HStack>
				</HStack>
			</Heading>
		</Collapsible>
	);
}

const IconWrapper = styled(ark.span, {
	base: {
		color: "fg.muted",
		cursor: "help",
	},
});

export default SongDetailsModule;
