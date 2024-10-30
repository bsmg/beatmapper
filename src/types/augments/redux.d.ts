declare module "redux-storage-decorator-debounce" {
	import type { StorageEngine } from "redux-storage";
	export default function (engine: StorageEngine, ms: number): StorageEngine;
}
