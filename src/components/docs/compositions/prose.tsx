import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";

import { styled } from "$:styled-system/jsx";
import { Shortcut } from "$/components/app/compositions";
import * as ContentComponents from "$/components/docs/content";
import { MDXContent } from "$/components/ui/atoms";
import { Text } from "$/components/ui/compositions";
import { KBD } from "$/components/ui/styled";
import Mouse from "../../app/compositions/mouse";
import DocsMedia from "./media";

const Subtle = styled("span", {
	base: {
		fontStyle: "italic",
		color: "fg.subtle",
	},
});

const sharedComponents: MDXComponents = {
	a: ({ ...props }) => (
		<Text asChild textStyle={"link"}>
			<a {...props} />
		</Text>
	),
	img: ({ alt, title, ...rest }) => (
		<DocsMedia caption={alt ?? title}>
			<img {...rest} alt={alt} title={title} />
		</DocsMedia>
	),
	Key: ({ children }) => <KBD>{children}</KBD>,
	Mouse: Mouse,
	Subtle: Subtle,
	Shortcut: ({ separator, children }) => <Shortcut separator={separator}>{children}</Shortcut>,
	YoutubeEmbed: ({ title, width = 560, height = 315, src }) => {
		return <iframe width={width} height={height} src={src} title={title} frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />;
	},
	...ContentComponents,
};

/**
 * MDX translates .md documents into React components. By default, it uses sensible defaults:
 *
 * ### Hello -> <h3>Hello</h3>
 *
 * In simple cases, I just need to style these HTML tags. For other cases, I might want to supply a custom component.
 * For example, I want to wrap images in a custom <Image> component, so that I can style it accordingly.
 *
 * This component handles both of those concerns.
 */
function DocsProse({ components, code }: ComponentProps<typeof MDXContent>) {
	return (
		<DocumentStyles>
			<MDXContent code={code} components={{ ...sharedComponents, ...components }} />
		</DocumentStyles>
	);
}

const DocumentStyles = styled("div", {
	base: {
		lineHeight: 1.4,
		fontSize: "18px",
		color: "fg.muted",
		maxWidth: { base: "calc(100vw - 120px)!", md: "calc(100vw - 420px)!" },

		"& p:not(:first-of-type)": {
			marginBlock: "24px",
		},
		"& a": {
			textStyle: "link",
			fontWeight: 700,
			colorPalette: "blue",
			color: "colorPalette.700",
		},
		"& strong": {
			fontWeight: "bold",
		},
		"& em": {
			fontStyle: "italic",
		},
		"& h1, & h2, & h3, & h4": {
			marginTop: "36px",
			marginBottom: "16px",
			color: "fg.default",
			fontWeight: 700,
		},
		"& h1": {
			fontSize: "32px",
		},
		"& h2": {
			fontSize: "28px",
		},
		"& h3": {
			fontSize: "21px",
		},
		"& h4": {
			fontSize: "18px",
		},
		"& ul, & ol": {
			marginBlock: "20px",
		},
		"& li": {
			marginLeft: "20px",
			listStyleType: "disc",
			marginBlock: "8px",
		},
		"& code": {
			display: "inline-block",
			fontFamily: "monospace",
			paddingBlock: "1px",
			paddingInline: "6px",
			fontSize: "0.875em",
			maxWidth: "100%",
			wordBreak: "break-all",
			wordWrap: "break-word",
			backgroundColor: "bg.muted",
			borderRadius: "sm",
		},
		"& table": {
			minWidth: "300px",
			marginBlock: "25px",
		},
		"& th, & td": {
			paddingBlock: "5px",
			paddingInline: "10px",
		},
		"& th": {
			textAlign: "left",
			fontWeight: "bold",
			borderBottomWidth: "sm",
			borderColor: "border.default",
		},
		"& td": {
			fontSize: "15px",
			borderBottomWidth: "sm",
			borderColor: "border.muted",
		},
		"& tr:last-of-type td": {
			borderBottom: "none",
		},
		"& blockquote": {
			padding: "20px",
			backgroundColor: "bg.muted",
			borderLeftWidth: "4px",
			borderColor: "border.muted",
			borderRadius: "md",
			fontSize: "0.9em",
			marginBlock: { base: "30px", _lastOfType: 0 },
		},
	},
});

export default DocsProse;
