import Doc, { frontMatter, tableOfContents } from "$/docs/releases/0.2.mdx";

import DocPage from "../DocPage";

const Page = () => {
	return (
		<DocPage tableOfContents={tableOfContents} {...frontMatter}>
			<Doc />
		</DocPage>
	);
};

export default Page;
