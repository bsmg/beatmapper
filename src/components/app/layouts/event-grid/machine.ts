import { createMachine, type MachineSchema, type Params, type Service } from "@zag-js/core";
import { normalizeProps } from "@zag-js/react";
import type { IWrapBaseObject } from "bsmap";
import type { CSSProperties } from "react";

import { type AsEventObject, createMachineAnatomy } from "$/components/helpers";
import type { UseMousePositionOverElementOptions } from "$/components/hooks/use-mouse-position-over-element";
import { type App, EventEditMode, type IBackgroundBox, type ISelectionBoxInBeats } from "$/types";
import { clamp, normalize as interpolate, isMetaKeyPressed, range, roundToNearest } from "$/utils";

const { getElement, getProps } = createMachineAnatomy("event-grid", {
	parts: ["root", "timeline", "prefix", "content", "trigger", "track", "event", "backgroundBox", "selectionBox", "cursor", "pointer"],
});

export interface EventGridSchema extends MachineSchema {
	props: {
		mode: EventEditMode;
		disabled?: boolean;
		loading?: boolean;
		startBeat: number;
		numOfBeatsToShow: number;
		snapTo?: number;
		eventWidth: number;
		trackHeight?: number;
		onTrackHeightChange?: (details: { height: number }) => void;
		pointer?: number;
		onPointerChange?: (details: { beat: number }) => void;
		onSelectionCommit?: (details: { selectionBoxInBeats: ISelectionBoxInBeats }) => void;
	};
	context: {
		pointer: number;
		dimensions: { width: number; height: number };
		trackHeight: number;
		selectionBox: DOMRect | null;
	};
	refs: {
		mouseDownAt: { x: number; y: number; button: number } | null;
		hoveredTrackId: number | null;
		norm: number;
	};
	computed: {
		beatNums: number[];
	};
	state: "idle" | "placing" | "selecting";
	guard: "isPlaceMode" | "isSelectMode" | "isLeftClick";
	action: "setMouseDownAt" | "updatePointer" | "updateSelection" | "commitSelection";
	effect: "trackDimensions";
	event: AsEventObject<{
		"trigger/down": [{ x: number; y: number; button: number }];
		"trigger/up": [{ ctrlKey: boolean }];
		"trigger/move": [{ x: number; y: number }];
		"track/enter": [{ trackId: number }];
		"track/leave": [{ trackId: number }];
	}>;
}

function convertMousePositionToBeatNum(x: number, params: Pick<Params<EventGridSchema>, "prop" | "context" | "computed">, snapTo?: number) {
	const { width } = params.context.get("dimensions");

	let positionInBeats = interpolate(x, 0, width, 0, params.computed("beatNums").length);

	if (typeof snapTo === "number") {
		positionInBeats = roundToNearest(positionInBeats, snapTo);
	}

	return positionInBeats + params.prop("startBeat");
}

