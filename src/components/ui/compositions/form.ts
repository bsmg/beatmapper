import { ark } from "@ark-ui/react/factory";
import { createFormHook } from "@tanstack/react-form";

import { fieldContext, formContext } from "$/components/ui/hooks/form.hooks";
import { styled } from "$:styled-system/jsx";
import { stack, wrap } from "$:styled-system/patterns";
import { SubmitButton } from "./button";
import { CheckboxDataField } from "./checkbox";
import { ColorPickerDataField } from "./color-picker";
import { ComboboxDataField } from "./combobox";
import { FileUploadDataField } from "./file-upload";
import { InputDataField, NumberInputDataField } from "./input";
import { SelectDataField } from "./native-select";
import { RadioButtonGroupDataField } from "./radio-button-group";
import { RadioGroupDataField } from "./radio-group";
import { SliderDataField } from "./slider";
import { SwitchDataField } from "./switch";
import { TagsInputDataField } from "./tags-input";
import { TextareaDataField } from "./textarea";

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
	fieldContext: fieldContext,
	formContext: formContext,
	fieldComponents: {
		Input: InputDataField,
		NumberInput: NumberInputDataField,
		Select: SelectDataField,
		Textarea: TextareaDataField,
		Checkbox: CheckboxDataField,
		ColorPicker: ColorPickerDataField,
		Combobox: ComboboxDataField,
		FileUpload: FileUploadDataField,
		RadioGroup: RadioGroupDataField,
		RadioButtonGroup: RadioButtonGroupDataField,
		Slider: SliderDataField,
		Switch: SwitchDataField,
		TagsInput: TagsInputDataField,
	},
	formComponents: {
		Root: styled(ark.div, {
			base: stack.raw({
				gap: 4,
			}),
			variants: {
				size: {
					sm: { gap: 2 },
					md: { gap: 4 },
				},
			},
			defaultVariants: {
				size: "md",
			},
		}),
		Row: styled(ark.div, {
			base: wrap.raw({
				gap: 2,
				"& > *": { flex: 1 },
			}),
		}),
		Submit: SubmitButton,
	},
});
