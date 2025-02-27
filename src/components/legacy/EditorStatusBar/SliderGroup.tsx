import type { LucideProps } from "lucide-react";
import type { CSSProperties, ComponentProps, ComponentType } from "react";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";

import MiniSlider from "../MiniSlider";
import Spacer from "../Spacer";
import StatusIcon from "./StatusIcon";

interface Props extends Omit<ComponentProps<typeof MiniSlider>, "width" | "onChange"> {
	width: CSSProperties["width"];
	onChange: (value: ComponentProps<typeof MiniSlider>["value"]) => void;
	minIcon: ComponentType<LucideProps>;
	maxIcon: ComponentType<LucideProps>;
}

const SliderGroup = ({ width, height, minIcon, maxIcon, min, max, step, value, onChange, disabled, ...delegated }: Props) => (
	<Wrapper>
		<StatusIcon disabled={disabled} icon={minIcon} onClick={() => onChange(min)} />
		<Spacer size={token.var("spacing.1")} />
		<MiniSlider width={width} height={height} min={min} max={max} step={step} value={value} onChange={(ev) => onChange(Number(ev.target.value))} disabled={disabled} {...delegated} />
		<Spacer size={token.var("spacing.1")} />
		<StatusIcon disabled={disabled} icon={maxIcon} onClick={() => onChange(max)} />
	</Wrapper>
);

const Wrapper = styled.div`
  display: flex;
`;

export default SliderGroup;
