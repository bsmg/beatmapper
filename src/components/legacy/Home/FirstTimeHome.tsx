import { CirclePlusIcon, DownloadIcon, PackageOpenIcon } from "lucide-react";
import { useState } from "react";

import { heroVideo } from "$/assets";
import { loadDemoMap } from "$/store/actions";
import { useAppDispatch } from "$/store/hooks";

import { VStack, Wrap, styled } from "$:styled-system/jsx";
import { Button, Dialog, Heading } from "$/components/ui/compositions";
import AddSongForm from "../AddSongForm";
import ImportMapForm from "../ImportMapForm";
import OptionColumn from "./OptionColumn";

const FirstTimeHome = () => {
	const dispatch = useAppDispatch();

	const [isLoadingDemo, setIsLoadingDemo] = useState(false);

	return (
		<VStack gap={8}>
			<Title rank={1}>Beatmapper is an unofficial web-based editor for Beat Saber™</Title>
			<VStack gap={6}>
				<video src={heroVideo} autoPlay muted loop controls />
			</VStack>
			<VStack gap={6}>
				<Heading rank={2}>Get started now</Heading>
				<Wrap gap={4}>
					<OptionColumn icon={PackageOpenIcon} title="Try a demo map" description="Take the editor for a test-drive with some surprisingly good public-domain dubstep">
						<Button
							variant="solid"
							size="md"
							loading={isLoadingDemo}
							onClick={() => {
								setIsLoadingDemo(true);
								dispatch(loadDemoMap());
							}}
						>
							Start mapping
						</Button>
					</OptionColumn>
					<OptionColumn icon={CirclePlusIcon} title="Create new song" description="Build a new map from scratch, using music from your computer">
						<Dialog title="Create new song" description="Build a new map from scratch, using music from your computer" unmountOnExit render={(ctx) => <AddSongForm dialog={ctx} />}>
							<Button variant="solid" size="md">
								Create from scratch
							</Button>
						</Dialog>
					</OptionColumn>
					<OptionColumn icon={DownloadIcon} title="Import existing map" description="Edit an existing map by selecting it from your computer">
						<Dialog title="Import existing map" description="Edit an existing map by selecting it from your computer" unmountOnExit render={(ctx) => <ImportMapForm dialog={ctx} />}>
							<Button variant="solid" size="md">
								Import map
							</Button>
						</Dialog>
					</OptionColumn>
				</Wrap>
			</VStack>
		</VStack>
	);
};

const Title = styled(Heading, {
	base: {
		fontWeight: 400,
		whiteSpace: "wrap",
		textAlign: "center",
	},
});

export default FirstTimeHome;
