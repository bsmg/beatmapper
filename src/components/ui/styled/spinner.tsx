"use client";

import { ark } from "@ark-ui/react/factory";

import { cva } from "$:styled-system/css";
import { styled } from "$:styled-system/jsx";

const recipe = cva({
	base: {
		display: "inline-block",
		color: "currentcolor",
		_icon: { animation: "spin" },
	},
});

export const Spinner = styled(ark.div, recipe);
