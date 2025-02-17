import type { PropsWithChildren } from "react";
import styled from "styled-components";

import UnfocusedButton from "../UnfocusedButton";

interface Props extends PropsWithChildren {
	value: string | null;
	isToggled: boolean;
	onToggle: (value: string | null) => void;
}

const ControlItemToggleButton = ({ value, isToggled, onToggle, children }: Props) => {
	return (
		<Wrapper style={{ borderColor: isToggled ? "rgba(255, 255, 255, 0.65)" : "rgba(255, 255, 255, 0.2)", opacity: isToggled ? 1 : 0.65 }} onClick={() => onToggle(value)}>
			{children}
		</Wrapper>
	);
};

const Wrapper = styled(UnfocusedButton)`
  padding: 4px;
  border: 1px solid;
  border-radius: 3px;
`;

export default ControlItemToggleButton;
