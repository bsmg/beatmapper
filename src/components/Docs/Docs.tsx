import { docs } from "velite:content";
import { Navigate, Route, Routes } from "react-router-dom";

import DocPage from "./DocPage";
import Layout from "./Layout";

function getDocsForCategory(category: string | null) {
	return docs.filter((x) => x.category === category).sort((a, b) => a.order - b.order);
}

const Docs = () => {
	return (
		<Layout>
			<Routes>
				<Route path="/" element={<Navigate to={"/docs/intro"} replace />} />
				{getDocsForCategory(null).map((entry) => {
					return <Route key={entry.id} path={`/${entry.id}`} element={<DocPage id={entry.id} />} />;
				})}
				{getDocsForCategory("manual").map((entry) => {
					return <Route key={entry.id} path={`/manual/${entry.id}`} element={<DocPage id={entry.id} />} />;
				})}
				{getDocsForCategory("advanced").map((entry) => {
					return <Route key={entry.id} path={`/${entry.id}`} element={<DocPage id={entry.id} />} />;
				})}
				{getDocsForCategory("release-notes").map((entry) => {
					return <Route key={entry.id} path={`/releases/${entry.id}`} element={<DocPage id={entry.id} />} />;
				})}
				{getDocsForCategory("legal").map((entry) => {
					return <Route key={entry.id} path={`/${entry.id}`} element={<DocPage id={entry.id} />} />;
				})}
				{getDocsForCategory("legacy").map((entry) => {
					return <Route key={entry.id} path={`/${entry.id}`} element={<DocPage id={entry.id} />} />;
				})}
			</Routes>
		</Layout>
	);
};

export default Docs;
