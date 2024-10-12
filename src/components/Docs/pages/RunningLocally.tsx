import Doc, { frontMatter, tableOfContents } from "$/docs/running-locally.mdx";

import DocPage from "../DocPage";

const Page = () => {
	return (
		<DocPage tableOfContents={tableOfContents} {...frontMatter}>
			<Doc />
		</DocPage>
	);
};

export default Page;