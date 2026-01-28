"use client";

import { Field } from "@ark-ui/react/field";

import { createStyleContext } from "$:styled-system/jsx";
import { field } from "$:styled-system/recipes";

const { withProvider, withContext } = createStyleContext(field);

export const RootProvider = withProvider(Field.RootProvider, "root");
export const Root = withProvider(Field.Root, "root");
export const ErrorText = withContext(Field.ErrorText, "errorText");
export const HelperText = withContext(Field.HelperText, "helperText");
export const Label = withContext(Field.Label, "label");

export const Input = Field.Input;
export const Select = Field.Select;
export const Textarea = Field.Textarea;

export { FieldContext as Context } from "@ark-ui/react/field";
