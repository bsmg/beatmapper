import type { PropsWithChildren } from "react";
import styled from "styled-components";

import Heading from "../Heading";
import Spacer from "../Spacer";

interface Props extends PropsWithChildren {
	label: string;
}

const LabeledNumber = ({ label, children }: Props) => {
	return (
		<Wrapper>
			<Heading size={4}>{label}</Heading>
			<Spacer size={6} />
			<Value>{children}</Value>
		</Wrapper>
	);
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 36px;
`;

const Value = styled.div`
  color: #fff;
  font-size: 16px;
  font-family: 'Inconsolata', monospace;
`;

export default LabeledNumber;
