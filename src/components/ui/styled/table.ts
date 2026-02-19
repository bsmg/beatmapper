"use client";

import { ark } from "@ark-ui/react/factory";

import { createStyleContext } from "$:styled-system/jsx";
import { table } from "$:styled-system/recipes";

const { withProvider, withContext } = createStyleContext(table);

export const Root = withProvider(ark.table, "root");
export const Body = withContext(ark.tbody, "body");
export const Caption = withContext(ark.caption, "caption");
export const Cell = withContext(ark.td, "cell");
export const Footer = withContext(ark.tfoot, "footer");
export const HeaderCell = withContext(ark.th, "head");
export const Header = withContext(ark.thead, "header");
export const Row = withContext(ark.tr, "row");
