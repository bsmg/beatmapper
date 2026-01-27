import { definePattern } from "@pandacss/dev";

import { textStyles } from "./theme";

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

export const strikethroughOnHover = definePattern({
	jsxElement: "span",
	properties: {
		color: {
			type: "property",
			value: "color",
		},
	},
	transform: ({ color, ...props }) => {
		return Object.assign(props, {
			position: "relative",
			_hover: {
				_after: {
					content: "''",
					position: "absolute",
					top: "50%",
					insetInline: "-2px",
					borderWidth: "sm",
					borderColor: color,
					borderRadius: "sm",
					pointerEvents: "none",
				},
			},
		});
	},
});

export const text = definePattern({
	jsxElement: "span",
	properties: {
		textStyle: {
			type: "enum",
			value: Object.keys(textStyles),
		},
		color: {
			type: "property",
			value: "color",
		},
		fontFamily: {
			type: "property",
			value: "fontFamily",
		},
		fontSize: {
			type: "property",
			value: "fontSize",
		},
		fontWeight: {
			type: "property",
			value: "fontWeight",
		},
		lineHeight: {
			type: "property",
			value: "lineHeight",
		},
	},
	transform: (props) => props,
});
