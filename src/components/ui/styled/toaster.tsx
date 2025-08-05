"use client";

import { Toast, toastAnatomy } from "@ark-ui/react/toast";

import { sva } from "$:styled-system/css";
import { createStyleContext } from "$:styled-system/jsx";
import { stack } from "$:styled-system/patterns";

const recipe = sva({
	slots: toastAnatomy.keys(),
	base: {
		root: stack.raw({
			position: "relative",
			width: "400px",
			padding: 2,
			textStyle: "paragraph",
			wordWrap: "break-word",
			colorPalette: {
				base: "slate",
				// @ts-ignore
				'&[data-type="success"]': "green",
				'&[data-type="error"]': "red",
				'&[data-type="info"]': "blue",
			},
			layerStyle: "fill.surface",
			scale: "var(--scale)",
			translate: "var(--x) var(--y) 0",
			willChange: "translate, opacity, scale",
			zIndex: "var(--z-index)",
			transitionDuration: "fast",
			transitionProperty: "translate, scale, opacity, height",
			transitionTimingFunction: "default",
			"& > *:nth-child(2)": { marginRight: 6 },
		}),
		closeTrigger: {
			position: "absolute",
			top: 1,
			right: 1,
			padding: 1,
			layerStyle: "fill.ghost",
			borderRadius: "sm",
			cursor: "pointer",
		},
	},
});

const { withProvider, withContext } = createStyleContext(recipe);

export const Root = withProvider(Toast.Root, "root");
export const ActionTrigger = withContext(Toast.ActionTrigger, "actionTrigger");
export const CloseTrigger = withContext(Toast.CloseTrigger, "closeTrigger");
export const Description = withContext(Toast.Description, "description");
export const Title = withContext(Toast.Title, "title");

export { createToaster, ToastContext as Context, type ToastContextProps as ContextProps, Toaster, type ToasterProps } from "@ark-ui/react/toast";
