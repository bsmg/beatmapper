import { createListCollection } from "@ark-ui/react/collection";

import { Tabs } from "$/components/ui/compositions";
import { Fragment } from "react/jsx-runtime";
import AppAudioSettings from "./audio";
import AppGraphicsSettings from "./graphics";

const collection = createListCollection({
	items: [
		{ value: "user", label: "User", render: () => "Coming soon™" },
		{ value: "audio", label: "Audio", render: () => <AppAudioSettings /> },
		{ value: "graphics", label: "Graphics", render: () => <AppGraphicsSettings /> },
		{ value: "controls", label: "Controls", render: () => "Coming soon™" },
		{ value: "advanced", label: "Advanced", render: () => "Coming soon™" },
		//
	],
	isItemDisabled: (item) => !["graphics", "audio"].includes(item.value),
});

function AppSettings() {
	return (
		<Fragment>
			<Tabs collection={collection} />
		</Fragment>
	);
}

export default AppSettings;
