import { useSwitch } from "@ark-ui/react/switch";
import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect } from "react";

import { Switch } from "$/components/ui/compositions";
import { HStack, styled } from "$:styled-system/jsx";

function ThemeToggle() {
	const ctx = useSwitch({ defaultChecked: localStorage.getItem("dark") === "true" });

	useEffect(() => {
		document.documentElement.className = ctx.checked ? "dark" : "light";
		localStorage.setItem("dark", ctx.checked.toString());
	}, [ctx.checked]);

	return (
		<Wrapper>
			<SunIcon size={16} onClick={() => ctx.setChecked(false)} />
			<Switch checked={ctx.checked} onCheckedChange={(details) => ctx.setChecked(details.checked)} />
			<MoonIcon size={16} onClick={() => ctx.setChecked(true)} />
		</Wrapper>
	);
}

const Wrapper = styled(HStack, {
	base: {
		_icon: { cursor: "pointer" },
	},
});

export default ThemeToggle;
