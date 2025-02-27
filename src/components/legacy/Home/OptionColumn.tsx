import type { MouseEventHandler } from "react";
import { Icon, type IconProp } from "react-icons-kit";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";

import Button from "../Button";
import Heading from "../Heading";
import Paragraph from "../Paragraph";
import Spacer from "../Spacer";

interface Props {
	icon: IconProp["icon"];
	title: string;
	disabled?: boolean;
	description: string;
	buttonText: string;
	handleClick: MouseEventHandler;
}

const OptionColumn = ({ icon, title, disabled, description, buttonText, handleClick }: Props) => {
	return (
		<Wrapper>
			<Icon icon={icon} size={24} />
			<Spacer size={token.var("spacing.4")} />
			<Title size={3}>{title}</Title>
			<Spacer size={token.var("spacing.2")} />
			<Description>{description}</Description>
			<Spacer size={token.var("spacing.4")} />
			<Button onClick={handleClick} disabled={disabled}>
				{buttonText}
			</Button>
		</Wrapper>
	);
};

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${token.var("colors.slate.300")};
  margin-bottom: ${token.var("spacing.5")};
`;

const Title = styled(Heading)`
  color: white;
`;

const Description = styled(Paragraph)`
  color: ${token.var("colors.slate.300")};
  text-align: center;
`;

export default OptionColumn;
