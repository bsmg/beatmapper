import { Children, type PropsWithChildren } from "react";

import { UNIT } from "$/constants";

import Spacer from "../Spacer";

interface Props extends PropsWithChildren {
	spacing?: number;
}

const SpacedChildren = ({ children, spacing = UNIT }: Props) => {
	return Children.map(children, (child, index) => [child, <Spacer key={index} size={spacing} />]);
};

export default SpacedChildren;
