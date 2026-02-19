import { createListCollection } from "@ark-ui/react/collection";

import { Sidebar } from "$/components/docs/layouts";
import { For } from "$/components/ui/atoms";
import { Accordion } from "$/components/ui/compositions";
import { docs } from "$:content";

function getDocsForCategory(category: string | null) {
	return docs.filter((x) => x.category === category).sort((a, b) => a.order - b.order);
}

function renderNavGroup(category: string | null) {
	return (
		<Sidebar.NavGroup>
			<For each={getDocsForCategory(category)}>{(entry) => <Sidebar.NavItem key={entry.id} entry={entry} />}</For>
		</Sidebar.NavGroup>
	);
}

const DOCS_LIST_COLLECTION = createListCollection({
	items: ["manual", "advanced", "release-notes", "legal"] as const,
	itemToString: (item) => {
		return { manual: "User Manual", advanced: "Advanced", "release-notes": "Release Notes", legal: "Legal" }[item];
	},
});

function DocsSidebar() {
	return (
		<Sidebar.Root>
			{renderNavGroup(null)}
			<Accordion collection={DOCS_LIST_COLLECTION} multiple renderItem={(category) => renderNavGroup(category)} />
		</Sidebar.Root>
	);
}

export default DocsSidebar;
