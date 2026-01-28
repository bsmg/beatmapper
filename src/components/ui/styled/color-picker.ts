"use client";

import { ColorPicker } from "@ark-ui/react/color-picker";

import { createStyleContext } from "$:styled-system/jsx";
import { colorPicker } from "$:styled-system/recipes";

const { withProvider, withContext } = createStyleContext(colorPicker);

export const RootProvider = withProvider(ColorPicker.RootProvider, "root");
export const Root = withProvider(ColorPicker.Root, "root");
export const AreaBackground = withContext(ColorPicker.AreaBackground, "areaBackground");
export const Area = withContext(ColorPicker.Area, "area");
export const AreaThumb = withContext(ColorPicker.AreaThumb, "areaThumb");
export const ChannelInput = withContext(ColorPicker.ChannelInput, "channelInput");
export const ChannelSliderLabel = withContext(ColorPicker.ChannelSliderLabel, "channelSliderLabel");
export const ChannelSlider = withContext(ColorPicker.ChannelSlider, "channelSlider");
export const ChannelSliderThumb = withContext(ColorPicker.ChannelSliderThumb, "channelSliderThumb");
export const ChannelSliderTrack = withContext(ColorPicker.ChannelSliderTrack, "channelSliderTrack");
export const ChannelSliderValueText = withContext(ColorPicker.ChannelSliderValueText, "channelSliderValueText");
export const Content = withContext(ColorPicker.Content, "content");
export const Control = withContext(ColorPicker.Control, "control");
export const EyeDropperTrigger = withContext(ColorPicker.EyeDropperTrigger, "eyeDropperTrigger");
export const FormatSelect = withContext(ColorPicker.FormatSelect, "formatSelect");
export const FormatTrigger = withContext(ColorPicker.FormatTrigger, "formatTrigger");
export const Label = withContext(ColorPicker.Label, "label");
export const Positioner = withContext(ColorPicker.Positioner, "positioner");
export const SwatchGroup = withContext(ColorPicker.SwatchGroup, "swatchGroup");
export const SwatchIndicator = withContext(ColorPicker.SwatchIndicator, "swatchIndicator");
export const Swatch = withContext(ColorPicker.Swatch, "swatch");
export const SwatchTrigger = withContext(ColorPicker.SwatchTrigger, "swatchTrigger");
export const TransparencyGrid = withContext(ColorPicker.TransparencyGrid, "transparencyGrid");
export const Trigger = withContext(ColorPicker.Trigger, "trigger");
export const ValueSwatch = withContext(ColorPicker.ValueSwatch, "swatch");
export const ValueText = withContext(ColorPicker.ValueText, "valueText");
export const View = withContext(ColorPicker.View, "view");

export { ColorPickerContext as Context, ColorPickerHiddenInput as HiddenInput } from "@ark-ui/react/color-picker";
