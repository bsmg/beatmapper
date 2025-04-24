import { type UseQueryOptions, useQuery } from "@tanstack/react-query";

import { filestore } from "$/setup";

export function useLocalFileQuery<T = File>(filename: string, { queryKeySuffix: suffix, ...rest }: Omit<UseQueryOptions<T>, "queryKey" | "queryFn"> & { queryKeySuffix: string; transform?: (file: File) => Promise<T> | T }) {
	return useQuery<T>({
		...rest,
		queryKey: [`filestore.${filename}`].map((key) => `${key}.${suffix}`),
		queryFn: async () => {
			const blob = await filestore.loadFile<Blob>(filename);
			let file = blob as unknown as File;
			if (blob instanceof Blob) file = new File([blob], filename, { type: blob.type });
			return (await rest.transform?.(file)) ?? (file as T);
		},
	});
}
