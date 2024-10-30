import type { ComponentProps } from "react";
import { Link, type To } from "react-router-dom";
import styled from "styled-components";

import { COLORS, UNIT } from "$/constants";

import PixelShifter from "../PixelShifter";
import UnfocusedButton from "../UnfocusedButton";

interface Props extends ComponentProps<typeof UnfocusedButton> {
	hoverColor?: string;
	as?: string;
	width?: number;
	to?: To;
}

const MiniButton = ({ ref, children, color, hoverColor, as, width, style = {}, to, ...delegated }: Props) => {
	if (to) {
		return (
			<ButtonElem as={Link} to={to} color={color} hoverColor={hoverColor} style={{ ...style, width }}>
				{typeof children === "string" ? <PixelShifter y={-1}>{children}</PixelShifter> : children}
			</ButtonElem>
		);
	}
	return (
		<ButtonElem {...delegated} color={color} hoverColor={hoverColor} style={{ ...style, width }}>
			{typeof children === "string" ? <PixelShifter y={-1}>{children}</PixelShifter> : children}
		</ButtonElem>
	);
};

const ButtonElem = styled(UnfocusedButton)<Props>`
  position: relative;
  padding: ${UNIT / 2}px ${UNIT * 1.5}px;
  border-radius: ${UNIT}px;
  font-size: 14px;
  background: ${(props) => props.color || "hsla(0, 0%, 100%, 9%)"};
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${COLORS.white};
  text-decoration: none;

  &:hover:not(:disabled) {
    background: ${(props) => props.hoverColor || "hsla(0, 0%, 100%, 14%) !important"};
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

export default MiniButton;
