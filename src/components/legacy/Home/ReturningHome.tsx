import type { CSSProperties, Dispatch, SetStateAction } from "react";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";

import Button from "../Button";
import Heading from "../Heading";
import MaxWidthWrapper from "../MaxWidthWrapper";
import Spacer from "../Spacer";
import SongsTable from "./SongsTable";

interface Props {
	isProcessingImport: boolean;
	setModal: Dispatch<SetStateAction<string | null>>;
}

const ReturningHome = ({ isProcessingImport, setModal }: Props) => {
	return (
		<MaxWidthWrapper>
			<Spacer size={token.var("spacing.8")} />
			<Heading size={1}>Select map to edit</Heading>
			<Spacer size={token.var("spacing.2")} />
			<Row>
				<MainColumn flex={6}>
					<SongsTable isLoading={isProcessingImport} />
				</MainColumn>
				<Spacer size={token.var("spacing.2")} />

				<SideColumn flex={2}>
					<Button style={{ width: "100%" }} onClick={() => setModal("create-new-song")}>
						Create new song
					</Button>
					<Spacer size={token.var("spacing.2")} />
					<Button style={{ width: "100%" }} onClick={() => setModal("import-map")}>
						Import existing map
					</Button>
				</SideColumn>
			</Row>
		</MaxWidthWrapper>
	);
};

const Row = styled.div`
  display: flex;
`;

const Column = styled.div<{ flex?: CSSProperties["flex"] }>`
  flex: ${(props) => props.flex};
  padding: ${token.var("spacing.2")};
`;

const MainColumn = styled(Column)`
  padding-left: 0;
`;

const SideColumn = styled(Column)`
  background: rgba(255, 255, 255, 0.06);
  padding: ${token.var("spacing.4")};
  margin-top: ${token.var("spacing.2")};
  margin-bottom: ${token.var("spacing.2")};
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: ${token.var("spacing.1")};
  min-width: 280px;
`;
export default ReturningHome;