export const machine = createMachine<EventGridSchema>({
	initialState: () => "idle",
	props: ({ props }) => {
		return {
			mode: EventEditMode.PLACE,
			startBeat: 0,
			numOfBeatsToShow: 0,
			eventWidth: props.eventWidth ?? 8,
			...props,
		};
	},
	refs: () => {
		return {
			mouseDownAt: null,
			hoveredTrackId: null,
			norm: 0,
		};
	},
	context: ({ bindable, prop }) => {
		return {
			pointer: bindable<number>(() => ({
				value: prop("pointer"),
				onChange: (value) => prop("onPointerChange")?.({ beat: value }),
			})),
			dimensions: bindable<{ width: number; height: number }>(() => ({
				defaultValue: { width: 0, height: 0 },
			})),
			trackHeight: bindable<number>(() => ({
				value: prop("trackHeight"),
				onChange: (value) => prop("onTrackHeightChange")?.({ height: value }),
			})),
			selectionBox: bindable<DOMRect | null>(() => ({
				defaultValue: null,
			})),
		};
	},
	computed: {
		beatNums: ({ prop }) => {
			const startBeat = prop("startBeat");
			const numOfBeatsToShow = prop("numOfBeatsToShow");
			return Array.from(range(Math.floor(startBeat), Math.ceil(startBeat + numOfBeatsToShow - 1)));
		},
	},
	states: {
		idle: {
			on: {
				"trigger/down": [
					{ guard: "isPlaceMode", target: "placing", actions: ["setMouseDownAt"] },
					{ guard: "isSelectMode", target: "selecting", actions: ["setMouseDownAt", "updateSelection"] },
				],
				"trigger/move": [{ actions: ["updatePointer"] }],
			},
		},
		placing: {
			on: {
				"trigger/up": { target: "idle", actions: ["setMouseDownAt"] },
				"trigger/move": { actions: ["updatePointer"] },
			},
		},
		selecting: {
			on: {
				"trigger/up": { target: "idle", actions: ["setMouseDownAt", "commitSelection"] },
				"trigger/move": { actions: ["updateSelection"] },
			},
		},
	},
	effects: ["trackDimensions"],
	implementations: {
		guards: {
			isPlaceMode: ({ prop }) => prop("mode") === EventEditMode.PLACE,
			isSelectMode: ({ prop }) => prop("mode") === EventEditMode.SELECT,
			isLeftClick: ({ event }) => event.button === 0,
		},
		effects: {
			trackDimensions: ({ scope, context }) => {
				const el = getElement(scope, "content");
				if (!el) return;

				const observer = new ResizeObserver(([entry]) => {
					const { width, height } = entry.contentRect;
					context.set("dimensions", { width, height });
				});

				observer.observe(el);
				return () => observer.disconnect();
			},
		},
		actions: {
			setMouseDownAt: ({ refs, event }) => {
				refs.set("mouseDownAt", event.type === "trigger/down" ? { x: event.x, y: event.y, button: event.button } : null);
			},
			updatePointer: ({ prop, context, computed, event }) => {
				context.set("pointer", (current) => (event.type === "trigger/move" ? convertMousePositionToBeatNum(event.x, { prop, context, computed }, prop("snapTo")) : current));
			},
			updateSelection: ({ refs, context, event }) => {
				const origin = refs.get("mouseDownAt");

				if (!origin || origin.button !== 0) {
					return context.set("selectionBox", null);
				}

				const rect = new DOMRect(Math.min(origin.x, event.x), Math.min(origin.y, event.y), Math.abs(origin.x - event.x), Math.abs(origin.y - event.y));
				context.set("selectionBox", rect);
			},
			commitSelection: ({ prop, context, computed, event }) => {
				const box = context.get("selectionBox");

				if (!box) return;

				const selectionBoxInBeats: ISelectionBoxInBeats = {
					startTrackIndex: Math.floor(box.top / context.get("trackHeight")),
					endTrackIndex: Math.floor(box.bottom / context.get("trackHeight")),
					startBeat: convertMousePositionToBeatNum(box.left, { prop, context, computed }),
					endBeat: convertMousePositionToBeatNum(box.right, { prop, context, computed }),
					withPrevious: event.ctrlKey,
				};

				prop("onSelectionCommit")?.({ selectionBoxInBeats });

				context.set("selectionBox", null);
			},
		},
	},
});

export interface IEventPlacementActions<T extends IWrapBaseObject> {
	onCreate: (time: number, norm: number) => App.IWrapEditorObject<T>;
	onPlace: (data: App.IWrapEditorObject<T>, isBulk?: boolean) => void;
	onDelete: (data: App.IWrapEditorObject<T>, isBulk?: boolean) => void;
	onSelect: (data: App.IWrapEditorObject<T>) => void;
	onDeselect: (data: App.IWrapEditorObject<T>) => void;
	onPick: (data: App.IWrapEditorObject<T>) => void;
	onWheel: (data: App.IWrapEditorObject<T>, delta: number) => void;
}

