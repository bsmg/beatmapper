import type { ComponentProps, HTMLAttributeAnchorTarget } from "react";
import { Link as RRLink, type To } from "react-router-dom";

function shouldUseAnchor(to: To) {
	const href = to.toString();
	return !!(href.match(/^https?:\/\//i) || href.match(/^mailto:/) || href.match(/^#/));
}

export interface Props extends Omit<ComponentProps<typeof RRLink>, "to"> {
	to?: string;
	forceAnchor?: boolean;
}

const BaseLink = ({ to = "", children, forceAnchor, ...delegated }: Props) => {
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
		<RRLink to={to} {...delegated}>
			{children}
		</RRLink>
	);
};

export default BaseLink;
