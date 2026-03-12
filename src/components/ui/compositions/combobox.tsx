import type { Assign } from "@ark-ui/react";
import { useListCollection } from "@ark-ui/react/collection";
import { type ComboboxInputValueChangeDetails, type ComboboxOpenChangeDetails, type ComboboxValueChangeDetails, type ListCollection, useComboboxContext } from "@ark-ui/react/combobox";
import { useFilter } from "@ark-ui/react/locale";
import { Portal } from "@ark-ui/react/portal";
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";
import { type ComponentProps, Fragment, type RefObject, useCallback, useState } from "react";
import { flushSync } from "react-dom";

import { ForListCollection, Show } from "$/components/ui/atoms";
import { useFieldData } from "$/components/ui/hooks/form.hooks";
import * as Builder from "$/components/ui/styled/combobox";
import { css } from "$:styled-system/css";
import { HStack, Text } from "$:styled-system/jsx";
import type { SystemStyleObject } from "$:styled-system/types";
import { Field, type FieldProps } from "./field";

const NEW_OPTION_VALUE = "[[new]]";

export interface ComboboxProps extends Pick<SystemStyleObject, "colorPalette"> {
	label?: string;
	placeholder?: string;
	creatable?: boolean;
	clearable?: boolean;
	portalled?: boolean;
	portalRef?: RefObject<HTMLElement>;
}

const createNewOption = (value: string) => ({ label: value, value: NEW_OPTION_VALUE });
const replaceNewOptionValue = (values: string[], value: string) => values.map((v) => (v === NEW_OPTION_VALUE ? value : v));
const getNewOptionData = (value: string) => value;

function Overlay({ collection, portalled = true, portalRef }: ComboboxProps & { collection: ListCollection }) {
	return (
		<Portal disabled={!portalled} container={portalRef}>
			<Builder.Positioner>
				<Builder.Content>
					<ForListCollection collection={collection}>
						{(item, { value, label }) => (
							<Builder.Item key={value} item={item}>
								<Builder.ItemText>
									<Show when={value !== NEW_OPTION_VALUE} fallback={<Fragment>Create "{label}"</Fragment>}>
										<Show when={label !== value} fallback={label}>
											{label} {label === value ? null : <Text as="small"> ({value}) </Text>}
										</Show>
									</Show>
								</Builder.ItemText>
								<Builder.ItemIndicator>
									<CheckIcon size={16} />
								</Builder.ItemIndicator>
							</Builder.Item>
						)}
					</ForListCollection>
				</Builder.Content>
			</Builder.Positioner>
		</Portal>
	);
}

function Trigger() {
	return (
		<Builder.Trigger>
			<ChevronsUpDownIcon size={16} />
		</Builder.Trigger>
	);
}
function ClearTrigger({ clearable }: ComboboxProps) {
	const api = useComboboxContext();

	if (!api.value.length || !clearable) {
		return null;
	}

	return (
		<Builder.ClearTrigger>
			<XIcon size={16} />
		</Builder.ClearTrigger>
	);
}

export function Combobox({ collection: original, value, onValueChange, label, placeholder, creatable, clearable, colorPalette = "pink", ...rest }: Assign<ComponentProps<typeof Builder.Root>, ComboboxProps & { collection: ListCollection }>) {
	const { contains } = useFilter({ sensitivity: "base" });

	const { collection, filter, upsert, update, remove } = useListCollection({
		initialItems: original.items,
		filter: contains,
		itemToValue: (item) => {
			const value = original.getItemValue(item);
			if (!value) return item;
			return value;
		},
		itemToString: (item) => {
			const label = original.stringifyItem(item);
			if (!label) return item;
			return label;
		},
	});

	const isValidNewOption = useCallback(
		(inputValue: string) => {
			const exactOptionMatch = collection.filter((item) => item.toLowerCase() === inputValue.toLowerCase()).size > 0;

			return !exactOptionMatch && inputValue.trim().length > 0;
		},
		[collection],
	);

	const [selectedValue, setSelectedValue] = useState<string[]>(value ?? []);
	const [inputValue, setInputValue] = useState("");

	const handleInputChange = useCallback(
		({ inputValue, reason }: ComboboxInputValueChangeDetails) => {
			if (reason === "input-change" || reason === "item-select") {
				flushSync(() => {
					if (!creatable) return;

					if (isValidNewOption(inputValue)) {
						upsert(NEW_OPTION_VALUE, createNewOption(inputValue));
					} else if (inputValue.trim().length === 0) {
						remove(NEW_OPTION_VALUE);
					}
				});

				filter(inputValue);
			}
			setInputValue(inputValue);
		},
		[creatable, isValidNewOption, filter, remove, upsert],
	);

	const handleOpenChange = useCallback(
		({ reason }: ComboboxOpenChangeDetails) => {
			if (reason === "trigger-click") {
				filter("");
			}
		},
		[filter],
	);

	const handleValueChange = useCallback(
		(details: ComboboxValueChangeDetails) => {
			const value = replaceNewOptionValue(details.value, inputValue);
			setSelectedValue(value);
			if (creatable && details.value.includes(NEW_OPTION_VALUE)) {
				update(NEW_OPTION_VALUE, getNewOptionData(inputValue));
			}
			if (onValueChange) onValueChange({ ...details, value });
		},
		[creatable, onValueChange, inputValue, update],
	);

	return (
		<Builder.Root {...rest} collection={collection} onInputValueChange={handleInputChange} onOpenChange={handleOpenChange} value={selectedValue} onValueChange={handleValueChange} allowCustomValue>
			{label && <Builder.Label>{label}</Builder.Label>}
			<Builder.Control className={css({ colorPalette })}>
				<Builder.Input placeholder={placeholder} />
				<HStack gap={0.5}>
					<ClearTrigger clearable={clearable} />
					<Trigger />
				</HStack>
			</Builder.Control>
			<Overlay collection={collection} />
		</Builder.Root>
	);
}

export function ComboboxDataField({ label, helperText, ...delegated }: Assign<ComponentProps<typeof Combobox>, FieldProps>) {
	const [field, { id, required, invalid, errorText }] = useFieldData<string | null>(delegated);

	return (
		<Field id={id} label={label} helperText={helperText} required={required} invalid={invalid} errorText={errorText}>
			<Combobox {...delegated} id={id} defaultValue={["test"]} value={field.state.value ? [field.state.value] : []} onValueChange={(details) => field.handleChange(details.value.length ? details.value[0] : null)} />
		</Field>
	);
}
