import { TanStackDevtools, type TanStackDevtoolsReactInit } from "@tanstack/react-devtools";
import { FormDevtoolsPanel } from "@tanstack/react-form-devtools";
import { PacerDevtoolsPanel } from "@tanstack/react-pacer-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

const PLUGINS = [
	{
		name: "TanStack Form",
		render: <FormDevtoolsPanel />,
	},
	{
		name: "TanStack Pacer",
		render: <PacerDevtoolsPanel />,
	},
	{
		name: "TanStack Query",
		render: <ReactQueryDevtoolsPanel />,
	},
	{
		name: "TanStack Router",
		render: <TanStackRouterDevtoolsPanel />,
	},
];

function Devtools({ ...config }: TanStackDevtoolsReactInit["config"]) {
	return <TanStackDevtools config={config} plugins={PLUGINS} />;
}

export default Devtools;
