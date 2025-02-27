import { docs } from "velite:content";
import { Fragment, useMemo } from "react";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";

import BaseLink from "../BaseLink";
import Spacer from "../Spacer";
import HorizontalRule from "./HorizontalRule";

interface NavProps {
	direction: "previous" | "next";
	item: { id: string; title: string };
}

const NavigationBlock = ({ direction, item }: NavProps) => {
	const formattedSubtitle = direction === "previous" ? "« PREVIOUS" : "NEXT »";

	return (
		<NavBlockWrapper
			style={{
				alignItems: direction === "previous" ? "flex-start" : "flex-end",
			}}
		>
			<Subtitle>{formattedSubtitle}</Subtitle>
			<BaseLink to={"/docs/$"} params={{ _splat: `manual/${item.id}` }}>
				{item.title}
			</BaseLink>
		</NavBlockWrapper>
	);
};

interface Props {
	prev?: string;
	next?: string;
}

const PreviousNextBar = ({ prev: prevId, next: nextId }: Props) => {
	const previous = useMemo(() => docs.find((page) => page.id === prevId), [prevId]);
	const next = useMemo(() => docs.find((page) => page.id === nextId), [nextId]);

	return (
		<Fragment>
			<Spacer size={40} />
			<HorizontalRule />
			<Wrapper>
				<Side>{previous && <NavigationBlock direction="previous" item={previous} />}</Side>
				<Side>{next && <NavigationBlock direction="next" item={next} />}</Side>
			</Wrapper>
		</Fragment>
	);
};

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Side = styled.div``;

const NavBlockWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Subtitle = styled.div`
  font-size: 14px;
  color: ${token.var("colors.slate.500")};
  margin-bottom: 6px;
`;

export default PreviousNextBar;
