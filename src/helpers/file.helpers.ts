import { basename } from "@std/path/basename";

import { defaultCoverArtPath } from "$/assets";

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

export async function createPlaceholderImageFile() {
	return await fetch(defaultCoverArtPath)
		.then((response) => response.blob())
		.then((blob) => {
			return new File([blob], basename(defaultCoverArtPath), { type: "image/jpeg" });
		});
}

export async function remuxImageToSquare(file: File, minSize = 256) {
	const bitmap = await createImageBitmap(file);

	const sourceSize = Math.min(bitmap.width, bitmap.height);

	if (bitmap.width === bitmap.height && sourceSize >= minSize) {
		return file;
	}

	const targetSize = Math.max(sourceSize, minSize);

	const canvas = new OffscreenCanvas(targetSize, targetSize);
	const ctx = canvas.getContext("2d");

	const x = (bitmap.width - sourceSize) / 2;
	const y = (bitmap.height - sourceSize) / 2;

	ctx?.drawImage(bitmap, x, y, sourceSize, sourceSize, 0, 0, targetSize, targetSize);

	const blob = await canvas.convertToBlob({ type: file.type });

	return new File([blob], file.name, { type: file.type });
}
