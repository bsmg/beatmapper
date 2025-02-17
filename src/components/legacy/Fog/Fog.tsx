import { useAppSelector } from "$/store/hooks";
import { selectGraphicsQuality } from "$/store/selectors";
import type { Quality } from "$/types";

interface Props {
	renderForGraphics: Quality;
	strength: number;
}

const Fog = ({ renderForGraphics, strength }: Props) => {
	const graphicsLevel = useAppSelector(selectGraphicsQuality);

	if (graphicsLevel !== renderForGraphics) {
		return null;
	}

	return <fogExp2 attach="fog" args={[0x000000, strength]} />;
};

export default Fog;
