import { ark } from "@ark-ui/react/factory";
import { type ComponentProps, useMemo } from "react";

import { css, cx } from "$:styled-system/css";
import type { SystemStyleObject } from "$:styled-system/types";
import type { VirtualColorPalette } from "../types";

interface TextProps extends Omit<ComponentProps<typeof ark.span>, "color"> {
	textStyle: SystemStyleObject["textStyle"];
	color?: SystemStyleObject["color"];
	colorPalette?: VirtualColorPalette;
}
export function Text({ textStyle, color, colorPalette, className, ...rest }: TextProps) {
	const classes = useMemo(() => cx(css({ textStyle, colorPalette, color }), className), [textStyle, color, colorPalette, className]);
	return <ark.span {...rest} className={classes} />;
}

interface LayerProps extends Omit<ComponentProps<typeof ark.div>, "color"> {
	layerStyle: SystemStyleObject["layerStyle"];
	color?: SystemStyleObject["color"];
	colorPalette?: VirtualColorPalette;
}
export function Layer({ layerStyle, color, colorPalette, className, ...rest }: LayerProps) {
	const classes = useMemo(() => cx(css({ layerStyle, colorPalette, backgroundColor: color }), className), [layerStyle, color, colorPalette, className]);
	return <ark.div {...rest} className={classes} />;
}
