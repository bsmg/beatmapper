import Doc, { frontMatter, tableOfContents } from "$/docs/manual/navigating-the-editor.mdx";

import DocPage from "../DocPage";

const Page = () => {
	return (
		<DocPage tableOfContents={tableOfContents} {...frontMatter}>
			<Doc />
		</DocPage>
	);
};

export default Page;
