import { createListCollection } from "@ark-ui/react/collection";
import { Fragment } from "react/jsx-runtime";

import { Tabs } from "$/components/ui/compositions";
import AppAdvancedSettings from "./advanced";
import AppAudioSettings from "./audio";
import AppControlsSettings from "./controls";
import AppGraphicsSettings from "./graphics";
import AppUserSettings from "./user";

const collection = createListCollection({
	items: [
		{ value: "user", label: "User", render: () => <AppUserSettings /> },
		{ value: "audio", label: "Audio", render: () => <AppAudioSettings /> },
		{ value: "graphics", label: "Graphics", render: () => <AppGraphicsSettings /> },
		{ value: "controls", label: "Controls", render: () => <AppControlsSettings /> },
		{ value: "advanced", label: "Advanced", render: () => <AppAdvancedSettings /> },
		//
	],
	isItemDisabled: (item) => !["user", "graphics", "audio", "advanced"].includes(item.value),
});

function AppSettings() {
	return (
		<Fragment>
			<Tabs unfocusOnClick collection={collection} />
		</Fragment>
	);
}

export default AppSettings;
