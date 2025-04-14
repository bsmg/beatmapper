import { Collapsible, collapsibleAnatomy } from "@ark-ui/react/collapsible";

import { sva } from "$:styled-system/css";
import { createStyleContext } from "../utils/create-style-context";

const recipe = sva({
	slots: [...collapsibleAnatomy.keys()],
});

const { withProvider, withContext } = createStyleContext(recipe);

export const Root = withProvider(Collapsible.Root, "root");
export const Trigger = withContext(Collapsible.Trigger, "trigger");
export const Content = withContext(Collapsible.Content, "content");

export { CollapsibleContext as Context } from "@ark-ui/react/collapsible";
