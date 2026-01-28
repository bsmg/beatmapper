"use client";

import { Switch } from "@ark-ui/react/switch";

import { createStyleContext } from "$:styled-system/jsx";
import { switchRecipe } from "$:styled-system/recipes";

const { withProvider, withContext } = createStyleContext(switchRecipe);

export const RootProvider = withProvider(Switch.RootProvider, "root");
export const Root = withProvider(Switch.Root, "root");
export const Control = withContext(Switch.Control, "control");
export const Label = withContext(Switch.Label, "label");
export const Thumb = withContext(Switch.Thumb, "thumb");

export { SwitchContext as Context, SwitchHiddenInput as HiddenInput } from "@ark-ui/react/switch";
