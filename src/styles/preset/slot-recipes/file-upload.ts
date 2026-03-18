import { fileUploadAnatomy } from "@ark-ui/react/file-upload";
import { defineSlotRecipe } from "@pandacss/dev";

export const fileUpload = defineSlotRecipe({
	className: "file-upload",
	slots: fileUploadAnatomy.keys(),
	base: {
		root: {
			display: "flex",
			flexDirection: "column",
			gap: 1,
		},
		label: {
			fontSize: "20px",
			color: "fg.default",
			pointerEvents: "none",
			userSelect: "none",
		},
		dropzone: {
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
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
		},
		trigger: {
			fontSize: "0.875em",
			colorPalette: "slate",
			layerStyle: "fill.subtle",
			borderRadius: "md",
		},
		item: {
			display: "grid",
			gridTemplateColumns: "auto 1fr auto",
			gridTemplateAreas: '"preview name delete" "preview size delete"',
			columnGap: 2,
			rowGap: 1,
			width: "100%",
			padding: 2,
			colorPalette: "slate",
			layerStyle: "fill.surface",
			borderRadius: "sm",
		},
		itemGroup: {
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			gap: 2,
			width: "100%",
		},
		itemPreview: {
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			gridArea: "preview",
		},
		itemPreviewImage: {
			width: "32px",
			objectFit: "cover",
			aspectRatio: "square",
			flexShrink: 0,
		},
		itemName: {
			gridArea: "name",
			whiteSpace: "nowrap",
			textOverflow: "ellipsis",
			overflow: "hidden",
			minWidth: 0,
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
