import { GaugeIcon } from "lucide-react";

import { useAppSelector } from "$/store/hooks";
import { selectActiveSongId, selectNoteDensity } from "$/store/selectors";
import { roundTo } from "$/utils";

import CountIndicator from "./CountIndicator";

const NoteDensityIndicator = () => {
	const songId = useAppSelector(selectActiveSongId);
	const noteDensity = useAppSelector((state) => selectNoteDensity(state, songId));
	return <CountIndicator num={roundTo(noteDensity, 1)} label="Notes per second" icon={GaugeIcon} />;
};

export default NoteDensityIndicator;
