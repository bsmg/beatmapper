"use client";

import { Dialog, dialogAnatomy } from "@ark-ui/react/dialog";

import { sva } from "$:styled-system/css";
import { createStyleContext } from "$:styled-system/jsx";
import { center, stack } from "$:styled-system/patterns";
import { recipe as heading } from "./heading";

const recipe = sva({
	slots: [...dialogAnatomy.keys(), "actionTrigger"],
	base: {
		trigger: {
			cursor: { base: "pointer", _disabled: "not-allowed" },
		},
		backdrop: {
			position: "fixed",
			left: 0,
			top: 0,
			width: "100vw",
			height: "100vh",
			backdropFilter: "blur(8px)",
			backgroundColor: "bg.backdrop",
			animationStyle: { _open: "fade-in", _closed: "fade-out" },
		},
		positioner: center.raw({
			position: "fixed",
			left: 0,
			top: 0,
			width: "100vw",
			height: "100dvh",
		}),
		content: stack.raw({
			position: "relative",
			margin: 4,
			padding: 4,
			gap: 4,
			maxWidth: "100vw",
			maxHeight: "calc(100vh - {spacing.8})",
			overflowY: "auto",
			wordWrap: "break-word",
			colorPalette: "slate",
			layerStyle: "fill.surface",
			animationStyle: { _open: "slide-fade-in", _closed: "slide-fade-out" },
			zIndex: 5,
			'& > :not[data-role="alertdialog"]:first-child': {
				marginRight: 6,
			},
		}),
		title: heading.raw({ rank: 1 }),
		description: {
			textStyle: "paragraph",
			fontSize: "0.9375rem",
		},
		closeTrigger: {
			position: "absolute",
			top: 3,
			right: 3,
			padding: 1,
			layerStyle: "fill.ghost",
			borderRadius: "sm",
			cursor: "pointer",
		},
	},
	variants: {
		size: {
			sm: { content: { width: "400px" } },
			md: { content: { width: "600px" } },
			lg: { content: { width: "800px" } },
		},
		placement: {
			top: { positioner: { alignItems: "flex-start" } },
			middle: { positioner: { alignItems: "center" } },
			bottom: { positioner: { alignItems: "flex-end" } },
		},
		justify: {
			start: { positioner: { justifyContent: "flex-start" } },
			middle: { positioner: { justifyContent: "center" } },
			end: { positioner: { justifyContent: "flex-end" } },
		},
	},
	defaultVariants: {
		size: "md",
		placement: "middle",
		justify: "middle",
	},
});

const { withRootProvider, withContext } = createStyleContext(recipe);

export const RootProvider = withRootProvider(Dialog.RootProvider);
export const Root = withRootProvider(Dialog.Root);
export const Backdrop = withContext(Dialog.Backdrop, "backdrop");
export const CloseTrigger = withContext(Dialog.CloseTrigger, "closeTrigger");
export const Content = withContext(Dialog.Content, "content");
export const Description = withContext(Dialog.Description, "description");
export const Positioner = withContext(Dialog.Positioner, "positioner");
export const Title = withContext(Dialog.Title, "title");
export const Trigger = withContext(Dialog.Trigger, "trigger");

export { DialogContext as Context, type DialogRootBaseProps as BaseProps } from "@ark-ui/react/dialog";
