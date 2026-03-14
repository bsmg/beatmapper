import { switchAnatomy } from "@ark-ui/react/switch";
import { defineSlotRecipe } from "@pandacss/dev";

export const switchRecipe = defineSlotRecipe({
	className: "switch",
	jsx: ["Switch", /Switch\.+/],
	slots: switchAnatomy.keys(),
	base: {
		root: {
			display: "flex",
			alignItems: "center",
			gap: 1,
		},
		label: {
			userSelect: "none",
		},
		control: {
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			justifyContent: { base: "start", _checked: "end" },
			borderWidth: "sm",
			borderColor: "border.default",
			borderRadius: "full",
			outlineWidth: "sm",
			outlineStyle: { base: "none", _focus: "solid" },
			outlineColor: "border.outline",
			outlineOffset: 0.25,
			cursor: "pointer",
		},
		thumb: {
			backgroundColor: "white",
			borderWidth: "md",
			borderColor: "border.muted",
			borderRadius: "full",
		},
	},
	variants: {
		size: {
			sm: {
				label: { fontSize: "0.75rem" },
				control: { width: "28px", height: "16px" },
				thumb: { marginInline: "2px", boxSize: "12px" },
			},
			md: {
				control: { width: "36px", height: "20px" },
				thumb: { marginInline: "2px", boxSize: "16px" },
			},
		},
		orientation: {
			horizontal: {
				root: { flexDirection: "row" },
			},
			vertical: {
				root: { flexDirection: "column-reverse" },
			},
		},
	},
	defaultVariants: {
		size: "md",
		orientation: "horizontal",
	},
});
