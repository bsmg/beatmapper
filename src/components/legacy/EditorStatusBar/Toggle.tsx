import type { IconProp } from "react-icons-kit";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";

import Spacer from "../Spacer";
import UnfocusedButton from "../UnfocusedButton";
import StatusIcon from "./StatusIcon";

interface Props {
	size: number;
	onIcon: IconProp["icon"];
	offIcon: IconProp["icon"];
	value: boolean;
	onChange: (value: boolean) => void;
}

const Toggle = ({ size, onIcon, offIcon, value, onChange }: Props) => {
	const padding = 2;
	const borderWidth = 1;

	const side = value === true ? "right" : "left";

	return (
		<Wrapper>
			<StatusIcon size={14} opacity={value ? 0.5 : 1} icon={offIcon} onClick={() => onChange(false)} />
			<Spacer size={token.var("spacing.1")} />
			<ToggleWrapper style={{ width: size * 2 + padding * 2 + borderWidth * 2, height: size + padding * 2 + borderWidth * 2, padding, borderWidth }} onClick={() => onChange(!value)}>
				<Ball style={{ [side]: padding, width: size, height: size }} />
			</ToggleWrapper>
			<Spacer size={token.var("spacing.1")} />
			<StatusIcon size={14} opacity={value ? 1 : 0.5} icon={onIcon} onClick={() => onChange(true)} />
		</Wrapper>
	);
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

const ToggleWrapper = styled(UnfocusedButton)`
  position: relative;
  border-color: ${token.var("colors.slate.500")};
  border-style: solid;
  border-radius: 500px;
  cursor: pointer;
`;

const Ball = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto;
  border-radius: 50%;
  background: ${token.var("colors.slate.100")};
`;

export default Toggle;
