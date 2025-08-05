import { createListCollection } from "@ark-ui/react/collection";

import { Sidebar } from "$/components/docs/layouts";
import { Accordion } from "$/components/ui/compositions";
import { docs } from "$:content";

function getDocsForCategory(category: string | null) {
	return docs.filter((x) => x.category === category).sort((a, b) => a.order - b.order);
}

const DOCS_LIST_COLLECTION = createListCollection({
	items: ["manual", "advanced", "release-notes", "legal"].map((category, index) => {
		return {
			value: category,
			label: ["User Manual", "Advanced", "Release Notes", "Legal"][index],
			render: () => (
				<Sidebar.NavGroup>
					{getDocsForCategory(category).map((entry) => (
						<Sidebar.NavItem key={entry.id} entry={entry} />
					))}
				</Sidebar.NavGroup>
			),
		};
	}),
});

function DocsSidebar() {
	return (
		<Sidebar.Root>
			<Sidebar.NavGroup>
				{getDocsForCategory(null).map((entry) => (
					<Sidebar.NavItem key={entry.id} entry={entry} />
				))}
			</Sidebar.NavGroup>
			<Accordion collection={DOCS_LIST_COLLECTION} multiple />
		</Sidebar.Root>
	);
}

export default DocsSidebar;
