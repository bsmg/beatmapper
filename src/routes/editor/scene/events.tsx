import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useMemo } from "react";

import { token } from "$:styled-system/tokens";
import { useAppSelector } from "$/store/hooks";
import { selectEventsEditorPreview, selectEventsEditorTrackOpacity } from "$/store/selectors";

import { styled } from "$:styled-system/jsx";
import { stack } from "$:styled-system/patterns";
import { EventGridControls, EventGridEditor } from "$/components/app/templates/events";
import { EventsEditorShortcuts } from "$/components/app/templates/shortcuts";
import { ReduxForwardingCanvas } from "$/components/scene/atoms";
import DefaultEnvironment from "$/components/scene/templates/environment";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/_scene/events")({
	component: RouteComponent,
});

function RouteComponent() {
	const { sid, bid } = Route.useParams();
	const showLightingPreview = useAppSelector(selectEventsEditorPreview);
	const backgroundOpacity = useAppSelector(selectEventsEditorTrackOpacity);

	const bgStyle = useMemo(() => ({ background: `color-mix(in srgb, ${token.var("colors.bg.canvas")}, transparent ${(1 - backgroundOpacity) * 100}%)` }), [backgroundOpacity]);

	return (
		<Fragment>
			<Background>
				{showLightingPreview && (
					<ReduxForwardingCanvas>
						<DefaultEnvironment sid={sid} bid={bid} />
					</ReduxForwardingCanvas>
				)}
			</Background>
			<Wrapper>
				<EventGridControls sid={sid} bid={bid} style={bgStyle} />
				<EventGridEditor sid={sid} bid={bid} style={bgStyle} />
				<EventsEditorShortcuts sid={sid} />
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
