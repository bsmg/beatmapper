import { styled } from "$:styled-system/jsx";
import { wrap } from "$:styled-system/patterns";

export { default as Root } from "./root";

export const ActionGroup = styled("div", {
	base: wrap.raw({
		align: "center",
		justify: "center",
		gap: 0.5,
	}),
	variants: {
		gap: {
			sm: { gap: 0.5 },
			md: { gap: 1 },
			lg: { gap: 2 },
		},
	},
	defaultVariants: {
		gap: "md",
	},
});
