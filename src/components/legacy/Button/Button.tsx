import type { ComponentProps } from "react";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";

import UnstyledButton from "../UnstyledButton";

interface Props extends ComponentProps<typeof UnstyledButton> {}

const Button = ({ ref, children, disabled, color, ...delegated }: Props) => {
	return (
		<ButtonElem disabled={disabled} color={color} {...delegated}>
			<ChildWrapper>{children}</ChildWrapper>
		</ButtonElem>
	);
};

const ButtonElem = styled(UnstyledButton)`
  position: relative;
  padding: ${token.var("spacing.1")} ${token.var("spacing.6")};
  border-radius: 100px; /* More than enough for rounded corners */
  background: ${(props) => props.color ?? token.var("colors.pink.700")};
  border: none;
  font-size: 16px;
  text-align: center;

  &:disabled {
    background: ${token.var("colors.gray.500")};
    opacity: 0.5;
    cursor: not-allowed;
  }

  &::after {
    content: '';
    position: absolute;
    top: -6px;
    left: -6px;
    right: -6px;
    bottom: -6px;
    border-radius: 100px;
    border: 2px solid ${(props) => props.color};
    opacity: 0;
    transition: opacity 500ms;
  }

  &:disabled::after {
    border: 2px solid ${token.var("colors.gray.500")};
  }

  &:hover::after {
    opacity: 1;
  }
`;

const ChildWrapper = styled.div`
  /* Our Oswald font doesn't quite look vertically centered. Fix it. */
  transform: translateY(-1px);
`;

export default Button;
