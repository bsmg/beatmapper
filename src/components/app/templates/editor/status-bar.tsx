import { useRouteContext } from "@tanstack/react-router";

import { StatusBar } from "$/components/app/layouts";
import { Show } from "$/components/ui/atoms";
import { View } from "$/types";
import { styled } from "$:styled-system/jsx";
import { DefaultEditorStatusBar, EventsEditorStatusBar, NotesEditorStatusBar, PreviewEditorStatusBar } from "./status-bar-groups";

function EditorStatusBar() {
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_" });

	return (
		<Wrapper onWheel={(ev) => ev.stopPropagation()}>
			<Show when={view === View.BEATMAP}>
				<NotesEditorStatusBar />
			</Show>
			<Show when={view === View.LIGHTSHOW}>
				<EventsEditorStatusBar />
			</Show>
			<Show when={view === View.PREVIEW}>
				<PreviewEditorStatusBar />
			</Show>
			<DefaultEditorStatusBar />
		</Wrapper>
	);
}

const Wrapper = styled(StatusBar.Root, {
	base: {
		position: "absolute",
		bottom: 0,
		width: "100%",
	},
});

export default EditorStatusBar;
