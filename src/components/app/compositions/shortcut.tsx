import { Children, type PropsWithChildren } from "react";

import { For } from "$/components/ui/atoms";
import { Kbd } from "$/components/ui/styled/kbd";
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
		return <Kbd key={alias}>{alias}</Kbd>;
	}
	switch (code.toLowerCase()) {
		case "up":
		case "down":
		case "left":
		case "right": {
			return <Kbd key={alias}>{alias}</Kbd>;
		}
		case "option":
		case "meta": {
			return <Kbd key={alias}>{alias}</Kbd>;
		}
		case "spacebar":
		case "space": {
			return <Kbd key={alias}>{alias}</Kbd>;
		}
		case "move":
		case "clickleft":
		case "clickright":
		case "clickmiddle":
		case "scroll": {
			return <Mouse key={alias} activeButton={alias} />;
		}
		default: {
			return <Kbd key={alias}>{alias}</Kbd>;
		}
	}
}

interface Props extends PropsWithChildren {
	separator?: string;
	children: string;
}
export function Shortcut({ separator = "+", children }: Props) {
	return (
		<For each={Children.toArray(children)}>
			{(child) => (
				<Row>
					<For each={child.toString().trim().split(separator)} interleave={() => separator}>
						{(code) => resolveIcon(code.trim())}
					</For>
				</Row>
			)}
		</For>
	);
}

const Row = styled("span", {
	base: {
		display: "inline-block",
		lineHeight: 1,
	},
});
