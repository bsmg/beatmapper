import { GaugeIcon } from "lucide-react";

import { useAppSelector } from "$/store/hooks";
import { selectActiveSongId, selectNoteDensity } from "$/store/selectors";

import CountIndicator from "./CountIndicator";

const NoteDensityIndicator = () => {
	const songId = useAppSelector(selectActiveSongId);
	const noteDensity = useAppSelector((state) => selectNoteDensity(state, songId));
	return <CountIndicator num={noteDensity.toFixed(2)} label="Notes per second" icon={GaugeIcon} />;
};

export default NoteDensityIndicator;
