"use client";

import { ark } from "@ark-ui/react/factory";

import { styled } from "$:styled-system/jsx";

export const Panel = styled(ark.div, {
	base: {
		colorPalette: "slate",
		layerStyle: "fill.surface",
	},
});
