import type { Assign } from "@ark-ui/react";
import { ark } from "@ark-ui/react/factory";
import { type ComponentProps, useMemo } from "react";

import type { VirtualColorPalette } from "$/styles/types";
import { css, cx } from "$:styled-system/css";
import type { SystemStyleObject } from "$:styled-system/types";

interface TextProps extends Assign<Omit<ComponentProps<typeof ark.span>, "color">, Pick<SystemStyleObject, "fontFamily" | "fontSize" | "fontWeight" | "lineHeight">> {
	textStyle?: SystemStyleObject["textStyle"];
	color?: SystemStyleObject["color"];
	colorPalette?: VirtualColorPalette;
}
export function Text({ textStyle = "paragraph", color, colorPalette, fontFamily, fontSize, fontWeight, lineHeight, className, ...rest }: TextProps) {
	const classes = useMemo(() => cx(css({ textStyle, colorPalette, color, fontFamily, fontSize, fontWeight, lineHeight }), className), [textStyle, color, colorPalette, fontFamily, fontSize, fontWeight, lineHeight, className]);
	return <ark.span {...rest} className={classes} />;
}

interface LayerProps extends Omit<ComponentProps<typeof ark.div>, "color"> {
	layerStyle?: SystemStyleObject["layerStyle"];
	color?: SystemStyleObject["color"];
	colorPalette?: VirtualColorPalette;
}
export function Layer({ layerStyle = "fill.surface", color, colorPalette, className, ...rest }: LayerProps) {
	const classes = useMemo(() => cx(css({ layerStyle, colorPalette, backgroundColor: color }), className), [layerStyle, color, colorPalette, className]);
	return <ark.div {...rest} className={classes} />;
}