export function connect({ scope, send, prop, context, refs, computed }: Service<EventGridSchema>, normalize = normalizeProps) {
	const isPlaceMode = prop("mode") === EventEditMode.PLACE;

	const disabled = !!prop("disabled");
	const startBeat = prop("startBeat");
	const numOfBeatsToShow = prop("numOfBeatsToShow");
	const endBeat = startBeat + numOfBeatsToShow;
	const snapTo = prop("snapTo") ?? 1;
	const trackHeight = prop("trackHeight");
	const eventWidth = prop("eventWidth");
	const beatNums = computed("beatNums");
	const activeButton = refs.get("mouseDownAt")?.button ?? null;

	const isHoveringTrack = (trackId: number) => refs.get("hoveredTrackId") === trackId;

	return {
		startBeat,
		numOfBeatsToShow,
		endBeat,
		snapDivision: Math.max(1 / snapTo, 1),
		pointer: context.get("pointer"),
		selectionBox: context.get("selectionBox"),
		dimensions: context.get("dimensions"),
		beatNums,

		getRootProps: () => {
			return normalize.element({
				...getProps(scope, "root"),
				"aria-busy": prop("loading"),
			});
		},
		getTimelineProps: () => {
			return normalize.element({
				...getProps(scope, "timeline"),
			});
		},
		getTriggerProps: () => {
			return normalize.element({
				...getProps(scope, "trigger"),
				onPointerDown: (event) => {
					const rect = event.currentTarget.getBoundingClientRect();
					return send({ type: "trigger/down", x: event.clientX - rect.left, y: event.clientY - rect.top, button: event.button });
				},
				onPointerUp: (event) => {
					return send({ type: "trigger/up", ctrlKey: isMetaKeyPressed(event.nativeEvent) });
				},
				onPointerMove: (event) => {
					return send({ type: "trigger/move", x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY });
				},
			});
		},
		getPrefixProps: () => {
			return normalize.element({
				...getProps(scope, "prefix"),
				"aria-disabled": disabled,
				style: { height: trackHeight },
			});
		},
		getContentProps: () => {
			return normalize.element({
				...getProps(scope, "content"),
			});
		},
		getTrackProps: <T extends App.IWrapEditorObject<IWrapBaseObject>>(trackId: number, actions: IEventPlacementActions<T>) => {
			return normalize.element({
				...getProps(scope, "track"),
				"aria-disabled": disabled,
				style: { height: trackHeight },
				onContextMenu: (event) => event.preventDefault(),
				onPointerDown: (event) => {
					refs.set("norm", event.nativeEvent.offsetY / event.currentTarget.clientHeight);
					refs.set("hoveredTrackId", trackId);

					if (isPlaceMode && event.button === 0) {
						const data = actions.onCreate(context.get("pointer"), refs.get("norm"));
						return actions.onPlace?.(data, false);
					}
				},
				onPointerUp: () => {
					refs.set("norm", 0);
					refs.set("hoveredTrackId", null);
				},
				onPointerMove: () => {
					if (isPlaceMode && activeButton === 0 && isHoveringTrack(trackId)) {
						const data = actions.onCreate(context.get("pointer"), refs.get("norm"));
						return actions.onPlace?.(data, true);
					}
				},
				onPointerOver: () => {
					return send({ type: "track/enter", trackId });
				},
				onPointerOut: () => {
					return send({ type: "track/leave", trackId });
				},
			});
		},
		getEventProps: <T extends App.IWrapEditorObject<IWrapBaseObject>>(data: T, actions: IEventPlacementActions<T>, style?: CSSProperties) => {
			const dimensions = context.get("dimensions");
			const offset = interpolate(data.time, startBeat, endBeat, 0, dimensions.width);
			const centeredOffset = offset - eventWidth / 2;

			return normalize.element({
				...getProps(scope, "event"),
				style: { ...style, transform: `translateX(${centeredOffset}px)` },
				onContextMenu: (e) => e.preventDefault(),
				onPointerDown: (ev) => {
					switch (ev.button) {
						case 0: {
							return data.selected ? actions.onDeselect?.(data) : actions.onSelect?.(data);
						}
						case 1: {
							ev.preventDefault();
							return actions.onPick?.(data);
						}
						case 2: {
							return actions.onDelete?.(data, false);
						}
					}
				},
				onPointerOver: () => {
					if (activeButton === 2) {
						actions.onDelete?.(data, true);
					}
				},
				onWheel: (event: React.WheelEvent) => {
					if (event.altKey) {
						const delta = event.deltaY > 0 ? -1 : 1;
						actions.onWheel?.(data, delta);
					}
				},
			});
		},
		getBackgroundBoxProps: ({ time, duration, startState, endState }: IBackgroundBox) => {
			const startOffset = interpolate(time, startBeat, endBeat, 0, 100);
			const width = interpolate(duration ?? 0, 0, endBeat - startBeat, 0, 100);

			const toPercent = (value: number) => clamp(1 - value, 0, 1) * 100;

			return normalize.element({
				...getProps(scope, "backgroundBox"),
				style: {
					left: `${startOffset}%`,
					width: `${width}%`,
					background: `linear-gradient(to right, color-mix(in srgb, ${startState.color}, transparent ${toPercent(startState.brightness)}%), color-mix(in srgb, ${endState.color}, transparent ${toPercent(endState.brightness ?? 0)}%))`,
				},
			});
		},
		getSelectionBoxProps: () => {
			const selectionBox = context.get("selectionBox");

			return normalize.element({
				...getProps(scope, "selectionBox"),
				style: { visibility: selectionBox ? "visible" : "hidden", width: selectionBox?.width ?? 0, height: selectionBox?.height ?? 0, top: selectionBox?.top ?? 0, left: selectionBox?.left ?? 0 },
			});
		},
		getCursorProps: (cursor: number | null) => {
			const dimensions = context.get("dimensions");

			return normalize.element({
				...getProps(scope, "cursor"),
				style: { left: cursor ? interpolate(cursor, startBeat, endBeat, 0, dimensions.width) : 0 },
			});
		},
		getPointerProps: () => {
			const dimensions = context.get("dimensions");
			const pointer = context.get("pointer");

			return normalize.element({
				...getProps(scope, "pointer"),
				style: { left: pointer ? interpolate(pointer, startBeat, endBeat, 0, dimensions.width) : 0 },
			});
		},

		createTriggerMovementHandler: (): Pick<UseMousePositionOverElementOptions, "onMouseMove">["onMouseMove"] => {
			return (_, ctx) => {
				return send({ type: "trigger/move", x: ctx.x, y: ctx.y });
			};
		},
	};
}
