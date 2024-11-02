import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./Layout";
import ContentPolicy from "./pages/ContentPolicy";
import FastWalls from "./pages/FastWalls";
import Intro from "./pages/Intro";
import ManualDemo from "./pages/ManualDemo";
import ManualPublishing from "./pages/ManualDownloadingPublishing";
import ManualEvents from "./pages/ManualEvents";
import ManualGettingStarted from "./pages/ManualGettingStarted";
import ManualNavigatingTheEditor from "./pages/ManualNavigatingTheEditor";
import ManualNotes from "./pages/ManualNotes";
import Migrating from "./pages/Migrating";
import Mods from "./pages/Mods";
import Privacy from "./pages/Privacy";
import ReleaseNotes020 from "./pages/ReleaseNotes020";
import ReleaseNotes030 from "./pages/ReleaseNotes030";
import RunningLocally from "./pages/RunningLocally";
import Shortcuts from "./pages/Shortcuts";
import SongPrep from "./pages/SongPrep";

const Docs = () => {
	return (
		<Layout>
			<Routes>
				<Route path="/" element={<Navigate to={"/docs/intro"} replace />} />
				<Route path="/intro" element={<Intro />} />
				<Route path="/song-prep" element={<SongPrep />} />
				<Route path="/keyboard-shortcuts" element={<Shortcuts />} />
				<Route path="/manual/getting-started" element={<ManualGettingStarted />} />
				<Route path="/manual/navigating-the-editor" element={<ManualNavigatingTheEditor />} />
				<Route path="/manual/notes-view" element={<ManualNotes />} />
				<Route path="/manual/events-view" element={<ManualEvents />} />
				<Route path="/manual/demo-view" element={<ManualDemo />} />
				<Route path="/manual/publishing" element={<ManualPublishing />} />
				<Route path="/migrating" element={<Migrating />} />
				<Route path="/mods" element={<Mods />} />
				<Route path="/fast-walls" element={<FastWalls />} />
				<Route path="/running-locally" element={<RunningLocally />} />
				<Route path="/releases/0.2" element={<ReleaseNotes020 />} />
				<Route path="/releases/0.3" element={<ReleaseNotes030 />} />
				<Route path="/privacy" element={<Privacy />} />
				<Route path="/content-policy" element={<ContentPolicy />} />
			</Routes>
		</Layout>
	);
};

export default Docs;
