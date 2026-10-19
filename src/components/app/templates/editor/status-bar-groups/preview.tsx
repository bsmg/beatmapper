import { useRouteContext } from "@tanstack/react-router";
import { useMemo } from "react";

import { getHotkeyCategory, getHotkeyScopes } from "$/components/app/helpers";
import { StatusBar } from "$/components/app/layouts";

function PreviewEditorStatusBar() {
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_/_scene/preview" });

	const scopes = useMemo(() => getHotkeyScopes(view), [view]);
	// biome-ignore lint/correctness/noUnusedVariables: placeholder
	const category = useMemo(() => getHotkeyCategory(scopes), [scopes]);

	return <StatusBar.Section>{/* */}</StatusBar.Section>;
}

export default PreviewEditorStatusBar;
