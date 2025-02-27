import type { LucideProps } from "lucide-react";
import type { ComponentProps, ComponentType } from "react";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";

import UnfocusedButton from "../UnfocusedButton";

interface Props extends ComponentProps<typeof UnfocusedButton> {
	icon?: ComponentType<LucideProps>;
	isToggled?: boolean;
	size?: number;
	rotation?: number;
}

const IconButton = ({ ref, icon: Icon, style = {}, isToggled, children, color, size = 36, rotation = 0, ...delegated }: Props) => {
	const iconSize = size / 2;

	return (
		<ButtonElem {...delegated} style={{ ...style, width: size, height: size, color: color || (isToggled ? "white" : token.var("colors.gray.300")), backgroundColor: isToggled ? "hsla(0, 0%, 100%, 10%)" : "transparent" }}>
			{(Icon && <Icon size={iconSize} style={{ transform: `rotate(${rotation}deg)` }} />) ?? children}
		</ButtonElem>
	);
};

const ButtonElem = styled(UnfocusedButton)`
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: ${token.var("spacing.1")};

  &:hover:not(:disabled) {
    background: hsla(0, 0%, 100%, 10%) !important;
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

export default IconButton;
