declare module "csstype" {
	export interface Properties {
		[index: `--${string}`]: string | number | undefined;
	}
}
