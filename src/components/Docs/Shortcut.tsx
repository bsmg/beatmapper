import { type PropsWithChildren, useMemo } from "react";
import styled from "styled-components";

import { COLORS } from "$/constants";

import Mouse from "./Mouse";
import { IconRow, KeyIcon, MetaKey, OptionKey, Or, Plus, Sidenote } from "./ShortcutHelpers";

function resolveIcon(code: string) {
	if (code.length === 1) {
		return (
			<KeyIcon key={code} type="square">
				{code}
			</KeyIcon>
		);
	}
	switch (code) {
		case "META": {
			return (
				<KeyIcon key={code} type="slightly-wide">
					<MetaKey />
				</KeyIcon>
			);
		}
		case "OPTION": {
			return (
				<KeyIcon key={code} type="slightly-wide">
					<OptionKey />
				</KeyIcon>
			);
		}
		case "Space": {
			return (
				<KeyIcon key={code} type="spacebar">
					{code}
				</KeyIcon>
			);
		}
		case "MOVE":
		case "LEFT_CLICK":
		case "MIDDLE_CLICK":
		case "RIGHT_CLICK":
		case "SCROLL": {
			return <Mouse key={code} activeButton={code} />;
		}
		default: {
			return (
				<KeyIcon key={code} type="slightly-wide">
					{code}
				</KeyIcon>
			);
		}
	}
}

function Icon({ code }: { code: string }) {
	if (Array.isArray(code)) return [code.map((x) => resolveIcon(x))];
	return resolveIcon(code);
}
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
				if (index > 0) return [<Plus key={`${index}-${"plus"}`} />, <Icon key={`${index}-${code}`} code={code} />];
				return <Icon key={`${index}-${code}`} code={code} />;
			})}
		</IconRow>
	);
}

interface Props extends PropsWithChildren {
	title: string;
	keys: string[][];
	separator?: string;
}

export const Shortcut = ({ title, keys, separator, children }: Props) => {
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
	border: 1px solid ${COLORS.blueGray[200]};
	border-radius: 4px;

	@media (min-width: 1400px) {
		grid-template-columns: 1fr 1fr;
	}
`;

const ShortcutWrapper = styled.div`
	display: flex;
	padding: 10px;
	border: 1px solid ${COLORS.blueGray[100]};
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
