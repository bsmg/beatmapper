import { useEffect, useRef, useState } from "react";

import { getFile } from "$/services/file.service";

function getFileReaderMethodName(readAs: "dataUrl" | "arrayBuffer" | "text") {
	if (readAs === "dataUrl") return "readAsDataURL" as const;
	if (readAs === "arrayBuffer") return "readAsArrayBuffer" as const;
	if (readAs === "text") return "readAsText" as const;
	throw new Error("Unsupported method.");
}

// Create a simple cache for locally-retrieved files, so that files don't have to be re-retrieved every time from indexeddb.
// To avoid stale cache issues, we will never simply return what's in the cache.
// We always check in indexedDb. But, while we're checking, we'll serve up what's in the cache.
// TODO: If I ensure that filenames are unique, maybe I don't have to worry about stale caches?
const cache: Record<string, string | ArrayBuffer | null> = {};

export function useLocallyStoredFile<T extends string | ArrayBuffer>(filename: string, readAs: "dataUrl" | "arrayBuffer" | "text" = "dataUrl") {
	const [output, setOutput] = useState<T | null>(null);
	const [loading, setLoading] = useState(true);

	const fileReader = useRef<FileReader>();

	useEffect(() => {
		if (!filename) {
			return;
		}
		const file = getFile<Blob>(filename);

		file.then((file) => {
			if (!file) throw Error("Not found.");
			fileReader.current = new FileReader();

			fileReader.current.onload = function () {
				setOutput(this.result as T);
				setLoading(false);

				cache[filename] = this.result as T;
			};

			const methodNameToCall = getFileReaderMethodName(readAs);

			try {
				fileReader.current[methodNameToCall](file);
			} catch (err) {
				console.error("Could not call method", methodNameToCall, "on", file);
				throw err;
			}
		});

		return () => {
			if (fileReader.current) {
				fileReader.current.abort();
			}
		};
	}, [filename, readAs]);

	useEffect(() => {
		if (!filename) {
			return;
		}
		setLoading(true);
	}, [filename]);

	const returnedOutput = output || (cache[filename] as T | undefined);

	return [returnedOutput, loading] as const;
}
