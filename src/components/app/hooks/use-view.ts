import { useLocation } from "@tanstack/react-router";
import { useMemo } from "react";

import { View } from "$/types";

export function useViewFromLocation() {
	const location = useLocation();
	const view = useMemo(() => Object.values(View).find((value) => location.pathname.includes(`/${value}`)) as View, [location]);
	return view;
}
