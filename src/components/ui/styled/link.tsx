"use client";

import { ark } from "@ark-ui/react/factory";

import { cva } from "$:styled-system/css";
import { styled } from "$:styled-system/jsx";

export const recipe = cva({
	base: {
		textStyle: "link",
		cursor: "pointer",
		color: "fg.default",
	},
});

export const Link = styled(ark.a, recipe);
