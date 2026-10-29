import { useHotkey } from "@ark-ui/react/hotkeys";
import { useRouteContext } from "@tanstack/react-router";
import { BellIcon, BellOffIcon, FastForwardIcon, RewindIcon, Volume2Icon, VolumeXIcon } from "lucide-react";
import { useMemo } from "react";

import { getHotkeyCategory, getHotkeyScopes } from "$/components/app/helpers";
import { StatusBar } from "$/components/app/layouts";
import { Show } from "$/components/ui/atoms";
import { decrementPlaybackRate, decrementSongVolume, decrementTickVolume, incrementPlaybackRate, incrementSongVolume, incrementTickVolume, updatePlaybackRate, updateSongVolume, updateTickVolume } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectLoading, selectPlaybackRate, selectSongVolume, selectTickVolume } from "$/store/selectors";
import { View } from "$/types";

function DefaultEditorStatusBar() {
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const isLoading = useAppSelector(selectLoading);
	const playbackRate = useAppSelector(selectPlaybackRate);
	const songVolume = useAppSelector(selectSongVolume);
	const tickVolume = useAppSelector(selectTickVolume);

	const scopes = useMemo(() => getHotkeyScopes("editor"), []);
	const category = useMemo(() => getHotkeyCategory(scopes), [scopes]);

	useHotkey({ scopes, category, label: "Decrement Playback Speed", hotkey: "Mod+-", action: () => dispatch(decrementPlaybackRate()) });
	useHotkey({ scopes, category, label: "Increment Playback Speed", hotkey: "Mod+=", action: () => dispatch(incrementPlaybackRate()) });

	useHotkey({ scopes, category, label: "Decrement Song Volume", hotkey: "Alt+-", action: () => dispatch(decrementSongVolume()) });
	useHotkey({ scopes, category, label: "Increment Song Volume", hotkey: "Alt+=", action: () => dispatch(incrementSongVolume()) });

	useHotkey({ scopes, category, label: "Decrement Tick Volume", hotkey: "Alt+Shift+-", action: () => dispatch(decrementTickVolume()) });
	useHotkey({ scopes, category, label: "Increment Tick Volume", hotkey: "Alt+Shift+=", action: () => dispatch(incrementTickVolume()) });

	return (
		<StatusBar.Section>
			<Show when={view !== View.LIGHTSHOW}>{() => <StatusBar.Range label={"Note tick volume"} disabled={isLoading} minIcon={BellOffIcon} maxIcon={BellIcon} min={0} max={1} step={0.1} value={[tickVolume]} onValueChange={(details) => dispatch(updateTickVolume(details.value[0]))} />}</Show>
			<StatusBar.Range label={"Playback rate"} marks={[1]} disabled={isLoading} minIcon={RewindIcon} maxIcon={FastForwardIcon} min={0} max={2} step={0.1} value={[playbackRate]} onValueChange={(details) => dispatch(updatePlaybackRate(details.value[0]))} />
			<StatusBar.Range label={"Song volume"} disabled={isLoading} minIcon={VolumeXIcon} maxIcon={Volume2Icon} min={0} max={1} step={0.1} value={[songVolume]} onValueChange={(details) => dispatch(updateSongVolume(details.value[0]))} />
		</StatusBar.Section>
	);
}

export default DefaultEditorStatusBar;
