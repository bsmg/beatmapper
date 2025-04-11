import { Children, type PropsWithChildren } from "react";

import { getMetaKeyLabel, getOptionKeyLabel } from "$/utils";

import { styled } from "$:styled-system/jsx";
import { wrap } from "$:styled-system/patterns";
import { KBD } from "$/components/ui/styled";
import Mouse from "./Mouse";

function resolveIcon(code: string) {
	const aliases: Record<string, string> = {
		meta: getMetaKeyLabel(),
		option: getOptionKeyLabel(),
		space: "Spacebar",
		up: "↑",
		down: "↓",
		left: "←",
		right: "→",
		escape: "Esc",
		delete: "Del",
	};
	const alias = code.toLowerCase() in aliases ? aliases[code.toLowerCase()] : code.toLowerCase();

	if (code.length === 1) {
		return <KBD key={alias}>{alias}</KBD>;
	}
	switch (code.toLowerCase()) {
		case "up":
		case "down":
		case "left":
		case "right": {
			return <KBD key={alias}>{alias}</KBD>;
		}
		case "option":
		case "meta": {
			return <KBD key={alias}>{alias}</KBD>;
		}
		case "spacebar":
		case "space": {
			return <KBD key={alias}>{alias}</KBD>;
		}
		case "move":
		case "clickleft":
		case "clickright":
		case "clickmiddle":
		case "scroll": {
			return <Mouse key={alias} activeButton={alias} />;
		}
		default: {
			return <KBD key={alias}>{alias}</KBD>;
		}
	}
}

interface Props extends PropsWithChildren {
	separator?: string;
}
export const Shortcut = ({ separator = "+", children }: Props) => {
	return Children.map(children, (child) => {
		if (typeof child !== "string") throw new Error("");
		const keys = child.toString().trim().split(separator);
		return (
			<Row>
				{keys.map((c, i) => {
					if (i !== 0) return [separator, resolveIcon(c.trim())];
					return resolveIcon(c.trim());
				})}
			</Row>
		);
	});
};

const Row = styled("span", {
	base: {
		display: "inline-block",
		lineHeight: 1,
	},
});

export const IconRow = styled("span", {
	base: wrap.raw({
		display: "inline-flex",
		align: "center",
		justify: "center",
		gap: 0.5,
	}),
});

export const Sidenote = styled("div", {
	base: {
		marginTop: "8px",
		fontSize: "14px",
		fontWeight: 300,
		lineHeight: 1.3,
		"& p": {
			marginBlock: "0!",
		},
	},
});

export const OrWrapper = styled("span", {
	base: {
		fontSize: "12px",
		marginBlock: "8px",
		textTransform: "uppercase",
	},
});

export function Or({ children = "or" }) {
	return <OrWrapper>— {children} —</OrWrapper>;
}
