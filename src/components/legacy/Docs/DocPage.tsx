import { docs } from "velite:content";
import type { MDXComponents } from "mdx/types";
import { Fragment, type PropsWithChildren, useMemo } from "react";
import { Helmet } from "react-helmet";
import styled from "styled-components";

import { COLORS, UNIT } from "$/constants";

import Spacer from "../Spacer";
import HorizontalRule from "./HorizontalRule";
import MdxWrapper from "./MdxWrapper";
import PreviousNextBar from "./PreviousNextBar";
import TableOfContents from "./TableOfContents";

interface Props extends PropsWithChildren {
	id: string;
	components?: MDXComponents;
}

const DocPage = ({ id, components }: Props) => {
	const document = useMemo(() => docs.find((x) => x.id === id), [id]);
	if (!document) {
		throw new Error("No doc found at this route.");
	}

	return (
		<Fragment>
			<Helmet>
				<title>Beatmapper Docs - {document.title}</title>
			</Helmet>
			<Wrapper>
				<Title>{document.title}</Title>
				{document.subtitle && <Subtitle>{document.subtitle}</Subtitle>}
				<HorizontalRule />
				<Row>
					<MainContent>
						<MdxWrapper components={components} code={document.code} />
						<Spacer size={UNIT * 8} />
					</MainContent>
					<TableOfContents toc={document.tableOfContents} />
				</Row>
				{(document.prev || document.next) && <PreviousNextBar prev={document.prev} next={document.next} />}
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
