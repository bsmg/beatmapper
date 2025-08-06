"use client";

import { ark } from "@ark-ui/react/factory";

import { cva } from "$:styled-system/css";
import { styled } from "$:styled-system/jsx";

export const recipe = cva({
	base: {
		width: "100%",
		lineHeight: 1.5,
		padding: 0,
		marginBlockStart: -1,
		color: { _placeholder: "fg.muted" },
		borderBottomWidth: "md",
		borderColor: { base: "border.default", _focus: "colorPalette.500", _invalid: "fg.error" },
		outline: "none",
		opacity: { base: 1, _disabled: "disabled" },
	},
	variants: {
		size: {
			md: { minHeight: "36px" },
		},
	},
	defaultVariants: {
		size: "md",
	},
});

export const Input = styled(ark.input, recipe);
export const Select = styled(ark.select, recipe);
export const Textarea = styled(ark.textarea, recipe);
