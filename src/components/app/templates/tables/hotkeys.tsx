import { type CommandDefinition, useHotkeyRegistrations } from "@ark-ui/react/hotkeys";
import { createColumnHelper, type StockFeatures, stockFeatures, useTable } from "@tanstack/react-table";
import { HelpCircleIcon } from "lucide-react";

import { DataTable, Shortcut, Tooltip } from "$/components/ui/compositions";
import { HStack } from "$:styled-system/jsx";

const helper = createColumnHelper<StockFeatures, CommandDefinition>();

function AppHotkeys() {
	const hotkeys = useHotkeyRegistrations();

	const table = useTable({
		features: stockFeatures,
		data: hotkeys,
		columns: helper.columns([
			helper.accessor((data) => data.hotkey, {
				id: "hotkey",
				cell: (ctx) => <Shortcut>{ctx.getValue()}</Shortcut>,
			}),
			helper.accessor((data) => data, {
				id: "name",
				cell: (ctx) => {
					const { id, category, label, description } = ctx.getValue();
					return (
						<HStack>
							{category ? `${category}: ${label ?? id}` : (label ?? id)}
							{description && (
								<Tooltip render={() => description}>
									<HelpCircleIcon size={16} />
								</Tooltip>
							)}
						</HStack>
					);
				},
			}),
			helper.accessor((data) => data.scopes?.toString(), {
				id: "scopes",
				cell: (ctx) => ctx.getValue(),
			}),
		]),
	});

	return <DataTable data={table} />;
}

export default AppHotkeys;
