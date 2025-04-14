import type { ReactNode } from "react";

import { useLocalFileQuery } from "$/components/app/hooks";
import { convertFileToDataUrl } from "$/helpers/file.helpers";

export interface LocalFileProps {
	filename: string;
	fallback?: ReactNode;
	children: (src: string | undefined, isLoading: boolean) => ReactNode;
}
export function LocalFilePreview({ filename, fallback, children }: LocalFileProps) {
	const { data: url, isFetching } = useLocalFileQuery<string>(filename, {
		queryKeySuffix: "preview",
		transform: async (file) => await convertFileToDataUrl(file),
	});
	if (!url) return fallback;
	return children(url, isFetching);
}
