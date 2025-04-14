"use client";
import { sva } from "$:styled-system/css";
import { center, grid, stack, vstack } from "$:styled-system/patterns";
import { FileUpload, fileUploadAnatomy } from "@ark-ui/react/file-upload";
import { createStyleContext } from "../utils/create-style-context";

const recipe = sva({
	slots: [...fileUploadAnatomy.keys()],
	base: {
		root: stack.raw({
			align: "center",
			gap: 1,
		}),
		label: {
			fontSize: "20px",
			color: "fg.default",
			pointerEvents: "none",
			userSelect: "none",
		},
		dropzone: center.raw({
			flexDirection: "column",
			gap: 2,
			width: "100%",
			minWidth: "150px",
			minHeight: "100px",
			padding: 4,
			layerStyle: "fill.ghost",
			borderWidth: "md",
			borderStyle: "dashed",
			borderColor: { base: "border.default", _dragging: "colorPalette.500", _invalid: "fg.error" },
			borderRadius: "sm",
			cursor: "pointer",
		}),
		trigger: {
			fontSize: "0.875em",
			colorPalette: "slate",
			layerStyle: "fill.subtle",
			borderRadius: "md",
		},
		item: grid.raw({
			gridTemplateColumns: "auto 1fr auto",
			gridTemplateAreas: '"preview name delete" "preview size delete"',
			columnGap: 2,
			rowGap: 1,
			width: "100%",
			padding: 2,
			colorPalette: "slate",
			layerStyle: "fill.surface",
			borderRadius: "sm",
		}),
		itemGroup: vstack.raw({
			gap: 2,
			width: "100%",
		}),
		itemPreview: center.raw({
			gridArea: "preview",
		}),
		itemName: {
			gridArea: "name",
			whiteSpace: "nowrap",
			textOverflow: "ellipsis",
		},
		itemSizeText: {
			gridArea: "size",
			fontSize: "small",
			color: "fg.muted",
		},
		itemDeleteTrigger: {
			alignSelf: "flex-start",
			gridArea: "delete",
		},
	},
});

const { withProvider, withContext } = createStyleContext(recipe);

export const RootProvider = withProvider(FileUpload.RootProvider, "root");
export const Root = withProvider(FileUpload.Root, "root");
export const Dropzone = withContext(FileUpload.Dropzone, "dropzone");
export const ItemDeleteTrigger = withContext(FileUpload.ItemDeleteTrigger, "itemDeleteTrigger");
export const ItemGroup = withContext(FileUpload.ItemGroup, "itemGroup");
export const ItemName = withContext(FileUpload.ItemName, "itemName");
export const ItemPreviewImage = withContext(FileUpload.ItemPreviewImage, "itemPreviewImage");
export const ItemPreview = withContext(FileUpload.ItemPreview, "itemPreview");
export const Item = withContext(FileUpload.Item, "item");
export const ItemSizeText = withContext(FileUpload.ItemSizeText, "itemSizeText");
export const Label = withContext(FileUpload.Label, "label");
export const Trigger = withContext(FileUpload.Trigger, "trigger");

export {
	FileUploadContext as Context,
	FileUploadHiddenInput as HiddenInput,
} from "@ark-ui/react/file-upload";
