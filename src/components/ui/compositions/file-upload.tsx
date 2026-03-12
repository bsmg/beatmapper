import type { Assign } from "@ark-ui/react";
import { type UseFileUploadProps, useFileUploadContext } from "@ark-ui/react/file-upload";
import type { FileMimeType } from "@zag-js/file-utils";
import { FileArchiveIcon, FileAudioIcon, FileIcon, FileImageIcon, FileTextIcon, type LucideProps, TrashIcon } from "lucide-react";
import { type ComponentProps, forwardRef, useEffect, useMemo } from "react";

import { useSetupContext } from "$/components/context";
import { For } from "$/components/ui/atoms";
import { useFieldData } from "$/components/ui/hooks/form.hooks";
import { toPolymorphic, useRender } from "$/components/ui/hooks/use-render";
import * as Builder from "$/components/ui/styled/file-upload";
import { css } from "$:styled-system/css";
import type { SystemStyleObject } from "$:styled-system/types";
import { Button } from "./button";
import { Field, type FieldProps } from "./field";

function resolveIconForFileType(accept?: FileMimeType) {
	if (accept?.startsWith("image/")) return FileImageIcon;
	if (accept?.startsWith("audio/")) return FileAudioIcon;
	if (accept?.startsWith("text/")) return FileTextIcon;
	if (accept?.startsWith("application/x-") || accept === "application/zip") return FileArchiveIcon;
	return FileIcon;
}

export interface FileUploadProps extends UseFileUploadProps, Pick<SystemStyleObject, "colorPalette"> {
	label?: string;
	deletable?: boolean;
}

function Indicator({ accept, ...rest }: Assign<LucideProps, FileUploadProps>) {
	const Icon = useMemo(() => {
		let type: string | undefined;

		if (Array.isArray(accept)) {
			type = accept[0];
		} else if (typeof accept === "object" && accept !== null) {
			type = Object.values(accept)[0][0];
		} else {
			type = accept;
		}

		return resolveIconForFileType(type);
	}, [accept]);

	return <Icon {...rest} />;
}

function List({ accept, deletable }: FileUploadProps) {
	const { toaster } = useSetupContext();

	const api = useFileUploadContext();

	const ItemDeleteTrigger = useRender(
		Builder.ItemDeleteTrigger,
		toPolymorphic(Button, (Element, delegated) => <Element {...delegated} variant="ghost" size="icon" />),
	);

	useEffect(() => {
		for (const { file, errors } of api.rejectedFiles) {
			let message = "";
			switch (errors[0]) {
				case "FILE_INVALID_TYPE": {
					message = `Invalid file type: Expected "${accept?.toString()}" but received "${file.type}"`;
					break;
				}
				default: {
					message = `Unhandled error: "${errors[0]}"`;
					break;
				}
			}
			return toaster?.error({ id: errors[0], description: message });
		}
	}, [toaster, api.rejectedFiles, accept]);

	return (
		<Builder.ItemGroup>
			<For each={api.acceptedFiles}>
				{(file) => (
					<Builder.Item key={file.name} file={file}>
						<Builder.ItemPreview>
							<Indicator accept={accept} />
						</Builder.ItemPreview>
						<Builder.ItemName />
						<Builder.ItemSizeText />
						{deletable && (
							<ItemDeleteTrigger>
								<TrashIcon />
							</ItemDeleteTrigger>
						)}
					</Builder.Item>
				)}
			</For>
		</Builder.ItemGroup>
	);
}

function Dropzone({ accept, label, colorPalette }: FileUploadProps) {
	return (
		<Builder.Dropzone className={css({ colorPalette })}>
			<Indicator accept={accept} />
			<Builder.Label>{label ?? accept?.toString() ?? "Any File"}</Builder.Label>
			<Button variant="subtle" size="sm">
				Open File Picker
			</Button>
		</Builder.Dropzone>
	);
}

export const FileUpload = forwardRef<HTMLInputElement, Assign<ComponentProps<typeof Builder.Root>, FileUploadProps>>(function FileUpload({ label, deletable = true, colorPalette = "pink", ...rest }, ref) {
	return (
		<Builder.Root {...rest}>
			<Dropzone accept={rest.accept} label={label} colorPalette={colorPalette} />
			<List {...rest} deletable={deletable} />
			<Builder.HiddenInput ref={ref} />
		</Builder.Root>
	);
});

export function FileUploadDataField({ label, helperText, acceptText, ...delegated }: Assign<ComponentProps<typeof FileUpload>, FieldProps & { acceptText?: string }>) {
	const [field, { id, required, invalid, errorText }] = useFieldData<File[]>(delegated);

	return (
		<Field id={id} cosmetic label={label} helperText={helperText} required={required} invalid={invalid} errorText={errorText}>
			<FileUpload {...delegated} label={acceptText} acceptedFiles={field.state.value} onFileChange={(details) => field.handleChange(details.acceptedFiles)} />
		</Field>
	);
}
