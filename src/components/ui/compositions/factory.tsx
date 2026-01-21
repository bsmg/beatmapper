import type { Assign } from "@ark-ui/react";
import { ark } from "@ark-ui/react/factory";
import { type ComponentProps, useMemo } from "react";

import { css, cx } from "$:styled-system/css";
import type { SystemStyleObject } from "$:styled-system/types";

interface TextProps extends Assign<ComponentProps<typeof ark.span>, Pick<SystemStyleObject, "textStyle" | "color" | "fontFamily" | "fontSize" | "fontWeight" | "lineHeight">> {}
export function Text({ textStyle = "paragraph", color, fontFamily, fontSize, fontWeight, lineHeight, className, ...rest }: TextProps) {
	const classes = useMemo(() => cx(css({ textStyle, color, fontFamily, fontSize, fontWeight, lineHeight }), className), [textStyle, color, fontFamily, fontSize, fontWeight, lineHeight, className]);
	return <ark.span {...rest} className={classes} />;
}

interface LayerProps extends Assign<ComponentProps<typeof ark.div>, Pick<SystemStyleObject, "layerStyle" | "color">> {}
export function Layer({ layerStyle = "fill.surface", color, className, ...rest }: LayerProps) {
	const classes = useMemo(() => cx(css({ layerStyle, backgroundColor: color }), className), [layerStyle, color, className]);
	return <ark.div {...rest} className={classes} />;
}
