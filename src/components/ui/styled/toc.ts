import { ark } from "@ark-ui/react/factory";
import { Toc } from "@ark-ui/react/toc";

import { createStyleContext } from "$:styled-system/jsx";
import { toc } from "$:styled-system/recipes";

const { withProvider, withContext } = createStyleContext(toc);

export const Root = withProvider(Toc.Root, "root");
export const Title = withContext(Toc.Title, "title");
export const List = withContext(Toc.List, "list");
export const Item = withContext(Toc.Item, "item");
export const Link = withContext(Toc.Link, "link");
export const Indicator = withContext(Toc.Indicator, "indicator");
export const Actions = withContext(ark.div, "actions");
export const Nav = withContext(Toc.Nav, "nav");

export { TocContent as Content, TocContext as Context } from "@ark-ui/react/toc";
