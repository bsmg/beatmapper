import { CircleIcon, DownloadIcon, PackageOpenIcon } from "lucide-react";
import { type Dispatch, type SetStateAction, useMemo, useState } from "react";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";
import { heroVideo } from "$/assets";
import { useWindowDimensions } from "$/hooks";
import { loadDemoMap } from "$/store/actions";
import { useAppDispatch } from "$/store/hooks";

import Center from "../Center";
import Heading from "../Heading";
import Spacer from "../Spacer";
import OptionColumn from "./OptionColumn";

const WRAPPER_MAX_WIDTH = "850px";
const WRAPPER_PADDING = token.var("spacing.2");

interface Props {
	setModal: Dispatch<SetStateAction<string | null>>;
}

const FirstTimeHome = ({ setModal }: Props) => {
	const dispatch = useAppDispatch();

	const { width: windowWidth } = useWindowDimensions();

	const [isLoadingDemo, setIsLoadingDemo] = useState(false);

	const videoWidth = useMemo(() => Math.min(Number.parseFloat(WRAPPER_MAX_WIDTH), windowWidth), [windowWidth]);

	return (
		<MainContent>
			<Center>
				<Title size={1}>Beatmapper is an unofficial web-based editor for Beat Saber™</Title>
				<Spacer size={token.var("spacing.4")} />
				<video
					src={heroVideo}
					autoPlay
					muted
					loop
					controls
					style={{
						width: videoWidth,
						marginLeft: -WRAPPER_PADDING,
						marginRight: -WRAPPER_PADDING,
					}}
				/>

				<Spacer size={token.var("spacing.10")} />
				<Heading size={2}>Get started now</Heading>
			</Center>
			<Spacer size={token.var("spacing.6")} />
			<Row>
				<OptionColumn
					icon={PackageOpenIcon}
					title="Try a demo map"
					description="Take the editor for a test-drive with some surprisingly good public-domain dubstep"
					buttonText={isLoadingDemo ? "Loading…" : "Start editing"}
					handleClick={() => {
						setIsLoadingDemo(true);
						dispatch(loadDemoMap());
					}}
				/>
				<Divider />
				<OptionColumn icon={CircleIcon} title="Create new song" description="Build a new map from scratch, using music from your computer" buttonText="Create from scratch" handleClick={() => setModal("create-new-song")} />
				<Divider />
				<OptionColumn icon={DownloadIcon} title="Import existing map" description="Edit an existing map by selecting it from your computer" buttonText="Import map" handleClick={() => setModal("import-map")} />
			</Row>

			<Spacer size={token.var("spacing.10")} />
		</MainContent>
	);
};

const MainContent = styled.div`
  max-width: ${WRAPPER_MAX_WIDTH};
  padding: ${WRAPPER_PADDING};
  margin: auto;
`;

const Title = styled(Heading)`
  font-family: 'Oswald', sans-serif;
  font-weight: 400;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: ${token.var("colors.slate.300")};
  font-size: 25px;
  text-align: center;
`;

const Row = styled.div`
  display: flex;

  @media (max-width: 740px) {
    flex-direction: column;
  }
`;

const Divider = styled.div`
  margin-left: ${token.var("spacing.4")};
  margin-right: ${token.var("spacing.4")};
  width: 0px;
  border-left: 1px dotted ${token.var("colors.slate.500")};
`;

export default FirstTimeHome;
