export function convertFileToArrayBuffer(file: Blob) {
	return new Promise<ArrayBuffer>((resolve, reject) => {
		const fileReader = new FileReader();
		fileReader.onload = function (e) {
			resolve(this.result as ArrayBuffer);
		};
		fileReader.onerror = (err) => {
			reject(err);
		};
		fileReader.readAsArrayBuffer(file);
	});
}
export function convertFileToDataUrl(file: Blob) {
	return new Promise<string>((resolve, reject) => {
		const fileReader = new FileReader();
		fileReader.onload = function (e) {
			resolve(this.result as string);
		};
		fileReader.onerror = (err) => {
			reject(err);
		};
		fileReader.readAsDataURL(file);
	});
}
