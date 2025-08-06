import { flexRender, type RowData, type Table } from "@tanstack/react-table";

import * as Builder from "$/components/ui/styled/table";

export interface DataTableProps<T extends RowData> {
	table: Table<T>;
}
export function DataTable<T extends RowData>({ table: data }: DataTableProps<T>) {
	const headerGroups = data.getHeaderGroups();
	const rows = data.getRowModel().rows;
	const footerGroups = data.getFooterGroups();

	return (
		<Builder.Root>
			<Builder.Header>
				{headerGroups.map((headerGroup) => (
					<Builder.Row key={headerGroup.id}>
						{headerGroup.headers.map((header) => (
							<Builder.HeaderCell key={header.id} style={{ width: `${header.getSize()}px` }}>
								{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
							</Builder.HeaderCell>
						))}
					</Builder.Row>
				))}
			</Builder.Header>
			<Builder.Body>
				{rows.map((row) => (
					<Builder.Row key={row.id}>
						{row.getVisibleCells().map((cell) => (
							<Builder.Cell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Builder.Cell>
						))}
					</Builder.Row>
				))}
			</Builder.Body>
			<Builder.Footer>
				{footerGroups.map((footerGroup) => (
					<Builder.Row key={footerGroup.id}>
						{footerGroup.headers.map((header) => (
							<Builder.HeaderCell key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext())}</Builder.HeaderCell>
						))}
					</Builder.Row>
				))}
			</Builder.Footer>
		</Builder.Root>
	);
}
