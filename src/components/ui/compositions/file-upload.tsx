import { useFileUpload } from "@ark-ui/react/file-upload";
import type { FileMimeType } from "@zag-js/file-utils";
import { FileArchiveIcon, FileAudioIcon, FileIcon, FileImageIcon, FileTextIcon, Trash2Icon } from "lucide-react";
import { type ComponentProps, useMemo } from "react";

import { APP_TOASTER } from "$/components/app/constants";
import { Button } from "$/components/ui/compositions";
import { toPolymorphic, useRender } from "$/components/ui/hooks/use-render";
import * as Builder from "$/components/ui/styled/file-upload";
import { css } from "$:styled-system/css";
import type { SystemStyleObject } from "$:styled-system/types";

function resolveIconForFileType(accept?: FileMimeType) {
	if (accept?.startsWith("image/")) return FileImageIcon;
	if (accept?.startsWith("audio/")) return FileAudioIcon;
	if (accept?.startsWith("text/")) return FileTextIcon;
	if (accept?.startsWith("application/x-") || accept === "application/zip") return FileArchiveIcon;
	return FileIcon;
}

interface Props extends ComponentProps<typeof Builder.Root>, Pick<SystemStyleObject, "colorPalette"> {
	deletable?: boolean;
}
export function FileUpload({ colorPalette = "pink", deletable = true, onFileReject, children, ...rest }: Props) {
	const ItemDeleteTrigger = useRender(
		Builder.ItemDeleteTrigger,
		toPolymorphic(Button, (Element, delegated) => <Element {...delegated} variant="ghost" size="icon" />),
	);

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
			<Builder.Dropzone className={css({ colorPalette })}>
				<AcceptIcon />
				<Builder.Label>{children ?? rest.accept?.toString() ?? "Any File"}</Builder.Label>
				<Button variant="subtle" size="sm">
					Open File Picker
				</Button>
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
									<ItemDeleteTrigger>
										<Trash2Icon />
									</ItemDeleteTrigger>
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
