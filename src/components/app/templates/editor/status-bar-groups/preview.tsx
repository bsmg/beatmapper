import { useParams, useRouteContext } from "@tanstack/react-router";
import { BoxesIcon, GaugeIcon } from "lucide-react";
import { useDeferredValue, useMemo } from "react";

import { getHotkeyCategory, getHotkeyScopes } from "$/components/app/helpers";
import { StatusBar } from "$/components/app/layouts";
import { useAppSelector } from "$/store/hooks";
import { selectCurrentJumpSpeed, selectNoteDensity } from "$/store/selectors";

function PreviewEditorStatusBar() {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_/_scene/preview" });

	const noteDensity = useAppSelector(selectNoteDensity);
	const currentJumpSpeed = useAppSelector((state) => selectCurrentJumpSpeed(state, sid, bid));
	const deferredCurrentJumpSpeed = useDeferredValue(currentJumpSpeed);

	const scopes = useMemo(() => getHotkeyScopes(view), [view]);
	// biome-ignore lint/correctness/noUnusedVariables: placeholder
	const category = useMemo(() => getHotkeyCategory(scopes), [scopes]);

	return (
		<StatusBar.Section>
			<StatusBar.Group>
				<StatusBar.Indicator label={"Notes per second"} icon={BoxesIcon}>
					{noteDensity.toFixed(2)}
				</StatusBar.Indicator>
				<StatusBar.Indicator label={"Current NJS"} icon={GaugeIcon}>
					{deferredCurrentJumpSpeed.toFixed(3)}
				</StatusBar.Indicator>
			</StatusBar.Group>
		</StatusBar.Section>
	);
}

export default PreviewEditorStatusBar;
