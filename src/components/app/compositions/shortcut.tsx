import { Children, type PropsWithChildren } from "react";

import { KBD } from "$/components/ui/styled";
import { getMetaKeyLabel, getOptionKeyLabel } from "$/utils";
import { styled } from "$:styled-system/jsx";
import Mouse from "./mouse";

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
export function Shortcut({ separator = "+", children }: Props) {
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
}

const Row = styled("span", {
	base: {
		display: "inline-block",
		lineHeight: 1,
	},
});
