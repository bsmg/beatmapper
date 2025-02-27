import type { LucideProps } from "lucide-react";
import type { ComponentType } from "react";
import { Tooltip } from "react-tippy";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";

import Spacer from "../Spacer";

interface Props {
	num: number;
	label: string;
	icon: ComponentType<LucideProps>;
}

const CountIndicator = ({ num, label, icon: Icon }: Props) => {
	return (
		<Tooltip title={label} delay={250}>
			<Wrapper>
				<Icon size={12} />
				<Spacer size={token.var("spacing.1")} />
				<Count>{num}</Count>
			</Wrapper>
		</Tooltip>
	);
};

const Count = styled.div``;

const Wrapper = styled.div`
  display: flex;
	align-items: center;
  cursor: default;
`;

export default CountIndicator;
