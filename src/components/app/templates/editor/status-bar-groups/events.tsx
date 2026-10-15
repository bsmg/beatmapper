import { useHotkey } from "@ark-ui/react/hotkeys";
import { useRouteContext } from "@tanstack/react-router";
import { EyeClosedIcon, EyeIcon, Maximize2Icon, Minimize2Icon, ZapIcon, ZapOffIcon } from "lucide-react";
import { useMemo } from "react";

import { getHotkeyCategory, getHotkeyScopes } from "$/components/app/helpers";
import { StatusBar } from "$/components/app/layouts";
import { decrementEventsEditorTrackHeight, decrementEventsEditorTrackOpacity, incrementEventsEditorTrackHeight, incrementEventsEditorTrackOpacity, updateEventsEditorPreview, updateEventsEditorTrackHeight, updateEventsEditorTrackOpacity } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectEventsEditorPreview, selectEventsEditorTrackHeight, selectEventsEditorTrackOpacity, selectLoading } from "$/store/selectors";

function EventsEditorStatusBar() {
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_/_scene/events" });

	const dispatch = useAppDispatch();
	const isLoading = useAppSelector(selectLoading);
	const showLightingPreview = useAppSelector(selectEventsEditorPreview);
	const rowHeight = useAppSelector(selectEventsEditorTrackHeight);
	const backgroundOpacity = useAppSelector(selectEventsEditorTrackOpacity);

	const scopes = useMemo(() => getHotkeyScopes(view), [view]);
	const category = useMemo(() => getHotkeyCategory(scopes), [scopes]);

	useHotkey({ scopes, category, label: "Show Environment Preview", hotkey: "V", action: () => dispatch(updateEventsEditorPreview(!showLightingPreview)) });

	useHotkey({ scopes, category, label: "Decrement Track Height", hotkey: "Alt+[", action: () => dispatch(decrementEventsEditorTrackHeight()) });
	useHotkey({ scopes, category, label: "Increment Track Height", hotkey: "Alt+]", action: () => dispatch(incrementEventsEditorTrackHeight()) });

	useHotkey({ scopes, category, label: "Decrement Track Opacity", hotkey: "Alt+Shift+[", action: () => dispatch(decrementEventsEditorTrackOpacity()) });
	useHotkey({ scopes, category, label: "Increment Track Opacity", hotkey: "Alt+Shift+]", action: () => dispatch(incrementEventsEditorTrackOpacity()) });

	return (
		<StatusBar.Section>
			<StatusBar.Toggle label={"Show environment"} disabled={isLoading} checked={showLightingPreview} onIcon={ZapIcon} offIcon={ZapOffIcon} onCheckedChange={(details) => dispatch(updateEventsEditorPreview(details.checked))} />
			<StatusBar.Range label={"Track height"} disabled={isLoading} minIcon={Minimize2Icon} maxIcon={Maximize2Icon} min={25} max={50} step={2.5} value={[rowHeight]} onValueChange={(details) => dispatch(updateEventsEditorTrackHeight(details.value[0]))} />
			<StatusBar.Range label={"Track opacity"} disabled={isLoading} minIcon={EyeClosedIcon} maxIcon={EyeIcon} min={0.2} max={1} step={0.1} value={[backgroundOpacity]} onValueChange={(details) => dispatch(updateEventsEditorTrackOpacity(details.value[0]))} />
		</StatusBar.Section>
	);
}

export default EventsEditorStatusBar;
