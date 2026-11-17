import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useMemo } from "react";

import { useNoteJumpSpeed } from "$/components/app/hooks/use-note-jump-speed.hook";
import { EventGridControls, EventGridEditor } from "$/components/app/templates/events";
import { ReduxForwardingCanvas } from "$/components/scene/atoms";
import { Controls } from "$/components/scene/templates/controls";
import DefaultEnvironment from "$/components/scene/templates/environment";
import MapVisualization from "$/components/scene/templates/visualization";
import { useAppSelector } from "$/store/hooks";
import { selectEventsEditorPreview, selectEventsEditorTrackOpacity, selectTimeProcessor } from "$/store/selectors";
import { styled } from "$:styled-system/jsx";
import { stack } from "$:styled-system/patterns";
import { token } from "$:styled-system/tokens";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/_scene/events")({
	component: RouteComponent,
});

function RouteComponent() {
	const { sid } = Route.useParams();

	const showLightingPreview = useAppSelector(selectEventsEditorPreview);
	const backgroundOpacity = useAppSelector(selectEventsEditorTrackOpacity);
	const timeProcessor = useAppSelector((state) => selectTimeProcessor(state, sid));

	const { beatDepth, surfaceDepth } = useNoteJumpSpeed();

	const bgStyle = useMemo(() => ({ background: `color-mix(in srgb, ${token.var("colors.bg.canvas")}, transparent ${(1 - backgroundOpacity) * 100}%)` }), [backgroundOpacity]);

	return (
		<Fragment>
			<Background>
				{showLightingPreview && (
					<ReduxForwardingCanvas>
						<MapVisualization timescale={(time) => timeProcessor.toRealTime(time)} beatDepth={beatDepth} surfaceDepth={surfaceDepth} interactive={false} />
						<DefaultEnvironment surfaceDepth={surfaceDepth} />
						<Controls />
					</ReduxForwardingCanvas>
				)}
			</Background>
			<Wrapper>
				<EventGridControls style={bgStyle} />
				<EventGridEditor style={bgStyle} />
			</Wrapper>
		</Fragment>
	);
}

const Background = styled("div", {
	base: {
		position: "absolute",
		inset: 0,
	},
});

const Wrapper = styled("div", {
	base: stack.raw({
		position: "absolute",
		width: "100%",
		top: "82px",
		bottom: "calc({sizes.statusBar} + {sizes.navigationPanel} - 6px)",
		justify: "flex-end",
		gap: 0,
	}),
});
