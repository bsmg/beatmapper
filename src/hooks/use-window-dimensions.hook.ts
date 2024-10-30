import { useCallback, useEffect, useState } from "react";

export function useWindowDimensions() {
	const [windowDimensions, setWindowDimensions] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	});

	const updateWindowDimensions = useCallback(() => {
		setWindowDimensions({
			width: window.innerWidth,
			height: window.innerHeight,
		});
	}, []);

	useEffect(() => {
		window.addEventListener("resize", updateWindowDimensions);

		return () => window.removeEventListener("resize", updateWindowDimensions);
	}, [updateWindowDimensions]);

	return windowDimensions;
}
