import type { Assign } from "@ark-ui/react";
import type { Service } from "@zag-js/core";
import type { PropsWithChildren } from "react";

import { useGlobalEventListener } from "$/components/hooks/use-global-event-listener";
import { Provider } from "./context";
import { connect, type PlacementGridSchema } from "./machine";

function PlacementGridRoot({ children, service, ...rest }: Assign<PropsWithChildren, { service: Service<PlacementGridSchema> }>) {
	const api = connect(service);

	const { onPointerUp, onPointerMove } = api.createGlobalHandlers();

	useGlobalEventListener("pointerup", onPointerUp, {
		shouldFire: !!api.cellDownAt,
	});
	useGlobalEventListener("pointermove", onPointerMove, {
		shouldFire: !!api.cellDownAt,
	});

	return (
		<Provider value={api}>
			<group {...rest}>{children}</group>
		</Provider>
	);
}

export default PlacementGridRoot;
