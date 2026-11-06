import { useHotkey } from "@ark-ui/react/hotkeys";
import { useRouteContext } from "@tanstack/react-router";
import { BoxIcon, CuboidIcon, GaugeIcon, GlobeIcon, Layers3Icon, Maximize2Icon, Minimize2Icon, SplineIcon } from "lucide-react";
import { useMemo } from "react";

import { getHotkeyCategory, getHotkeyScopes } from "$/components/app/helpers";
import { StatusBar } from "$/components/app/layouts";
import { decrementTrackScale, incrementTrackScale, updateTrackScale } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectLoading, selectNoteDensity, selectTotalArcs, selectTotalBombNotes, selectTotalChains, selectTotalColorNotes, selectTotalObstacles, selectTrackScale } from "$/store/selectors";
import { pluralize } from "$/utils";

function NotesEditorStatusBar() {
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_/_scene/notes" });

	const dispatch = useAppDispatch();
	const isLoading = useAppSelector(selectLoading);
	const beatDepth = useAppSelector(selectTrackScale);
	const numOfBlocks = useAppSelector(selectTotalColorNotes);
	const numOfMines = useAppSelector(selectTotalBombNotes);
	const numOfObstacles = useAppSelector(selectTotalObstacles);
	const numOfArcs = useAppSelector(selectTotalArcs);
	const numOfChains = useAppSelector(selectTotalChains);
	const noteDensity = useAppSelector(selectNoteDensity);

	const scopes = useMemo(() => getHotkeyScopes(view), [view]);
	const category = useMemo(() => getHotkeyCategory(scopes), [scopes]);

	useHotkey({ scopes, category, label: "Decrement Track Scale", hotkey: "Alt+[", action: () => dispatch(decrementTrackScale()) });
	useHotkey({ scopes, category, label: "Increment Track Scale", hotkey: "Alt+]", action: () => dispatch(incrementTrackScale()) });

	return (
		<StatusBar.Section>
			<StatusBar.Group>
				<StatusBar.Indicator label={`${numOfBlocks} ${pluralize(numOfBlocks, "note")}`} icon={BoxIcon}>
					{numOfBlocks}
				</StatusBar.Indicator>
				<StatusBar.Indicator label={`${numOfMines} ${pluralize(numOfMines, "bomb")}`} icon={GlobeIcon}>
					{numOfMines}
				</StatusBar.Indicator>
				<StatusBar.Indicator label={`${numOfObstacles} ${pluralize(numOfObstacles, "obstacle")}`} icon={CuboidIcon}>
					{numOfObstacles}
				</StatusBar.Indicator>
				<StatusBar.Indicator label={`${numOfArcs} ${pluralize(numOfArcs, "arc")}`} icon={SplineIcon}>
					{numOfArcs}
				</StatusBar.Indicator>
				<StatusBar.Indicator label={`${numOfChains} ${pluralize(numOfChains, "chain")}`} icon={Layers3Icon}>
					{numOfChains}
				</StatusBar.Indicator>
			</StatusBar.Group>
			<StatusBar.Indicator label={"Notes per second"} icon={GaugeIcon}>
				{noteDensity.toFixed(2)}
			</StatusBar.Indicator>
			<StatusBar.Range label={"Beat depth"} disabled={isLoading} minIcon={Minimize2Icon} maxIcon={Maximize2Icon} min={5} max={25} value={[beatDepth]} onValueChange={(details) => dispatch(updateTrackScale(details.value[0]))} />
		</StatusBar.Section>
	);
}

export default NotesEditorStatusBar;
