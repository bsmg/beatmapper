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
