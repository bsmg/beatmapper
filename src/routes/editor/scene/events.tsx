import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useMemo } from "react";

import { token } from "$:styled-system/tokens";
import { useAppSelector } from "$/store/hooks";
import { selectEventBackgroundOpacity, selectEventEditorTogglePreview } from "$/store/selectors";

import { styled } from "$:styled-system/jsx";
import { stack } from "$:styled-system/patterns";
import { EventsGrid, GridControls } from "$/components/app/templates/events";
import { EditorLightshowShortcuts } from "$/components/app/templates/shortcuts";
import { ReduxForwardingCanvas } from "$/components/scene/atoms";
import LightingPreview from "$/components/scene/templates/environment";

export const Route = createFileRoute("/_/edit/$sid/$bid/_/_scene/events")({
	component: RouteComponent,
});

function RouteComponent() {
	const { sid } = Route.useParams();
	const showLightingPreview = useAppSelector(selectEventEditorTogglePreview);
	const backgroundOpacity = useAppSelector(selectEventBackgroundOpacity);

	const bgStyle = useMemo(() => ({ background: `color-mix(in srgb, ${token.var("colors.bg.canvas")}, transparent ${(1 - backgroundOpacity) * 100}%)` }), [backgroundOpacity]);

	return (
		<Fragment>
			<Background>
				{showLightingPreview && (
					<ReduxForwardingCanvas>
						<LightingPreview sid={sid} />
					</ReduxForwardingCanvas>
				)}
			</Background>
			<Wrapper>
				<GridControls sid={sid} style={bgStyle} />
				<EventsGrid sid={sid} style={bgStyle} />
				<EditorLightshowShortcuts />
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
