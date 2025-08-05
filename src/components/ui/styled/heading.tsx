"use client";

import { ark } from "@ark-ui/react/factory";

import { cva } from "$:styled-system/css";
import { styled } from "$:styled-system/jsx";

export const recipe = cva({
	base: {
		textStyle: "heading",
		color: "fg.muted",
	},
	variants: {
		rank: {
			1: { fontSize: "1.75em" },
			2: { fontSize: "1.5em" },
			3: { fontSize: "1em" },
			4: { fontSize: "0.75em" },
			5: { color: "red.500" },
			6: { color: "red.500" },
		},
	},
});

export const Heading = styled(ark.h4, recipe);
