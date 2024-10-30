import { Fragment, type PropsWithChildren, useEffect } from "react";
import { Helmet } from "react-helmet";
import type { TocEntry } from "remark-mdx-toc";
import styled from "styled-components";

import { COLORS, UNIT } from "$/constants";

import Spacer from "../Spacer";
import HorizontalRule from "./HorizontalRule";
import MdxWrapper from "./MdxWrapper";
import TableOfContents from "./TableOfContents";

/**
 * When loading a new route, we want to scroll the user to the top of the page.
 * Unless a hash is explicitly provided, in which case we scroll them to the appropriate section.
 */
function useScrollOnLoad() {
	useEffect(() => {
		window.scrollTo({ top: 0 });
	}, []);
}

interface Props extends PropsWithChildren {
	title: string;
	subtitle: string;
	tableOfContents: TocEntry[];
}

const DocPage = ({ title, subtitle, tableOfContents, children }: Props) => {
	useScrollOnLoad();

	return (
		<Fragment>
			<Helmet>
				<title>Beatmapper docs - {title}</title>
			</Helmet>
			<Wrapper>
				<Title>{title}</Title>
				{subtitle && <Subtitle>{subtitle}</Subtitle>}

				<HorizontalRule />

				<Row>
					<MainContent>
						<MdxWrapper>{children}</MdxWrapper>
						<Spacer size={UNIT * 8} />
					</MainContent>
					<TableOfContents toc={tableOfContents} />
				</Row>
			</Wrapper>
		</Fragment>
	);
};

const Wrapper = styled.div`
  padding: 45px 60px;
  font-family: 'system';
  max-width: 1250px;
`;

const Title = styled.div`
  font-size: 38px;
  color: ${COLORS.blueGray[900]};
  font-weight: 900;
  margin-bottom: 12px;
  /* font-family: 'Raleway'; */
`;

const Subtitle = styled.div`
  font-size: 28px;
  color: ${COLORS.blueGray[500]};
  font-weight: 500;
`;

const Row = styled.div`
  display: flex;
  align-items: flex-start;
`;

const MainContent = styled.div`
  flex: 1;
`;

export default DocPage;
