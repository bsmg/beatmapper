import { definePreset } from "@pandacss/dev";

// biome-ignore lint/suspicious/noEmptyInterface: wip
interface PresetOptions {}
export default function preset({ ...rest }: PresetOptions) {
	return definePreset({
		name: "beatmapper",
	});
}
