import type { LucideProps } from "lucide-react";
import type { ComponentProps, ComponentType } from "react";

import { HStack } from "$:styled-system/jsx";
import { Switch } from "$/components/ui/compositions";
import StatusIcon from "./StatusIcon";

interface Props extends ComponentProps<typeof Switch> {
	onIcon: ComponentType<LucideProps>;
	offIcon: ComponentType<LucideProps>;
}

const ToggleGroup = ({ size, onIcon, offIcon, checked, onCheckedChange, ...rest }: Props) => {
	return (
		<HStack gap={1}>
			<StatusIcon size={14} opacity={checked ? 0.5 : 1} icon={offIcon} onClick={() => onCheckedChange?.({ checked: false })} />
			<Switch {...rest} size="sm" checked={checked} onCheckedChange={onCheckedChange} />
			<StatusIcon size={14} opacity={checked ? 1 : 0.5} icon={onIcon} onClick={() => onCheckedChange?.({ checked: true })} />
		</HStack>
	);
};

export default ToggleGroup;
