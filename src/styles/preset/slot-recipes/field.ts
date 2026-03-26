import { fieldAnatomy } from "@ark-ui/react/field";
import { defineSlotRecipe } from "@pandacss/dev";

export const field = defineSlotRecipe({
	className: "field",
	slots: fieldAnatomy.keys(),
	base: {
		root: {
			display: "flex",
			flex: 1,
		},
		label: {
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			gap: 1,
			textStyle: "heading",
			fontSize: "15px",
			color: "fg.default",
			cursor: "default",
			_required: {
				_after: {
					content: "'*'",
					color: "fg.error",
				},
			},
		},
		helperText: {
			_icon: { color: "fg.muted", boxSize: "1em", cursor: "help" },
			fontWeight: 300,
		},
		errorText: {
			fontSize: "0.875em",
			lineHeight: 1.25,
			whiteSpace: "wrap",
			textOverflow: "ellipsis",
			color: { _light: "red.700", _dark: "red.300" },
		},
	},
	variants: {
		align: {
			start: { root: { alignItems: "flex-start" } },
			center: { root: { alignItems: "flex-center" } },
			end: { root: { alignItems: "flex-end" } },
		},
		size: {
			sm: { root: { gap: 1 }, label: { fontSize: "12px" } },
			md: { root: { gap: 1.5 }, label: { fontSize: "15px" } },
		},
		orientation: {
			horizontal: { root: { flexDirection: "row" } },
			vertical: { root: { flexDirection: "column" } },
		},
	},
	defaultVariants: {
		size: "md",
		orientation: "vertical",
	},
});
