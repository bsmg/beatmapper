import type { router } from "$/routes";
import type { Merge } from "@react-spring/three";
import { Link, type LinkProps } from "@tanstack/react-router";
import type { ComponentProps, HTMLAttributeAnchorTarget } from "react";

function shouldUseAnchor(to: string) {
	const href = to.toString();
	return !!(href.match(/^https?:\/\//i) || href.match(/^mailto:/) || href.match(/^#/));
}

export interface BaseLinkProps extends Merge<LinkProps<"a", typeof router>, ComponentProps<"a">> {
	forceAnchor?: boolean;
}

const BaseLink = ({ to, children, forceAnchor, ...delegated }: BaseLinkProps) => {
	if (!to) return <span {...delegated}>{children}</span>;
	if (shouldUseAnchor(to) || forceAnchor) {
		let target: HTMLAttributeAnchorTarget | undefined;

		if (to.toString()[0] !== "#") {
			target = "_blank";
		}

		return (
			<a href={to.toString()} target={target} rel="noopener noreferrer" {...delegated}>
				{children}
			</a>
		);
	}
	return (
		<Link to={to} {...delegated}>
			{children}
		</Link>
	);
};

export default BaseLink;
