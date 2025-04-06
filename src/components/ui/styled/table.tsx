"use client";
import { ark } from "@ark-ui/react/factory";

import { sva } from "$:styled-system/css";
import { createStyleContext } from "../../utils/create-style-context";

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
			paddingBlock: 1,
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
			borderBlockWidth: { base: "sm", _first: 0, _last: 0 },
			borderColor: { base: "border.muted" },
		},
		cell: {
			paddingBlock: 1,
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
