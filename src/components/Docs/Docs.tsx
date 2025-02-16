import { docs } from "velite:content";
import { useMemo } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import DocPage from "./DocPage";
import Layout from "./Layout";

const Docs = () => {
	const allDocs = useMemo(() => docs, []);
	return (
		<Layout>
			<Routes>
				<Route path="/" element={<Navigate to={"/docs/intro"} replace />} />
				{allDocs.map((entry) => {
					return <Route key={entry.id} path={`/${entry.id}`} element={<DocPage id={entry.id} />} />;
				})}
			</Routes>
		</Layout>
	);
};

export default Docs;
