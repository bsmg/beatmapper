import type { ReactNode } from "react";

import { useLocalFileQuery } from "$/components/app/hooks/local-file.hooks";
import { convertFileToDataUrl } from "$/helpers/file.helpers";

export interface LocalFileProps {
	filename: string;
	fallback?: ReactNode;
	children: (src: string | undefined, isLoading: boolean) => ReactNode;
}
export function LocalFile({ filename, fallback, children }: LocalFileProps) {
	const { data: url, isLoading } = useLocalFileQuery<string>(filename, {
		queryKey: ["supplier"],
		transformFile: async (file) => await convertFileToDataUrl(file),
	});

	if (!url) return fallback;

	return children(url, isLoading);
}
