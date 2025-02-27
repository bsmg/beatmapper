import { XIcon } from "lucide-react";
import type { PropsWithChildren } from "react";
import styled, { keyframes } from "styled-components";

import { token } from "$:styled-system/tokens";

import Heading from "../Heading";
import Spacer from "../Spacer";
import UnstyledButton from "../UnstyledButton";

interface Props extends PropsWithChildren {
	title: string;
	onDismiss: () => void;
}

const UnobtrusivePrompt = ({ title, children, onDismiss }: Props) => {
	return (
		<Wrapper>
			<CloseButton onClick={onDismiss}>
				<XIcon size={24} />
			</CloseButton>
			<Heading size={2}>{title}</Heading>
			<Spacer size={token.var("spacing.3")} />
			<Contents>{children}</Contents>
		</Wrapper>
	);
};

const enterAnimation = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Wrapper = styled.div`
  position: absolute;
  z-index: 999;
  max-width: 400px;
  background: color-mix(in srgb, ${token.var("colors.slate.900")}, transparent 10%);
  top: ${token.var("spacing.2")};
  right: ${token.var("spacing.2")};
  padding: ${token.var("spacing.3")};
  box-shadow: 0px 5px 30px rgba(0, 0, 0, 0.8);
  animation: ${enterAnimation} 500ms 1000ms both ease-out;
`;

const CloseButton = styled(UnstyledButton)`
  position: absolute;
  top: ${token.var("spacing.2")};
  right: ${token.var("spacing.2")};
`;

const Contents = styled.div`
  & p,
  & li {
    font-size: 16px;
    font-family: 'system';
    line-height: 1.5;
  }

  p:not(:last-of-type) {
    margin-bottom: ${token.var("spacing.2")};
  }
`;

export default UnobtrusivePrompt;
