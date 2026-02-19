import { flexRender, type Header, type RowData, type Table } from "@tanstack/react-table";
import { useCallback } from "react";

import { For } from "$/components/ui/atoms";
import * as Builder from "$/components/ui/styled/table";

export interface DataTableProps<T extends RowData> {
	data: Table<T>;
}

export function DataTable<T extends RowData>({ data }: DataTableProps<T>) {
	const model = data.getRowModel();

	const getHeaderCellStyles = useCallback((header: Header<T, unknown>) => {
		return { width: `${header.getSize()}px` };
	}, []);

	return (
		<Builder.Root>
			<Builder.Header>
				<For each={data.getHeaderGroups()}>
					{(headerGroup) => (
						<Builder.Row key={headerGroup.id}>
							<For each={headerGroup.headers}>
								{(header) => (
									<Builder.HeaderCell key={header.id} style={getHeaderCellStyles(header)}>
										{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
							<For each={row.getVisibleCells()}>{(cell) => <Builder.Cell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Builder.Cell>}</For>
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
									<Builder.HeaderCell key={header.id} style={getHeaderCellStyles(header)}>
										{header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext())}
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
