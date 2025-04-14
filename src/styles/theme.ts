import { defineAnimationStyles, defineKeyframes, defineLayerStyles, defineSemanticTokens, defineTextStyles, defineTokens } from "@pandacss/dev";

import base from "@pandacss/dev/presets";

import { Difficulty } from "../types";

const { radii, shadows, durations, animations, aspectRatios, blurs } = base.theme.tokens;
const { spin, pulse } = base.theme.keyframes;

export const tokens = defineTokens({
	colors: {
		black: { value: "#000000" },
		white: { value: "#ffffff" },
		gray: {
			100: { value: "hsl(0, 0%, 92%)" },
			300: { value: "hsl(0, 0%, 60%)" },
			500: { value: "hsl(0, 0%, 28%)" },
			700: { value: "hsl(0, 0%, 14%)" },
			900: { value: "hsl(0, 0%, 7%)" },
		},
		slate: {
			50: { value: "hsl(222, 4%, 96%)" },
			100: { value: "hsl(222, 4%, 92%)" },
			200: { value: "hsl(222, 5%, 85%)" },
			300: { value: "hsl(222, 7%, 60%)" },
			400: { value: "hsl(222, 8.5%, 42%)" },
			500: { value: "hsl(222, 10%, 28%)" },
			600: { value: "hsl(222, 12%, 23%)" },
			700: { value: "hsl(222, 15%, 18%)" },
			800: { value: "hsl(222, 25%, 12%)" },
			900: { value: "hsl(222, 30%, 7%)" },
			950: { value: "hsl(222, 32%, 4%)" },
		},
		pink: {
			100: { value: "hsl(310, 100%, 92%)" },
			300: { value: "hsl(310, 100%, 75%)" },
			500: { value: "hsl(310, 100%, 50%)" },
			700: { value: "hsl(302, 100%, 42%)" },
			900: { value: "hsl(302, 50%, 10%)" },
		},
		red: {
			100: { value: "hsl(360, 100%, 92%)" },
			300: { value: "hsl(360, 100%, 75%)" },
			500: { value: "hsl(360, 100%, 50%)" },
			700: { value: "hsl(350, 80%, 30%)" },
			900: { value: "hsl(350, 50%, 10%)" },
		},
		blue: {
			100: { value: "hsl(212, 100%, 92%)" },
			300: { value: "hsl(212, 100%, 75%)" },
			500: { value: "hsl(212, 100%, 45%)" },
			700: { value: "hsl(222, 100%, 40%)" },
			900: { value: "hsl(222, 50%, 10%)" },
		},
		yellow: {
			100: { value: "hsl(44, 100%, 92%)" },
			300: { value: "hsl(44, 100%, 80%)" },
			500: { value: "hsl(48, 100%, 60%)" },
			700: { value: "hsl(48, 100%, 30%)" },
			900: { value: "hsl(48, 50%, 10%)" },
		},
		green: {
			100: { value: "hsl(160, 100%, 92%)" },
			300: { value: "hsl(160, 100%, 80%)" },
			500: { value: "hsl(160, 100%, 45%)" },
			700: { value: "hsl(165, 100%, 30%)" },
			900: { value: "hsl(165, 50%, 10%)" },
		},
	},
	letterSpacings: {
		normal: { value: "0em" },
		wider: { value: "0.05em" },
	},
	lineHeights: {
		snug: { value: "1.375" },
		normal: { value: "1.5" },
	},
	radii: {
		sm: radii.sm,
		md: radii.md,
		full: radii.full,
	},
	borderWidths: {
		sm: { value: "1px" },
		md: { value: "2px" },
		lg: { value: "4px" },
	},
	shadows: {
		xl: shadows.xl,
	},
	durations: {
		normal: durations.normal,
		fast: durations.fast,
	},
	animations: {
		spin: animations.spin,
		pulse: animations.pulse,
	},
	aspectRatios: {
		square: aspectRatios.square,
	},
	blurs: {
		base: blurs.base,
	},
	opacity: {
		disabled: { value: 0.35 },
	},
});

