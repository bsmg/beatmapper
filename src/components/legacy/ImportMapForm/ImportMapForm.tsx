import styled from "styled-components";

import { token } from "$:styled-system/tokens";

import Heading from "../Heading";
import ImportMap from "../ImportMap";
import List from "../List";
import Paragraph from "../Paragraph";
import Spacer from "../Spacer";

interface Props {
	onImport: () => void;
	onCancel: () => void;
}

const ImportMapForm = ({ onImport, onCancel }: Props) => {
	return (
		<Wrapper>
			<Heading size={1}>Import existing map</Heading>
			<Spacer size={token.var("spacing.6")} />
			<Paragraph style={{ fontSize: 18, fontWeight: 400 }}>To import a map, the following conditions must be met:</Paragraph>
			<Spacer size={token.var("spacing.3")} />
			<List>
				<List.ListItem>You have a song in OGG format (.ogg or .egg)</List.ListItem>
				<List.ListItem>You have a cover-art image in JPEG format</List.ListItem>
				<List.ListItem>You have the info file (either .json or .dat), and all relevant difficulty files</List.ListItem>
				<List.ListItem>You've zipped them all up, without an enclosing folder (select all files and archive them directly)</List.ListItem>
			</List>
			<Spacer size={token.var("spacing.5")} />
			<BottomParagraph>Drag and drop (or click to select) the .zip file:</BottomParagraph> <Spacer size={token.var("spacing.3")} />
			<ImportMap onImport={onImport} onCancel={onCancel} />
		</Wrapper>
	);
};

const Wrapper = styled.div`
  padding: ${token.var("spacing.4")};
`;

const BottomParagraph = styled.p`
  font-size: 18px;
  font-weight: 300;
  color: ${token.var("colors.slate.300")};
  text-align: center;
`;

export default ImportMapForm;
