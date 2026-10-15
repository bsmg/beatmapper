import { useNavigate } from "@tanstack/react-router";
import { CirclePlusIcon, DownloadIcon, PackageOpenIcon } from "lucide-react";
import { useCallback, useState } from "react";

import { default as heroVideo } from "$/assets/videos/hero-video.mp4";
import { default as demoFileUrl } from "$/assets/zip/demo-map.zip?url";
import { CreateMapForm, ImportMapForm } from "$/components/app/forms";
import { Button, Heading, usePrompt } from "$/components/ui/compositions";
import { addSongFromFile } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectSongIds } from "$/store/selectors";
import { styled, VStack, Wrap } from "$:styled-system/jsx";
import OptionColumn from "./option";

function FirstTimeHome() {
	const dispatch = useAppDispatch();
	const songIds = useAppSelector(selectSongIds);

	const navigate = useNavigate();

	const [isLoadingDemo, setIsLoadingDemo] = useState(false);

	const handleDemoClick = useCallback(async () => {
		setIsLoadingDemo(true);
		const file = await fetch(demoFileUrl).then((response) => response.blob());
		const { songId, beatmapId } = await dispatch(addSongFromFile({ file, options: { readonly: true } })).unwrap();
		navigate({ to: "/edit/$sid/$bid/notes", params: { sid: songId.toString(), bid: beatmapId.toString() } });
		setIsLoadingDemo(false);
	}, [dispatch, navigate]);

	const { trigger: triggerCreate } = usePrompt({
		title: "Create new map",
		description: "Build a new map from scratch, using music from your computer",
		render: (ctx) => <CreateMapForm dialog={ctx.dialog} />,
	});
	const { trigger: triggerImport } = usePrompt({
		title: "Import existing map",
		description: "Edit an existing map by selecting it from your computer",
		render: (ctx) => <ImportMapForm dialog={ctx.dialog} onAccept={(files) => files.forEach((file) => void dispatch(addSongFromFile({ file, options: { currentSongIds: songIds } })))} />,
	});

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
						<Button variant="solid" size="md" onClick={triggerCreate}>
							Create from scratch
						</Button>
					</OptionColumn>
					<OptionColumn icon={DownloadIcon} title="Import existing map" description="Edit an existing map by selecting it from your computer">
						<Button variant="solid" size="md" onClick={triggerImport}>
							Import map
						</Button>
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
