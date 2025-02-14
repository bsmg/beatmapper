import Color from "color";
import { Icon } from "react-icons-kit";
import { lock as lockIcon } from "react-icons-kit/feather/lock";
import { maximize as selectToolIcon } from "react-icons-kit/feather/maximize";
import { plus as placeToolIcon } from "react-icons-kit/feather/plus";
import { repeat as repeatWindowIcon } from "react-icons-kit/feather/repeat";
import { zoomIn as zoomInIcon } from "react-icons-kit/feather/zoomIn";
import { zoomOut as zoomOutIcon } from "react-icons-kit/feather/zoomOut";
import { Tooltip } from "react-tippy";
import styled from "styled-components";

import { COLORS, UNIT, ZOOM_LEVEL_MAX, ZOOM_LEVEL_MIN } from "$/constants";
import { getColorForItem } from "$/helpers/colors.helpers";
import { selectEventColor, selectEventEditMode, selectTool, toggleEventWindowLock, toggleLaserLock, zoomIn, zoomOut } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectActiveSongId, selectCustomColors, selectEventEditorColor, selectEventEditorEditMode, selectEventEditorToggleLoop, selectEventEditorToggleMirror, selectEventEditorTool, selectEventEditorZoomLevel } from "$/store/selectors";
import { EventColor, EventEditMode, EventTool, View } from "$/types";

import Spacer from "../Spacer";
import UnfocusedButton from "../UnfocusedButton";
import ControlItem from "./ControlItem";
import ControlItemToggleButton from "./ControlItemToggleButton";
import EventToolIcon from "./EventToolIcon";

interface Props {
	contentWidth: number;
}

const GridControls = ({ contentWidth }: Props) => {
	const songId = useAppSelector(selectActiveSongId);
	const customColors = useAppSelector((state) => selectCustomColors(state, songId));
	const selectedEditMode = useAppSelector(selectEventEditorEditMode);
	const selectedTool = useAppSelector(selectEventEditorTool);
	const selectedColor = useAppSelector(selectEventEditorColor);
	const isLockedToCurrentWindow = useAppSelector(selectEventEditorToggleLoop);
	const areLasersLocked = useAppSelector(selectEventEditorToggleMirror);
	const zoomLevel = useAppSelector(selectEventEditorZoomLevel);
	const dispatch = useAppDispatch();

	return (
		<Wrapper style={{ width: contentWidth }}>
			<Left>
				<ControlItem label="Edit Mode">
					<ControlItemToggleButton value={EventEditMode.PLACE} isToggled={selectedEditMode === EventEditMode.PLACE} onToggle={() => dispatch(selectEventEditMode({ editMode: EventEditMode.PLACE }))}>
						<Icon icon={placeToolIcon} />
					</ControlItemToggleButton>

					<ControlItemToggleButton value={EventEditMode.SELECT} isToggled={selectedEditMode === EventEditMode.SELECT} onToggle={() => dispatch(selectEventEditMode({ editMode: EventEditMode.SELECT }))}>
						<Icon icon={selectToolIcon} />
					</ControlItemToggleButton>
				</ControlItem>
				<Spacer size={UNIT * 4} />
				<ControlItem label="Light Color">
					<ControlItemToggleButton value={EventColor.PRIMARY} isToggled={selectedColor === EventColor.PRIMARY} onToggle={(value) => dispatch(selectEventColor({ color: value as EventColor }))}>
						<Box color={getColorForItem(EventColor.PRIMARY, customColors)} />
					</ControlItemToggleButton>
					<ControlItemToggleButton value={EventColor.SECONDARY} isToggled={selectedColor === EventColor.SECONDARY} onToggle={(value) => dispatch(selectEventColor({ color: value as EventColor }))}>
						<Box color={getColorForItem(EventColor.SECONDARY, customColors)} />
					</ControlItemToggleButton>
				</ControlItem>

				<Spacer size={UNIT * 4} />

				<ControlItem label="Effect">
					<ControlItemToggleButton value={EventTool.ON} isToggled={selectedTool === EventTool.ON} onToggle={() => dispatch(selectTool({ view: View.LIGHTSHOW, tool: EventTool.ON }))}>
						<EventToolIcon tool={EventTool.ON} color={getColorForItem(selectedColor, customColors)} />
					</ControlItemToggleButton>
					<ControlItemToggleButton value={EventTool.OFF} isToggled={selectedTool === EventTool.OFF} onToggle={() => dispatch(selectTool({ view: View.LIGHTSHOW, tool: EventTool.OFF }))}>
						<EventToolIcon tool={EventTool.OFF} />
					</ControlItemToggleButton>
					<ControlItemToggleButton value={EventTool.FLASH} isToggled={selectedTool === EventTool.FLASH} onToggle={() => dispatch(selectTool({ view: View.LIGHTSHOW, tool: EventTool.FLASH }))}>
						<EventToolIcon tool={EventTool.FLASH} color={getColorForItem(selectedColor, customColors)} />
					</ControlItemToggleButton>
					<ControlItemToggleButton value={EventTool.FADE} isToggled={selectedTool === EventTool.FADE} onToggle={() => dispatch(selectTool({ view: View.LIGHTSHOW, tool: EventTool.FADE }))}>
						<EventToolIcon tool={EventTool.FADE} color={getColorForItem(selectedColor, customColors)} />
					</ControlItemToggleButton>
				</ControlItem>
				<Spacer size={UNIT * 4} />
				<ControlItem label="Locks">
					<Tooltip delay={500} title="Loop playback within the current event window (L)">
						<ControlItemToggleButton value={null} isToggled={isLockedToCurrentWindow} onToggle={() => dispatch(toggleEventWindowLock())}>
							<Icon icon={repeatWindowIcon} />
						</ControlItemToggleButton>
					</Tooltip>

					<Tooltip delay={500} title="Pair side lasers for symmetrical left/right events">
						<ControlItemToggleButton value={null} isToggled={areLasersLocked} onToggle={() => dispatch(toggleLaserLock())}>
							<Icon icon={lockIcon} />
						</ControlItemToggleButton>
					</Tooltip>
				</ControlItem>
			</Left>

			<Right>
				<ControlItem label="Zoom" align="right">
					<ZoomBtn onClick={() => dispatch(zoomOut())} disabled={zoomLevel === ZOOM_LEVEL_MIN}>
						<Icon size={14} icon={zoomOutIcon} />
					</ZoomBtn>
					<ZoomBtn onClick={() => dispatch(zoomIn())} disabled={zoomLevel === ZOOM_LEVEL_MAX}>
						<Icon size={14} icon={zoomInIcon} />
					</ZoomBtn>
				</ControlItem>
			</Right>
		</Wrapper>
	);
};

const Wrapper = styled.div`
  height: 75px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  user-select: none;
  padding: 0 ${UNIT * 2}px;
`;

const Side = styled.div`
  display: flex;
`;

const Left = styled(Side)``;
const Right = styled(Side)``;

const Box = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background: linear-gradient(
    0deg,
    ${(props) => Color(props.color).darken(0.2).hsl().string()},
    ${(props) => Color(props.color).lighten(0.1).hsl().string()}
  );
`;

const ZoomBtn = styled(UnfocusedButton)`
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: ${COLORS.blueGray[900]};
  color: ${COLORS.blueGray[100]};
  display: flex;
  justify-content: center;
  align-items: center;

  &:disabled {
    opacity: 0.5;
  }

  & svg {
    display: block !important;
  }
`;

export default GridControls;
