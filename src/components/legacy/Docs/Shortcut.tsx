import { type PropsWithChildren, useMemo } from "react";

import { styled } from "$:styled-system/jsx";
import { grid, stack } from "$:styled-system/patterns";
import { Text } from "$/components/ui/compositions";
import { PlusIcon } from "lucide-react";
import { IconRow, Or, Shortcut, Sidenote } from "./ShortcutHelpers";

function Row({ row, separator }: { row?: string[]; separator?: string }) {
	if (!row || separator) {
		return (
			<IconRow>
				<Or>{separator}</Or>
			</IconRow>
		);
	}
	return (
		<IconRow>
			{row.map((code, index) => {
				const separator = code === "+" ? " " : "+";
				if (index > 0)
					return [
						<PlusIcon key={`${index}-${"plus"}`} size={16} />,
						<Shortcut key={`${index}-${code}`} separator={separator}>
							{code}
						</Shortcut>,
					];
				return (
					<Shortcut key={`${index}-${code}`} separator={separator}>
						{code}
					</Shortcut>
				);
			})}
		</IconRow>
	);
}

interface Props extends PropsWithChildren {
	title: string;
	keys: string[][];
	separator?: string;
}

export const ShortcutItem = ({ title, keys, separator, children }: Props) => {
	const rows = useMemo(
		() =>
			keys.map((row, index) => {
				if (index > 0) return [<Row key={`${index}-${"separator"}`} separator={separator} />, <Row key={`${index}-${"row"}`} row={row} />];
				return <Row key={`${index}-${"row"}`} row={row} />;
			}),
		[keys, separator],
	);
	return (
		<ShortcutWrapper>
			<Keys>{rows}</Keys>
			<Children>
				<Text color={"fg.default"} fontSize={"18px"} fontWeight={700}>
					{title}
				</Text>
				<Sidenote>{children}</Sidenote>
			</Children>
		</ShortcutWrapper>
	);
};

export const ShortcutTable = ({ children }: PropsWithChildren) => {
	return <TableWrapper>{children}</TableWrapper>;
};

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
