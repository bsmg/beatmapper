import { styled } from "$:styled-system/jsx";

export { Consumer as Context } from "./context";
export { default as Root } from "./root";

export const Header = styled("div", {
	base: {
		borderBottomWidth: "sm",
		borderColor: "border.default",
		paddingBottom: 1,
		marginBottom: 1,
		fontWeight: "bold",
	},
});

export const Footer = styled("div", {
	base: {
		borderTopWidth: "sm",
		borderColor: "border.default",
		paddingTop: 1,
		marginTop: 1,
		fontWeight: "bold",
	},
});

export const Item = styled("a", {
	base: {
		textStyle: "link",
		colorPalette: "pink",
		paddingBlock: 1,
	},
});
