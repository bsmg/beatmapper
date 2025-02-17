import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";
import styled from "styled-components";

import { COLORS } from "$/constants";

import type { FileRoutesByTo } from "$/routeTree.gen";
import BaseLink from "../BaseLink";
import YoutubeEmbed from "../YoutubeEmbed";
import HorizontalRule from "./HorizontalRule";
import { MDXContent } from "./MDXContent";
import { ShortcutItem, ShortcutTable } from "./Shortcut";
import { KeyIcon, Shortcut } from "./ShortcutHelpers";

interface ImageProps extends ComponentProps<"img"> {
	caption?: string;
}

const Image = ({ title, alt, width, caption, ...props }: ImageProps) => (
	<OuterImageWrapper>
		<ImageWrapper>
			<img {...props} alt={alt ?? caption} style={{ width }} />
			{(caption || title) && <ImageCaption>{title ?? caption}</ImageCaption>}
		</ImageWrapper>
	</OuterImageWrapper>
);

const Subtle = styled.span`
	opacity: 0.5;
	font-style: italic;
`;

const sharedComponents: MDXComponents = {
	a: ({ href, ...props }) => <BaseLink {...props} to={href as keyof FileRoutesByTo} />,
	img: Image,
	hr: HorizontalRule,
	Key: ({ size, children }) => <KeyIcon size={size ?? "medium"}>{children}</KeyIcon>,
	Subtle: Subtle,
	Shortcut: ({ size, separator, children }) => (
		<Shortcut separator={separator} size={size ?? "medium"}>
			{children}
		</Shortcut>
	),
	ShortcutItem: ShortcutItem,
	ShortcutTable: ShortcutTable,
	YoutubeEmbed,
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
const MdxWrapper = ({ components, code }: ComponentProps<typeof MDXContent>) => {
	return (
		<DocumentStyles>
			<MDXContent code={code} components={{ ...sharedComponents, ...components }} />
		</DocumentStyles>
	);
};

const OuterImageWrapper = styled.span`
	display: flex;
	justify-content: center;
	margin-left: -8px;
	margin-right: -8px;
`;

const ImageWrapper = styled.span`
	display: inline-block;
	max-width: 100%;
	padding: 8px;
	border-radius: 6px;
	/* border: 1px solid ${COLORS.blueGray[100]}; */
	margin-block: 12px;

	&:hover {
		background: ${COLORS.blueGray[50]};
	}

	img {
		display: block;
		max-width: 100%;
		border-radius: 4px;
	}
`;

const ImageCaption = styled.span`
	text-align: center;
	font-size: 12px;
	line-height: 1.5;
	margin-top: 8px;
`;

const DocumentStyles = styled.div`
	line-height: 1.4;
	font-size: 18px;
	color: ${COLORS.blueGray[900]};

	p:not(:first-of-type) {
		margin-block: 24px;
	}

	a {
		color: ${COLORS.blue[700]};
		text-decoration: none;
		font-weight: bold;

		&:hover {
			color: ${COLORS.blue[500]};
			text-decoration: underline;
		}
	}

	strong {
		font-weight: bold;
	}

	em {
		font-style: italic;
	}

	h1,
	h2,
	h3,
	h4 {
		margin-top: 42px;
		margin-bottom: 16px;
	}

	h1 {
		font-size: 32px;
		font-weight: 700;
	}

	h2 {
		font-size: 28px;
		font-weight: 700;
	}

	h3 {
		font-size: 21px;
		font-weight: 700;
		color: ${COLORS.blueGray[500]};
	}

	h4 {
		font-size: 18px;
		font-weight: 700;
	}

	ul,
	ol {
		margin-block: 20px;
	}

	li {
		margin-left: 20px;
		list-style-type: disc;
		margin-block: 9px;
	}

	code {
		display: inline-block;
		font-family: monospace;
		padding: 2px 5px;
		font-size: 0.9em;
		background: rgba(0, 0, 0, 0.05);
		border-radius: 4px;
	}

	table {
		min-width: 300px;
		margin-bottom: 25px;
	}

	th,
	td {
		padding: 5px 10px;
	}

	th {
		text-align: left;
		font-weight: bold;
		border-bottom: 1px solid ${COLORS.blueGray[300]};
	}

	td {
		font-size: 15px;

		border-bottom: 1px solid ${COLORS.blueGray[100]};
	}

	tr:last-of-type td {
		border-bottom: none;
	}

	blockquote {
		padding: 20px;
		background: hsla(212, 100%, 45%, 0.2);
		border-left: 3px solid ${COLORS.blue[500]};
		border-radius: 3px;
		font-size: 0.9em;
		margin-bottom: 30px;

		*:last-of-type {
			margin-block: 0;
		}
	}
`;

export default MdxWrapper;
