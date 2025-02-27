import { type CSSProperties, Children, type PropsWithChildren, useId } from "react";

import { token } from "$:styled-system/tokens";

import Spacer from "../Spacer";

interface Props extends PropsWithChildren {
	spacing?: CSSProperties["width" | "height"];
}

const SpacedChildren = ({ children, spacing = token.var("spacing.1") }: Props) => {
	const id = useId();
	return Children.map(children, (child) => [child, <Spacer key={id} size={spacing} />]);
};

export default SpacedChildren;
