import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";
import { getYear, isToday, setYear } from "date-fns";
import { Fragment } from "react";

import Devtools from "$/components/devtools";
import { Toaster } from "$/components/ui/compositions";
import { getAppToaster } from "$/setup";

export const Route = createRootRoute({
	component: RootComponent,
	beforeLoad: () => {
		const now = Date.now();
		const theme = isToday(setYear("04/01", getYear(now))) ? "light" : "dark";

		document.documentElement.classList.add(theme);

		return { now, theme };
	},
	head: () => {
		return { meta: [{ title: "Beatmapper" }] };
	},
});

function RootComponent() {
	return (
		<Fragment>
			<HeadContent />
			<Outlet />
			<Toaster toaster={getAppToaster()} />
			<Devtools position="top-right" hideUntilHover openHotkey={[`\``]} />
		</Fragment>
	);
}
