import { type PropsWithChildren, useMemo } from "react";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";

import { IconRow, Or, Plus, Shortcut, Sidenote } from "./ShortcutHelpers";

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
						<Plus key={`${index}-${"plus"}`} />,
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
				{title && <span>{title}</span>}
				<Sidenote>{children}</Sidenote>
			</Children>
		</ShortcutWrapper>
	);
};

export const ShortcutTable = ({ children }: PropsWithChildren) => {
	return <TableWrapper>{children}</TableWrapper>;
};

const TableWrapper = styled.div`
	display: grid;
	grid-template-columns: 1fr;
	grid-column-gap: 3px;
	grid-row-gap: 3px;
	padding: 3px;
	border: 1px solid ${token.var("colors.slate.200")};
	border-radius: 4px;

	@media (min-width: 1400px) {
		grid-template-columns: 1fr 1fr;
	}
`;

const ShortcutWrapper = styled.div`
	display: flex;
	padding: 10px;
	border: 1px solid ${token.var("colors.slate.100")};
	border-radius: 2px;
`;

const Keys = styled.div`
	padding: 10px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	width: 150px;
`;

const Children = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	padding-left: 20px;
`;
