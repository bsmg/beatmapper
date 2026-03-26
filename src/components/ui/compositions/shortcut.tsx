import { Children, type PropsWithChildren } from "react";

import Mouse from "$/components/icons/mouse";
import { For } from "$/components/ui/atoms";
import { Kbd } from "$/components/ui/styled/kbd";
import { getMetaKeyLabel, getOptionKeyLabel } from "$/utils";

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

function resolveIcon(code: string) {
	const alias = code.toLowerCase() in aliases ? aliases[code.toLowerCase()] : code.toLowerCase();

	switch (code.toLowerCase()) {
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
				<For each={child.toString().trim().split(separator)} interleave={() => separator}>
					{(code) => resolveIcon(code.trim())}
				</For>
			)}
		</For>
	);
}