export const semanticTokens = defineSemanticTokens({
	colors: {
		bg: {
			backdrop: { value: "rgba(0, 0, 0, 0.45)" },
			canvas: { value: { _light: "{colors.slate.50}", _dark: "{colors.slate.950}" } },
			default: { value: { _light: "white", _dark: "{colors.slate.900}" } },
			solid: { value: { _light: "{colors.slate.400}", _dark: "{colors.slate.600}" } },
			muted: { value: { _light: "{colors.slate.200}", _dark: "{colors.slate.800}" } },
			subtle: { value: { _light: "{colors.slate.300}", _dark: "{colors.slate.700}" } },
			ghost: { value: { _light: "rgba(0, 0, 0, 0.1)", _dark: "rgba(255, 255, 255, 0.1)" } },
			disabled: { value: { _light: "{colors.slate.400}", _dark: "{colors.slate.600}" } },
			translucent: { value: { _light: "rgba(255, 255, 255, 0.75)", _dark: "rgba(0, 0, 0, 0.75)" } },
		},
		fg: {
			default: { value: { _light: "{colors.slate.950}", _dark: "{colors.slate.50}" } },
			muted: { value: { _light: "{colors.slate.800}", _dark: "{colors.slate.200}" } },
			subtle: { value: { _light: "{colors.slate.900}", _dark: "{colors.slate.100}" } },
			disabled: { value: { _light: "{colors.slate.600}", _dark: "{colors.slate.400}" } },
			error: { value: { _light: "{colors.red.700}", _dark: "{colors.red.300}" } },
		},
		border: {
			default: { value: { _light: "{colors.slate.600}", _dark: "{colors.slate.400}" } },
			outline: { value: { _light: "{colors.slate.900}", _dark: "{colors.slate.100}" } },
			muted: { value: { _light: "{colors.slate.400}", _dark: "{colors.slate.600}" } },
			subtle: { value: { _light: "{colors.slate.300}", _dark: "{colors.slate.700}" } },
			disabled: { value: { _light: "{colors.slate.400}", _dark: "{colors.slate.600}" } },
			error: { value: { _light: "{colors.red.500}", _dark: "{colors.red.500}" } },
		},
		difficulty: {
			[Difficulty.EASY]: { value: "#4AFFBE" },
			[Difficulty.NORMAL]: { value: "#FCFF6A" },
			[Difficulty.HARD]: { value: "#4AE9FF" },
			[Difficulty.EXPERT]: { value: "#FF4A6B" },
			[Difficulty.EXPERT_PLUS]: { value: "#FF5FF9" },
		},
	},
	fonts: {
		body: { value: ["'Oswald'", "sans-serif"] },
		monospace: { value: ["'Inconsolata'", "monospace"] },
		logo: { value: ["'Raleway'", "sans-serif"] },
	},
	sizes: {
		header: { value: "75px" },
		footer: { value: "100px" },
		sidebar: { value: "55px" },
		mediaRow: { value: "150px" },
		iconButton: { value: "36px" },
		statusBar: { value: "30px" },
		navigationPanel: { value: "150px" },
		actionPanelFull: { value: "110px" },
		actionPanelHalf: { value: "calc(({sizes.actionPanelFull} / 2) - {spacing.0.5})" },
	},
});

export const keyframes = defineKeyframes({
	spin: spin,
	pulse: pulse,
	"fade-in": {
		from: { opacity: 0 },
		to: { opacity: 1 },
	},
	"fade-out": {
		from: { opacity: 1 },
		to: { opacity: 0 },
	},
	"slide-from-top": {
		from: { translate: "0 -1rem" },
		to: { translate: "0" },
	},
	"slide-from-bottom": {
		from: { translate: "0 1rem" },
		to: { translate: "0" },
	},
	"slide-from-left": {
		from: { translate: "-1rem 0" },
		to: { translate: "0" },
	},
	"slide-from-right": {
		from: { translate: "1rem 0" },
		to: { translate: "0" },
	},
	"slide-to-top": {
		from: { translate: "0" },
		to: { translate: "0 -1rem" },
	},
	"slide-to-bottom": {
		from: { translate: "0" },
		to: { translate: "0 1rem" },
	},
	"slide-to-left": {
		from: { translate: "0" },
		to: { translate: "-1rem 0" },
	},
	"slide-to-right": {
		from: { translate: "0" },
		to: { translate: "1rem 0" },
	},
});

export const textStyles = defineTextStyles({
	paragraph: {
		value: {
			fontSize: "1rem",
			fontWeight: 300,
			lineHeight: "normal",
		},
	},
	heading: {
		value: {
			fontWeight: 300,
			letterSpacing: "wider",
			textTransform: "uppercase",
			whiteSpace: "nowrap",
			textOverflow: "clip",
		},
	},
	link: {
		value: {
			fontWeight: 400,
			textDecoration: { _hover: "underline" },
		},
	},
});

