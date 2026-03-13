import { useParams } from "@tanstack/react-router";

import { UpdateBeatmapForm } from "$/components/app/forms";
import { For } from "$/components/ui/atoms";
import { useAppSelector } from "$/store/hooks";
import { selectBeatmapIds } from "$/store/selectors";
import { styled, Wrap } from "$:styled-system/jsx";

function BeatmapDetails() {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const beatmapIds = useAppSelector((state) => selectBeatmapIds(state, sid));

	return (
		<Wrap gap={2} justify={"center"}>
			<For each={beatmapIds}>
				{(beatmapId) => (
					<BeatmapWrapper key={beatmapId}>
						<UpdateBeatmapForm bid={beatmapId} />
					</BeatmapWrapper>
				)}
			</For>
		</Wrap>
	);
}

const BeatmapWrapper = styled("div", {
	base: {
		colorPalette: "slate",
		layerStyle: "fill.surface",
		padding: 3,
		width: "250px",
		height: "fit-content",
	},
});

export default BeatmapDetails;
