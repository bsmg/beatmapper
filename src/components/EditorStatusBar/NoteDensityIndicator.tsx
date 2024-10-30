import { layers as densityIcon } from "react-icons-kit/feather/layers";

import { useAppSelector } from "$/store/hooks";
import { getNoteDensity } from "$/store/selectors";
import { roundTo } from "$/utils";

import CountIndicator from "./CountIndicator";

const NoteDensityIndicator = () => {
	const noteDensity = useAppSelector(getNoteDensity);
	return <CountIndicator num={roundTo(noteDensity, 1)} label="Notes per second" icon={densityIcon} />;
};

export default NoteDensityIndicator;
