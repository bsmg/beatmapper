import { Presence } from "@ark-ui/react/presence";
import { useMemo } from "react";

import { useMount } from "$/components/hooks";
import { downloadMapFiles, pausePlaying } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectIsDemoSong, selectIsPlaying } from "$/store/selectors";
import type { SongId } from "$/types";

import { VStack, styled } from "$:styled-system/jsx";
import { vstack } from "$:styled-system/patterns";
import { Button, Heading, Text } from "$/components/ui/compositions";

interface Props {
	sid: SongId;
}
function Download({ sid }: Props) {
	const dispatch = useAppDispatch();
	const isDemo = useAppSelector((state) => selectIsDemoSong(state, sid));
	const isPlaying = useAppSelector(selectIsPlaying);

	// When this component mounts, if the song is playing, pause it.
	useMount(() => {
		if (isPlaying) {
			pausePlaying();
		}
	});

	const canDownload = useMemo(() => import.meta.env.PROD && isDemo, [isDemo]);

	return (
		<Content>
			<Heading rank={1}>Download Map</Heading>
			<Presence asChild present={canDownload} lazyMount unmountOnExit>
				<VStack gap={6}>
					<Text>Unfortunately, the demo map is not available for download.</Text>
				</VStack>
			</Presence>
			<Presence asChild present={!canDownload} lazyMount unmountOnExit>
				<VStack gap={6}>
					<VStack gap={2}>
						<Text>Click to download a .zip containing all of the files needed to transfer your map onto a device for testing, or to submit for uploading.</Text>
						<Button variant="solid" size="md" onClick={() => dispatch(downloadMapFiles({ songId: sid, version: 2 }))}>
							Download map files
						</Button>
					</VStack>
					<VStack gap={2}>
						<Text>If you wish to import your map into other map software, you may need to download a legacy version of the map files.</Text>
						<Button variant="subtle" size="sm" onClick={() => dispatch(downloadMapFiles({ songId: sid, version: 1 }))}>
							Download legacy files
						</Button>
					</VStack>
				</VStack>
			</Presence>
		</Content>
	);
}

const Content = styled("div", {
	base: vstack.raw({
		gap: 2,
		colorPalette: "slate",
		layerStyle: "fill.surface",
		maxWidth: "400px",
		marginInline: "auto",
		padding: 4,
		textAlign: "center",
	}),
});

export default Download;
