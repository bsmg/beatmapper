import { useParams, useRouteContext } from "@tanstack/react-router";
import { useCallback } from "react";

import { useGlobalEventListener } from "$/components/hooks/use-global-event-listener";
import { usePrompter } from "$/components/ui/compositions";
import { decrementEventsEditorZoomLevel, incrementEventsEditorZoomLevel, toggleSelectAllEntities, updateEventsEditorColor, updateEventsEditorEditMode, updateEventsEditorMirrorLock, updateEventsEditorTool, updateEventsEditorWindowLock } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectLoading } from "$/store/selectors";
import { EventColor, EventEditMode, EventTool } from "$/types";
import { isMetaKeyPressed } from "$/utils";

function EventsEditorShortcuts() {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const isLoading = useAppSelector(selectLoading);

	const { isPromptActive } = usePrompter();

	const handleKeyDown = useCallback(
		(ev: KeyboardEvent) => {
			if (isLoading) return;
			if (isPromptActive) return;

			const metaKeyPressed = isMetaKeyPressed(ev, navigator);
			switch (ev.code) {
				case "NumpadSubtract":
				case "Minus": {
					if (metaKeyPressed) return;
					ev.preventDefault();
					return dispatch(decrementEventsEditorZoomLevel());
				}
				case "NumpadAdd":
				case "Equal": {
					if (metaKeyPressed) return;
					ev.preventDefault();
					return dispatch(incrementEventsEditorZoomLevel());
				}
				case "KeyA": {
					if (metaKeyPressed) {
						ev.preventDefault();
						return dispatch(toggleSelectAllEntities({ songId: sid, view }));
					}
					return dispatch(updateEventsEditorEditMode(EventEditMode.PLACE));
				}
				case "KeyS": {
					return dispatch(updateEventsEditorEditMode(EventEditMode.SELECT));
				}
				case "KeyZ": {
					if (metaKeyPressed) return;
					ev.stopPropagation();
					return dispatch(updateEventsEditorWindowLock());
				}
				case "KeyX": {
					if (metaKeyPressed) return;
					ev.stopPropagation();
					return dispatch(updateEventsEditorMirrorLock());
				}
				case "Digit1": {
					return dispatch(updateEventsEditorTool(EventTool.ON));
				}
				case "Digit2": {
					return dispatch(updateEventsEditorTool(EventTool.OFF));
				}
				case "Digit3": {
					return dispatch(updateEventsEditorTool(EventTool.FLASH));
				}
				case "Digit4": {
					return dispatch(updateEventsEditorTool(EventTool.FADE));
				}
				case "Digit5": {
					return dispatch(updateEventsEditorTool(EventTool.TRANSITION));
				}
				case "KeyR": {
					if (ev.shiftKey) return;
					return dispatch(updateEventsEditorColor(EventColor.PRIMARY));
				}
				case "KeyB": {
					if (isMetaKeyPressed(ev)) return;
					if (ev.shiftKey) return;
					return dispatch(updateEventsEditorColor(EventColor.SECONDARY));
				}
				default: {
					return;
				}
			}
		},
		[isLoading, isPromptActive, dispatch, sid, view],
	);

	useGlobalEventListener("keydown", handleKeyDown);

	return null;
}

export default EventsEditorShortcuts;
