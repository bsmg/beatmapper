"use client";

import { ark } from "@ark-ui/react/factory";

import { createStyleContext } from "$:styled-system/jsx";
import { stat } from "$:styled-system/recipes";

const { withProvider, withContext } = createStyleContext(stat);

export const Root = withProvider(ark.div, "root");
export const Label = withContext(ark.h4, "label");
export const ValueText = withContext(ark.span, "valueText");
