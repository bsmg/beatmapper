import type { LucideProps } from "lucide-react";
import type { ComponentProps, ComponentType } from "react";

import { HStack } from "$:styled-system/jsx";
import { Switch, Tooltip } from "$/components/ui/compositions";
import StatusBarIcon from "./icon";

interface Props extends ComponentProps<typeof Switch> {
	label?: string;
	onIcon: ComponentType<LucideProps>;
	offIcon: ComponentType<LucideProps>;
}
function StatusBarToggleControl({ label, onIcon, offIcon, checked, onCheckedChange, disabled, ...rest }: Props) {
	return (
		<Tooltip render={() => label}>
			<HStack gap={1}>
				<StatusBarIcon size={14} opacity={checked ? 0.5 : 1} icon={offIcon} onClick={() => onCheckedChange?.({ checked: false })} disabled={disabled} />
				<Switch {...rest} size="sm" checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
				<StatusBarIcon size={14} opacity={checked ? 1 : 0.5} icon={onIcon} onClick={() => onCheckedChange?.({ checked: true })} disabled={disabled} />
			</HStack>
		</Tooltip>
	);
}

export default StatusBarToggleControl;
