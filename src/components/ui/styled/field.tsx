"use client";

import { Field, fieldAnatomy } from "@ark-ui/react/field";

import { sva } from "$:styled-system/css";
import { createStyleContext } from "$:styled-system/jsx";
import { hstack, stack } from "$:styled-system/patterns";

const recipe = sva({
	slots: fieldAnatomy.keys(),
	base: {
		root: stack.raw({
			flex: 1,
		}),
		label: hstack.raw({
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
		}),
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
	},
	defaultVariants: {
		size: "md",
	},
});

const { withProvider, withContext } = createStyleContext(recipe);

export const RootProvider = withProvider(Field.RootProvider, "root");
export const Root = withProvider(Field.Root, "root");
export const ErrorText = withContext(Field.ErrorText, "errorText");
export const HelperText = withContext(Field.HelperText, "helperText");
export const Label = withContext(Field.Label, "label");

export const Input = Field.Input;
export const Select = Field.Select;
export const Textarea = Field.Textarea;

export { FieldContext as Context } from "@ark-ui/react/field";
