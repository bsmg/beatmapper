"use client";

import { ark } from "@ark-ui/react/factory";

import { sva } from "$:styled-system/css";
import { createStyleContext } from "$:styled-system/jsx";

const recipe = sva({
	slots: ["root", "body", "cell", "footer", "head", "header", "row", "caption"],
	base: {
		root: {
			width: "100%",
		},
		head: {
			textAlign: "left",
			fontSize: "13px",
			fontWeight: 300,
			color: "fg.muted",
			padding: 1,
		},
		header: {
			borderBottomWidth: { base: "sm" },
			borderColor: { base: "border.default" },
		},
		footer: {
			borderTopWidth: { base: "sm" },
			borderColor: { base: "border.default" },
		},
		row: {
			borderTopWidth: { base: "sm", _first: 0 },
			borderBottomWidth: { base: "sm", _last: 0 },
			borderColor: { base: "border.muted" },
		},
		cell: {
			padding: 1,
		},
	},
});

const { withProvider, withContext } = createStyleContext(recipe);

export const Root = withProvider(ark.table, "root");
export const Body = withContext(ark.tbody, "body");
export const Caption = withContext(ark.caption, "caption");
export const Cell = withContext(ark.td, "cell");
export const Footer = withContext(ark.tfoot, "footer");
export const HeaderCell = withContext(ark.th, "head");
export const Header = withContext(ark.thead, "header");
export const Row = withContext(ark.tr, "row");
