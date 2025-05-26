import type { FileUploadFileChangeDetails } from "@ark-ui/react/file-upload";
import type { FileMimeType } from "@zag-js/file-utils";
import { FileArchiveIcon, FileAudioIcon, FileIcon, FileImageIcon, FileTextIcon, Trash2Icon } from "lucide-react";
import { type ComponentProps, useCallback, useMemo, useState } from "react";

import { css } from "$:styled-system/css";
import { Button } from "$/components/ui/compositions";
import * as Builder from "../styled/file-upload";
import type { VirtualColorPalette } from "../types";

export function resolveIconForFileType(accept?: FileMimeType) {
	if (accept?.startsWith("image/")) return FileImageIcon;
	if (accept?.startsWith("audio/")) return FileAudioIcon;
	if (accept?.startsWith("text/")) return FileTextIcon;
	if (accept?.startsWith("application/x") || accept === "application.zip") return FileArchiveIcon;
	return FileIcon;
}

interface Props extends ComponentProps<typeof Builder.Root> {
	colorPalette?: VirtualColorPalette;
	deletable?: boolean;
	files?: File[];
}
export function FileUpload({ colorPalette = "pink", deletable = true, files: initialFiles = [], onFileChange, children, ...rest }: Props) {
	const [files, setFiles] = useState<File[]>(initialFiles);

	const handleChange = useCallback(
		(details: FileUploadFileChangeDetails) => {
			if (details.acceptedFiles.length === 0 && details.rejectedFiles.length > 0) return;
			if (onFileChange) onFileChange(details);
			setFiles(details.acceptedFiles);
		},
		[onFileChange],
	);

	const handleClear = useCallback(
		(name: string) => {
			setFiles(files.filter((file) => file.name !== name));
		},
		[files],
	);

	const AcceptIcon = useMemo(() => {
		if (Array.isArray(rest.accept)) return resolveIconForFileType(rest.accept[0]);
		if (typeof rest.accept === "object") return resolveIconForFileType(Object.values(rest.accept)[0][0]);
		return resolveIconForFileType(rest.accept);
	}, [rest.accept]);

	return (
		<Builder.Root {...rest} onFileChange={handleChange}>
			<Builder.Dropzone data-invalid={rest.invalid} data-disabled={rest.disabled} className={css({ colorPalette })}>
				<AcceptIcon />
				<Builder.Label>{children ?? rest.accept?.toString() ?? "Any File"}</Builder.Label>
				<Builder.Trigger asChild>
					<Button size="sm">Open File Picker</Button>
				</Builder.Trigger>
			</Builder.Dropzone>
			{files.length > 0 && (
				<Builder.ItemGroup>
					{files.map((file) => (
						<Builder.Item key={file.name} file={file}>
							<Builder.ItemPreview>
								<FileIcon />
							</Builder.ItemPreview>
							<Builder.ItemName />
							<Builder.ItemSizeText />
							{deletable && (
								<Builder.ItemDeleteTrigger asChild onClick={() => handleClear(file.name)}>
									<Button variant="ghost" size="icon">
										<Trash2Icon />
									</Button>
								</Builder.ItemDeleteTrigger>
							)}
						</Builder.Item>
					))}
				</Builder.ItemGroup>
			)}
			<Builder.HiddenInput />
		</Builder.Root>
	);
}
