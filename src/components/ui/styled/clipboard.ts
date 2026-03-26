"use client";

import { Clipboard } from "@ark-ui/react/clipboard";

import { createStyleContext } from "$:styled-system/jsx";
import { clipboard } from "$:styled-system/recipes";

const { withProvider, withContext } = createStyleContext(clipboard);

export const RootProvider = withProvider(Clipboard.RootProvider, "root");
export const Root = withProvider(Clipboard.Root, "root");
export const Control = withContext(Clipboard.Control, "control");
export const Trigger = withContext(Clipboard.Trigger, "trigger");
export const Indicator = withContext(Clipboard.Indicator, "indicator");
export const Input = withContext(Clipboard.Input, "input");
export const Label = withContext(Clipboard.Label, "label");

export { ClipboardContext as Context } from "@ark-ui/react/clipboard";
