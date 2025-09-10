import { useFileUpload } from "@ark-ui/react/file-upload";
import type { FileMimeType } from "@zag-js/file-utils";
import { FileArchiveIcon, FileAudioIcon, FileIcon, FileImageIcon, FileTextIcon, Trash2Icon } from "lucide-react";
import { type ComponentProps, useMemo } from "react";

import { APP_TOASTER } from "$/components/app/constants";
import { Button } from "$/components/ui/compositions";
import * as Builder from "$/components/ui/styled/file-upload";
import type { VirtualColorPalette } from "$/styles/types";
import { css } from "$:styled-system/css";

function resolveIconForFileType(accept?: FileMimeType) {
	if (accept?.startsWith("image/")) return FileImageIcon;
	if (accept?.startsWith("audio/")) return FileAudioIcon;
	if (accept?.startsWith("text/")) return FileTextIcon;
	if (accept?.startsWith("application/x-") || accept === "application/zip") return FileArchiveIcon;
	return FileIcon;
}

interface Props extends ComponentProps<typeof Builder.Root> {
	colorPalette?: VirtualColorPalette;
	deletable?: boolean;
}
export function FileUpload({ colorPalette = "pink", deletable = true, onFileReject, children, ...rest }: Props) {
	const ctx = useFileUpload({
		...rest,
		onFileReject: (details) => {
			if (onFileReject) onFileReject(details);
			for (const { file, errors } of details.files) {
				for (const error of errors) {
					let message = "";
					switch (error) {
						case "FILE_INVALID_TYPE": {
							message = `Invalid file type: Expected "${rest.accept?.toString()}" but received "${file.type}"`;
							break;
						}
						default: {
							message = `Unhandled error: "${error}"`;
							break;
						}
					}
					return APP_TOASTER.error({ id: error, description: message });
				}
			}
		},
	});

	const AcceptIcon = useMemo(() => {
		if (Array.isArray(rest.accept)) return resolveIconForFileType(rest.accept[0]);
		if (typeof rest.accept === "object") return resolveIconForFileType(Object.values(rest.accept)[0][0]);
		return resolveIconForFileType(rest.accept);
	}, [rest.accept]);

	return (
		<Builder.RootProvider value={ctx}>
			<Builder.Dropzone data-invalid={rest.invalid} data-disabled={rest.disabled} className={css({ colorPalette })}>
				<AcceptIcon />
				<Builder.Label>{children ?? rest.accept?.toString() ?? "Any File"}</Builder.Label>
				<Builder.Trigger asChild>
					<Button size="sm">Open File Picker</Button>
				</Builder.Trigger>
			</Builder.Dropzone>
			<Builder.ItemGroup>
				<Builder.Context>
					{(ctx) =>
						ctx.acceptedFiles.map((file) => (
							<Builder.Item key={file.name} file={file}>
								<Builder.ItemPreview>
									<FileIcon />
								</Builder.ItemPreview>
								<Builder.ItemName />
								<Builder.ItemSizeText />
								{deletable && (
									<Builder.ItemDeleteTrigger asChild>
										<Button variant="ghost" size="icon">
											<Trash2Icon />
										</Button>
									</Builder.ItemDeleteTrigger>
								)}
							</Builder.Item>
						))
					}
				</Builder.Context>
			</Builder.ItemGroup>
			<Builder.HiddenInput />
		</Builder.RootProvider>
	);
}
