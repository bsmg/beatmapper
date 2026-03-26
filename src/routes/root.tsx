import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";
import { getYear, isToday, setYear } from "date-fns";
import { Fragment } from "react";

import { useSetupContext } from "$/components/context";
import Devtools from "$/components/devtools";
import { Toaster } from "$/components/ui/compositions";

export const Route = createRootRoute({
	component: RootComponent,
	beforeLoad: () => {
		const now = Date.now();
		return { now, theme: isToday(setYear("04/01", getYear(now))) ? "light" : "dark" };
	},
	head: () => {
		return { meta: [{ title: "Beatmapper" }, { name: "description", content: "A web-based level editor for Beat Saber™." }] };
	},
	onEnter: ({ context }) => {
		document.documentElement.classList.add(context.theme);
	},
});

function RootComponent() {
	const { toaster } = useSetupContext();

	return (
		<Fragment>
			<HeadContent />
			<Outlet />
			{toaster && <Toaster toaster={toaster} />}
			<Devtools position="top-right" hideUntilHover openHotkey={[`\``]} />
		</Fragment>
	);
}
