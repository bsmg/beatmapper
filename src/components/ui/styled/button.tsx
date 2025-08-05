"use client";

import { ark } from "@ark-ui/react/factory";

import { cva } from "$:styled-system/css";
import { styled } from "$:styled-system/jsx";
import { center } from "$:styled-system/patterns";

export const recipe = cva({
	base: center.raw({
		position: "relative",
		display: "inline-flex",
		opacity: { base: 1, _disabled: "disabled" },
		cursor: { base: "pointer", _disabled: "not-allowed" },
		userSelect: "none",
		transitionProperty: "background-color",
		transitionDuration: "fast",
		_loading: {
			"& > :first-child": {
				visibility: "hidden",
			},
		},
	}),
	variants: {
		variant: {
			solid: {
				layerStyle: "fill.solid",
				color: "white",
				borderRadius: "full",
				_after: {
					content: "''",
					position: "absolute",
					inset: "-6px",
					borderWidth: "md",
					borderColor: "colorPalette.500",
					borderRadius: "full",
					opacity: 0,
					transitionProperty: "opacity",
					transitionDuration: "normal",
				},
				_disabled: {
					_after: { borderWidth: 0 },
				},
				_hover: {
					_after: { opacity: 1 },
				},
			},
			subtle: {
				layerStyle: "fill.subtle",
				borderRadius: "md",
				fontSize: "14px",
			},
			ghost: {
				layerStyle: "fill.ghost",
				borderRadius: "md",
			},
		},
		size: {
			sm: {
				paddingBlock: 0.5,
				paddingInline: 1.5,
			},
			md: {
				paddingBlock: 1,
				paddingInline: 6,
			},
			icon: {
				width: "36px",
				height: "36px",
				_icon: {
					boxSize: "18px",
				},
			},
		},
		stretch: {
			true: { width: "100%" },
		},
	},
	defaultVariants: {},
});

export const Button = styled(ark.button, recipe);
