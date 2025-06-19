import { CirclePlusIcon, DownloadIcon, PackageOpenIcon } from "lucide-react";
import { useCallback, useState } from "react";

import { heroVideo } from "$/assets";
import { loadDemoMap } from "$/store/actions";
import { useAppDispatch } from "$/store/hooks";

import { VStack, Wrap, styled } from "$:styled-system/jsx";
import { CreateMapForm, ImportMapForm } from "$/components/app/forms";
import { Button, Dialog, Heading } from "$/components/ui/compositions";
import OptionColumn from "./option";

function FirstTimeHome() {
	const dispatch = useAppDispatch();

	const [isLoadingDemo, setIsLoadingDemo] = useState(false);

	const handleDemoClick = useCallback(() => {
		setIsLoadingDemo(true);
		dispatch(loadDemoMap());
	}, [dispatch]);

	return (
		<VStack gap={8}>
			<Title rank={1}>Beatmapper is a web-based level editor for Beat Saber™</Title>
			<VStack gap={6}>
				<video src={heroVideo} autoPlay muted loop controls />
			</VStack>
			<VStack gap={6}>
				<Heading rank={2}>Get started now</Heading>
				<Wrap gap={4}>
					<OptionColumn icon={PackageOpenIcon} title="Try a demo map" description="Take the editor for a test-drive with some surprisingly good public-domain dubstep">
						<Button variant="solid" size="md" loading={isLoadingDemo} onClick={handleDemoClick}>
							Start mapping
						</Button>
					</OptionColumn>
					<OptionColumn icon={CirclePlusIcon} title="Create new map" description="Build a new map from scratch, using music from your computer">
						<Dialog title="Create new map" description="Build a new map from scratch, using music from your computer" unmountOnExit render={(ctx) => <CreateMapForm dialog={ctx} />}>
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
}

const Title = styled(Heading, {
	base: {
		fontWeight: "normal",
		whiteSpace: "wrap",
		textAlign: "center",
	},
});

export default FirstTimeHome;
