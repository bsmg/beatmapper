import { useRouteContext } from "@tanstack/react-router";
import { BoxesIcon } from "lucide-react";
import { useMemo } from "react";

import { getHotkeyCategory, getHotkeyScopes } from "$/components/app/helpers";
import { StatusBar } from "$/components/app/layouts";
import { useAppSelector } from "$/store/hooks";
import { selectNoteDensity } from "$/store/selectors";

function PreviewEditorStatusBar() {
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_/_scene/preview" });

	const noteDensity = useAppSelector(selectNoteDensity);

	const scopes = useMemo(() => getHotkeyScopes(view), [view]);
	// biome-ignore lint/correctness/noUnusedVariables: placeholder
	const category = useMemo(() => getHotkeyCategory(scopes), [scopes]);

	return (
		<StatusBar.Section>
			<StatusBar.Group>
				<StatusBar.Indicator label={"Notes per second"} icon={BoxesIcon}>
					{noteDensity.toFixed(2)}
				</StatusBar.Indicator>
			</StatusBar.Group>
		</StatusBar.Section>
	);
}

export default PreviewEditorStatusBar;
