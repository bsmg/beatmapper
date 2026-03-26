import { createAnatomy } from "@zag-js/anatomy";
import type { Scope } from "@zag-js/core";

export function createMachineAnatomy<Part extends string>(name: string, options: { parts: [...Part[]] }) {
	const anatomy = createAnatomy(name).parts(...options.parts);

	const parts = anatomy.build();

	const getId = <K extends keyof typeof parts>(ctx: Scope, part: K) => {
		return (ctx.ids?.[part] ?? part === "root") ? `${name}:${ctx.id}` : `${name}:${ctx.id}:${part}`;
	};
	const getElement = <K extends keyof typeof parts>(ctx: Scope, part: K) => {
		return ctx.getById(getId(ctx, part));
	};
	const getProps = <K extends keyof typeof parts>(ctx: Scope, part: K) => {
		return { ...parts[part].attrs, id: getId(ctx, part) };
	};

	return { anatomy, parts, getId, getElement, getProps };
}

export type AsEventObject<T> = { [K in keyof T]: T[K] extends [infer Payload] ? (Payload extends object ? { type: K } & Payload : { type: K } & Record<string, Payload>) : { type: K } }[keyof T];
