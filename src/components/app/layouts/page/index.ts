import { Fragment } from "react";

import { Container, styled } from "$:styled-system/jsx";

export { default as Footer } from "./footer";
export { default as Header } from "./header";

export const Root = Fragment;

export const Content = styled(Container, {
	base: {
		flex: 1,
		minHeight: "calc(100vh - {sizes.header} - {sizes.footer})",
		paddingBlock: 8,
	},
});
