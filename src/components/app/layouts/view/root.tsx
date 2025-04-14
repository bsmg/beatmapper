import type { PropsWithChildren } from "react";

import { styled } from "$:styled-system/jsx";

function EditorViewRoot({ children }: PropsWithChildren) {
	return <Wrapper>{children}</Wrapper>;
}

const Wrapper = styled("div", {
	base: {
		backgroundColor: "black",
		boxSize: "100%",
	},
});

export default EditorViewRoot;