export const layerStyles = defineLayerStyles({
	"fill.solid": {
		value: {
			backgroundColor: { base: "colorPalette.700", _disabled: "bg.disabled" },
			"--current-color": { base: "fg.default", _disabled: "fg.disabled" },
			color: "var(--current-color)",
			_icon: { color: "var(--current-color)" },
			opacity: { base: 1, _disabled: "disabled" },
		},
	},
	"fill.subtle": {
		value: {
			backgroundColor: {
				base: { _light: "colorPalette.300/50", _dark: "colorPalette.700/50" },
				_hover: { _light: "colorPalette.300", _dark: "colorPalette.700" },
				_disabled: "bg.disabled",
			},
			"--current-color": { base: "fg.default", _disabled: "fg.disabled" },
			color: "var(--current-color)",
			_icon: { color: "var(--current-color)" },
			borderWidth: "sm",
			borderColor: {
				base: { _light: "colorPalette.300", _dark: "colorPalette.700" },
				_disabled: "border.disabled",
			},
			backdropFilter: "blur(2px)",
			opacity: { base: 1, _disabled: "disabled" },
		},
	},
	"fill.ghost": {
		value: {
			backgroundColor: { base: "transparent", _hover: "bg.ghost", _active: "bg.ghost" },
			"--current-color": { base: "fg.default", _disabled: "fg.disabled" },
			color: "var(--current-color)",
			_icon: { color: "var(--current-color)" },
			opacity: { base: 1, _disabled: "disabled" },
		},
	},
	"fill.surface": {
		value: {
			backgroundColor: {
				base: { _light: "colorPalette.100", _dark: "colorPalette.900" },
				_disabled: "bg.disabled",
			},
			"--current-border-color": { _light: "colors.colorPalette.300", _dark: "colors.colorPalette.700" },
			color: "fg.default",
			borderWidth: "sm",
			borderColor: {
				base: "color-mix(in srgb, var(--current-border-color), {colors.border.default} 75%)",
				_disabled: "border.disabled",
			},
			borderRadius: "sm",
			boxShadow: "xl",
			opacity: { base: 1, _disabled: "disabled" },
		},
	},
	"fill.panel": {
		value: {
			backgroundColor: {
				base: { _light: "colorPalette.300/75", _dark: "colorPalette.700/75" },
				_disabled: "bg.disabled",
			},
			"--current-border-color": { _light: "colors.colorPalette.300", _dark: "colors.colorPalette.700" },
			color: "fg.default",
			borderWidth: "sm",
			borderColor: {
				base: "color-mix(in srgb, var(--current-border-color), {colors.border.default} 75%)",
				_disabled: "border.disabled",
			},
			borderRadius: "sm",
			boxShadow: "xl",
			opacity: { base: 1, _disabled: "disabled" },
		},
	},
	"outline.subtle": {
		value: {
			color: { base: "fg.muted", _checked: "fg.default", _pressed: "fg.default", _disabled: "fg.disabled" },
			borderWidth: "sm",
			borderColor: { base: "border.muted", _checked: "var(--current-color)", _pressed: "var(--current-color)", _disabled: "border.disabled" },
			borderRadius: "sm",
			opacity: { base: 1, _disabled: "disabled" },
		},
	},
	"menu.content": {
		value: {
			backgroundColor: "white",
			color: "black",
			borderWidth: "sm",
			borderColor: "border.default",
			borderRadius: "md",
		},
	},
	"menu.item": {
		value: {
			backgroundColor: { base: "white", _highlighted: "colorPalette.500" },
			color: { base: "black", _highlighted: "white", _disabled: "fg.disabled" },
			_first: {
				borderTopLeftRadius: "sm",
				borderTopRightRadius: "sm",
			},
			_last: {
				borderBottomLeftRadius: "sm",
				borderBottomRightRadius: "sm",
			},
		},
	},
});

export const animationStyles = defineAnimationStyles({
	"fade-in": {
		value: {
			animationName: "fade-in",
			animationDuration: "fast",
		},
	},
	"fade-out": {
		value: {
			animationName: "fade-out",
			animationDuration: "fast",
		},
	},
	"slide-fade-in": {
		value: {
			transformOrigin: "var(--transform-origin)",
			animationDuration: "fast",
			"&[data-placement^=top]": { animationName: "slide-from-bottom, fade-in" },
			"&[data-placement^=bottom]": { animationName: "slide-from-top, fade-in" },
			"&[data-placement^=left]": { animationName: "slide-from-right, fade-in" },
			"&[data-placement^=right]": { animationName: "slide-from-left, fade-in" },
		},
	},
	"slide-fade-out": {
		value: {
			transformOrigin: "var(--transform-origin)",
			animationDuration: "fast",
			"&[data-placement^=top]": { animationName: "slide-to-bottom, fade-out" },
			"&[data-placement^=bottom]": { animationName: "slide-to-top, fade-out" },
			"&[data-placement^=left]": { animationName: "slide-to-right, fade-out" },
			"&[data-placement^=right]": { animationName: "slide-to-left, fade-out" },
		},
	},
});
