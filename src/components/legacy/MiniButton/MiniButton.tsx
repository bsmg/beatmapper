import type { Merge } from "@react-spring/three";
import type { LinkProps } from "@tanstack/react-router";
import type { CSSProperties, ComponentProps } from "react";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";
import type { router } from "$/index";

import BaseLink from "../BaseLink";
import PixelShifter from "../PixelShifter";
import UnfocusedButton from "../UnfocusedButton";

interface Props extends Merge<ComponentProps<typeof UnfocusedButton>, LinkProps<"button", typeof router>> {
	hoverColor?: string;
	as?: string;
	width?: CSSProperties["width"];
}

const MiniButton = ({ ref, children, color, hoverColor, as, width, style = {}, to, params, ...delegated }: Props) => {
	if (to) {
		return (
			// biome-ignore lint/suspicious/noExplicitAny: uh oh!
			<ButtonElem as={BaseLink as any} to={to} params={params} color={color} hoverColor={hoverColor} style={{ ...style, width }}>
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
  padding: ${token.var("spacing.0.5")} ${token.var("spacing.1.5")};
  border-radius: ${token.var("spacing.1")};
  font-size: 14px;
  background: ${(props) => props.color || "hsla(0, 0%, 100%, 9%)"};
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
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
