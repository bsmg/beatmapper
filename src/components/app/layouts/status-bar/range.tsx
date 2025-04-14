import type { LucideProps } from "lucide-react";
import type { ComponentProps, ComponentType } from "react";

import { HStack } from "$:styled-system/jsx";
import { Slider } from "$/components/ui/compositions";
import StatusIcon from "./icon";

interface Props extends ComponentProps<typeof Slider> {
	minIcon: ComponentType<LucideProps>;
	maxIcon: ComponentType<LucideProps>;
}

const SliderGroup = ({ minIcon, maxIcon, min, max, step, value, onValueChange, disabled, ...delegated }: Props) => (
	<HStack gap={1}>
		<StatusIcon size={14} icon={minIcon} onClick={() => onValueChange?.({ value: [min ?? 0] })} disabled={disabled} />
		<Slider {...delegated} size="sm" min={min} max={max} step={step} value={value} onValueChange={onValueChange} disabled={disabled} />
		<StatusIcon size={14} icon={maxIcon} onClick={() => onValueChange?.({ value: [max ?? 100] })} disabled={disabled} />
	</HStack>
);

export default SliderGroup;
