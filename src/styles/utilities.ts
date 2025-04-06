import { defineUtility } from "@pandacss/dev";

export const boxSize = defineUtility({
	values: "sizes",
	transform: (value) => ({ width: value, height: value }),
});
