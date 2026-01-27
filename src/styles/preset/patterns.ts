import { definePattern } from "@pandacss/dev";

export const container = definePattern({
	transform: (props) => {
		return Object.assign(props, {
			position: "relative",
			maxWidth: "1000px",
			marginInline: "auto",
			paddingInline: { base: "4", md: "6", lg: "8" },
		});
	},
});
