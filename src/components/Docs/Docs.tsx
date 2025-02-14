import { Navigate, Route, Routes } from "react-router-dom";

import AudioSample from "./AudioSample/AudioSample";
import DocPage from "./DocPage";
import Layout from "./Layout";
import Mouse from "./Mouse";
import { Shortcut, ShortcutTable } from "./Shortcut";

const Docs = () => {
	return (
		<Layout>
			<Routes>
				<Route path="/" element={<Navigate to={"/docs/intro"} replace />} />
				<Route path="/intro" element={<DocPage id="intro" />} />
				<Route path="/song-prep" element={<DocPage id="song-prep" components={{ AudioSample }} />} />
				<Route path="/keyboard-shortcuts" element={<DocPage id="keyboard-shortcuts" components={{ Mouse, Shortcut, ShortcutTable }} />} />
				<Route path="/manual/getting-started" element={<DocPage id="getting-started" />} />
				<Route path="/manual/navigating-the-editor" element={<DocPage id="navigating-the-editor" />} />
				<Route path="/manual/notes-view" element={<DocPage id="notes-view" />} />
				<Route path="/manual/events-view" element={<DocPage id="events-view" />} />
				<Route path="/manual/demo-view" element={<DocPage id="demo-view" />} />
				<Route path="/manual/publishing" element={<DocPage id="publishing" />} />
				<Route path="/migrating" element={<DocPage id="migrating" />} />
				<Route path="/mods" element={<DocPage id="mods" />} />
				<Route path="/fast-walls" element={<DocPage id="fast-walls" />} />
				<Route path="/running-locally" element={<DocPage id="running-locally" />} />
				<Route path="/releases/0.2" element={<DocPage id="0.2" />} />
				<Route path="/releases/0.3" element={<DocPage id="0.3" />} />
				<Route path="/privacy" element={<DocPage id="privacy" />} />
				<Route path="/content-policy" element={<DocPage id="content-policy" />} />
			</Routes>
		</Layout>
	);
};

export default Docs;
