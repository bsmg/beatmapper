import { type UseQueryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useBeatmapFilestore } from "$/components/context";

interface UseLocalFileQueryOptions<T> extends Omit<UseQueryOptions<T>, "queryFn"> {
	transformFile?: (file: File) => Promise<T> | T;
}
export function useLocalFileQuery<T = File>(filename: string, { ...rest }: UseLocalFileQueryOptions<T>) {
	const filestore = useBeatmapFilestore();

	return useQuery<T>({
		...rest,
		queryKey: [...rest.queryKey, filename],
		queryFn: async () => {
			const blob = await filestore.loadFile<Blob>(filename);
			let file = blob as unknown as File;
			if (!(blob instanceof File)) file = new File([blob], "name" in blob && typeof blob.name === "string" ? blob.name : filename, { type: blob.type });
			return (await rest.transformFile?.(file)) ?? (file as T);
		},
	});
}

export function useLocalFileMutation(filename: string, options: { onSuccess: () => void }) {
	const client = useQueryClient();
	const filestore = useBeatmapFilestore();

	return useMutation({
		mutationFn: async (file: File) => {
			filestore.saveFile(filename, file);
		},
		onSuccess: () => {
			options.onSuccess();
			client.invalidateQueries({ predicate: (query) => query.queryKey.some((x) => x === filename) });
		},
	});
}
