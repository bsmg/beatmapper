import { PlusIcon } from "lucide-react";
import type { PropsWithChildren, ReactNode } from "react";

import { For } from "$/components/ui/atoms";
import { Shortcut } from "$/components/ui/compositions";
import { styled, Text } from "$:styled-system/jsx";
import { grid, stack, wrap } from "$:styled-system/patterns";

const IconRow = styled("span", {
	base: wrap.raw({
		display: "inline-flex",
		align: "center",
		justify: "center",
		gap: 0.5,
	}),
});

const OrWrapper = styled("span", {
	base: {
		fontSize: "12px",
		marginBlock: "8px",
		textTransform: "uppercase",
	},
});

function Or({ children = "or" }) {
	return <OrWrapper>— {children} —</OrWrapper>;
}

function Row({ row }: { row: string[] }): ReactNode;
function Row({ separator }: { separator: string | undefined }): ReactNode;
function Row({ row, separator }: { row?: string[]; separator?: string | undefined }): ReactNode {
	if (!row || separator) {
		return (
			<IconRow>
				<Or>{separator}</Or>
			</IconRow>
		);
	}
	return (
		<IconRow>
			<For each={row} interleave={(index) => <PlusIcon key={`${index}-${"plus"}`} size={16} />}>
				{(code, index) => (
					<Shortcut key={`${index}-${code}`} separator={code === "+" ? " " : "+"}>
						{code}
					</Shortcut>
				)}
			</For>
		</IconRow>
	);
}

const Sidenote = styled("div", {
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

interface Props extends PropsWithChildren {
	title: string;
	keys: string[][];
	separator?: string;
}
export function ShortcutItem({ title, keys, separator, children }: Props) {
	return (
		<ShortcutWrapper>
			<Keys>
				<For each={keys} interleave={(index) => <Row key={`${index}-${"separator"}`} separator={separator} />}>
					{(row, index) => <Row key={`${index}-${"row"}`} row={row} />}
				</For>
			</Keys>
			<Children>
				<Text textStyle={"paragraph"} color={"fg.default"} fontSize={"18px"} fontWeight={700}>
					{title}
				</Text>
				<Sidenote>{children}</Sidenote>
			</Children>
		</ShortcutWrapper>
	);
}

export function ShortcutTable({ children }: PropsWithChildren) {
	return <TableWrapper>{children}</TableWrapper>;
}

const TableWrapper = styled("div", {
	base: grid.raw({
		columns: { base: 1, xl: 2 },
		columnSpan: "1fr",
		gap: 0.5,
		padding: 0.5,
		borderWidth: "sm",
		borderColor: "border.muted",
		borderRadius: "sm",
	}),
});

const ShortcutWrapper = styled("div", {
	base: stack.raw({
		direction: { base: "column", lg: "row" },
		align: { base: "start", lg: "center" },
		padding: 1,
		borderWidth: "sm",
		borderColor: "border.muted",
		borderRadius: "sm",
	}),
});

const Keys = styled("div", {
	base: stack.raw({
		width: { base: "100%", lg: "150px" },
		align: "center",
		gap: 0,
		padding: 1,
	}),
});

const Children = styled("div", {
	base: stack.raw({
		width: "100%",
		align: { base: "center", lg: "start" },
		padding: 1,
		flex: 1,
		gap: 0,
	}),
});
