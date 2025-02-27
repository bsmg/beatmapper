import { memo, useState } from "react";
import { ChromePicker } from "react-color";
import OutsideClickHandler from "react-outside-click-handler";
import styled from "styled-components";

import { token } from "$:styled-system/tokens";
import type { App } from "$/types";

import UnstyledButton from "../UnstyledButton";

const PREVIEW_SIZE = 30;
const BORDER_WIDTH = 2;

interface Props {
	colorId: App.BeatmapColorKey;
	color: string;
	updateColor: (colorId: App.BeatmapColorKey, color: string) => void;
	overdrive: number;
}

const ColorPicker = ({ colorId, color, updateColor, overdrive }: Props) => {
	const [showPicker, setShowPicker] = useState(false);

	return (
		<Wrapper>
			<ColorPreview style={{ backgroundColor: color }} onClick={() => setShowPicker(true)} />

			<ColorPreviewBorder />

			<ColorPreviewGlow style={{ backgroundColor: color, opacity: overdrive }} />

			{showPicker && (
				<OutsideClickHandler onOutsideClick={() => setShowPicker(false)}>
					<PickerWrapper>
						<ChromePicker color={color} onChange={(colorInfo) => updateColor(colorId, colorInfo.hex)} />
					</PickerWrapper>
				</OutsideClickHandler>
			)}
		</Wrapper>
	);
};

const Wrapper = styled.div`
  position: relative;
  /* Ensure that the color picker sits above tooltips and other things */
  z-index: 9999999;
`;

const ColorPreview = styled(UnstyledButton)`
  position: relative;
  z-index: 1;
  width: ${PREVIEW_SIZE}px;
  height: ${PREVIEW_SIZE}px;
  border-radius: 50%;
  cursor: pointer;
  border-bottom: 2px solid rgba(0, 0, 0, 0.2);
  border-left: 2px solid rgba(0, 0, 0, 0.2);
`;
const ColorPreviewBorder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  width: ${PREVIEW_SIZE + BORDER_WIDTH * 2}px;
  height: ${PREVIEW_SIZE + BORDER_WIDTH * 2}px;
  transform: translate(-${BORDER_WIDTH}px, -${BORDER_WIDTH}px);
  border-radius: 50%;
  border: ${BORDER_WIDTH}px solid ${token.var("colors.slate.1000")};
  opacity: 0.25;
  pointer-events: none;
`;

const ColorPreviewGlow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  width: ${PREVIEW_SIZE}px;
  height: ${PREVIEW_SIZE}px;
  filter: blur(12px);
  border-radius: 50%;
  will-change: opacity;
`;

const PickerWrapper = styled.div`
  position: absolute;
  top: 40px;
  left: 40px;
`;

export default memo(ColorPicker);
