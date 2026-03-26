import type { EntityId } from "@reduxjs/toolkit";

export * from "./beatmap";
export * from "./lightshow";
export * from "./shared";

export type IEntityMap<T> = { [key in EntityId]: T };
