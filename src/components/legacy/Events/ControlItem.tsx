import { type CSSProperties, Children, Fragment, type PropsWithChildren } from "react";
import styled from "styled-components";

import { UNIT } from "$/constants";

import Heading from "../Heading";
import Spacer from "../Spacer";

interface Props extends PropsWithChildren {
	label: string;
	isExpandable?: boolean;
	align?: CSSProperties["textAlign"];
}

const ControlItem = ({ label, children, align }: Props) => {
	return (
		<Wrapper style={{ textAlign: align }}>
			<Heading size={4}>{label}</Heading>
			<Spacer size={UNIT} />

			<ChildrenWrapper>
				{Children.map(children, (child, i) => (
					<Fragment key={label}>
						{child}
						{i < Children.count(children) - 1 && <Spacer size={UNIT} />}
					</Fragment>
				))}
			</ChildrenWrapper>
		</Wrapper>
	);
};

const Wrapper = styled.div``;

const ChildrenWrapper = styled.div`
  display: flex;
`;

export default ControlItem;
