import { type Column, FlexRender, type RowData, type StockFeatures, type Table } from "@tanstack/react-table";
import { useCallback } from "react";

import { For } from "$/components/ui/atoms";
import * as Builder from "$/components/ui/styled/table";

export interface DataTableProps<T extends RowData> {
	data: Table<StockFeatures, T>;
}

export function DataTable<T extends RowData>({ data }: DataTableProps<T>) {
	const model = data.getRowModel();

	const getColumnStyles = useCallback((column: Column<StockFeatures, T, unknown>) => {
		return { width: `${column.getSize()}px` };
	}, []);

	return (
		<Builder.Root>
			<Builder.Header>
				<For each={data.getHeaderGroups()}>
					{(headerGroup) => (
						<Builder.Row key={headerGroup.id}>
							<For each={headerGroup.headers}>
								{(header) => (
									<Builder.HeaderCell key={header.id} style={getColumnStyles(header.column)}>
										{header.isPlaceholder ? null : <FlexRender header={header} />}
									</Builder.HeaderCell>
								)}
							</For>
						</Builder.Row>
					)}
				</For>
			</Builder.Header>
			<Builder.Body>
				<For each={model.rows}>
					{(row) => (
						<Builder.Row key={row.id}>
							<For each={row.getVisibleCells()}>
								{(cell) => (
									<Builder.Cell key={cell.id}>
										<FlexRender cell={cell} />
									</Builder.Cell>
								)}
							</For>
						</Builder.Row>
					)}
				</For>
			</Builder.Body>
			<Builder.Footer>
				<For each={data.getFooterGroups()}>
					{(footerGroup) => (
						<Builder.Row key={footerGroup.id}>
							<For each={footerGroup.headers}>
								{(header) => (
									<Builder.HeaderCell key={header.id} style={getColumnStyles(header.column)}>
										{header.isPlaceholder ? null : <FlexRender footer={header} />}
									</Builder.HeaderCell>
								)}
							</For>
						</Builder.Row>
					)}
				</For>
			</Builder.Footer>
		</Builder.Root>
	);
}
