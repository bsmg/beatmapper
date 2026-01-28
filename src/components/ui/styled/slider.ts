"use client";

import { Slider } from "@ark-ui/react/slider";

import { createStyleContext } from "$:styled-system/jsx";
import { slider } from "$:styled-system/recipes";

const { withProvider, withContext } = createStyleContext(slider);

export const RootProvider = withProvider(Slider.RootProvider, "root");
export const Root = withProvider(Slider.Root, "root");
export const Control = withContext(Slider.Control, "control");
export const Label = withContext(Slider.Label, "label");
export const MarkerGroup = withContext(Slider.MarkerGroup, "markerGroup");
export const Marker = withContext(Slider.Marker, "marker");
export const Range = withContext(Slider.Range, "range");
export const Thumb = withContext(Slider.Thumb, "thumb");
export const Track = withContext(Slider.Track, "track");
export const ValueText = withContext(Slider.ValueText, "valueText");

export { SliderContext as Context, SliderHiddenInput as HiddenInput } from "@ark-ui/react/slider";
