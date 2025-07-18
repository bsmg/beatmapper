export function resolveExtension(type: string, filename?: string) {
	function getOverrideExtensionForFilename(filename?: string) {
		if (!filename) return;
		const match = filename.match(/^\.[\w]+$/);
		if (!match) return;
		return match[0].slice(1);
	}
	const override = getOverrideExtensionForFilename(filename);

	switch (type) {
		case "application/json": {
			return override ?? "json";
		}
		case "audio/ogg": {
			return override ?? "ogg";
		}
		case "audio/wav": {
			return override ?? "wav";
		}
		case "image/jpeg": {
			return override ?? "jpg";
		}
		case "image/png": {
			return override ?? "png";
		}
		default: {
			throw new Error(`Unrecognized media type: ${type}`);
		}
	}
}

export function convertFileToArrayBuffer<T extends File | Blob | MediaSource>(file: T) {
	return new Promise<ArrayBuffer>((resolve, reject) => {
		const fileReader = new FileReader();
		fileReader.onload = function () {
			resolve(this.result as ArrayBuffer);
		};
		fileReader.onerror = (err) => {
			reject(err);
		};
		fileReader.readAsArrayBuffer(file as Blob);
	});
}
export function convertFileToDataUrl<T extends File | Blob | MediaSource>(file: T) {
	return new Promise<string>((resolve, reject) => {
		const fileReader = new FileReader();
		fileReader.onload = function () {
			resolve(this.result as string);
		};
		fileReader.onerror = (err) => {
			reject(err);
		};
		fileReader.readAsDataURL(file as Blob);
	});
}
