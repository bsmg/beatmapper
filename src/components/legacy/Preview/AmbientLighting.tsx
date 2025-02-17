import { Fragment } from "react";
import { Object3D } from "three";

interface Props {
	includeSpotlight: boolean;
}

const AmbientLighting = ({ includeSpotlight }: Props) => {
	const midLightTarget = new Object3D();
	midLightTarget.position.set(0, -20, -20);

	return (
		<Fragment>
			<ambientLight intensity={3} />
			{includeSpotlight && (
				<Fragment>
					<primitive object={midLightTarget} />

					<directionalLight intensity={0.25} position={[0, 20, 0]} target={midLightTarget} />
				</Fragment>
			)}
		</Fragment>
	);
};

export default AmbientLighting;
