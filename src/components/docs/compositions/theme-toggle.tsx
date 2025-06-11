import { useSwitch } from "@ark-ui/react/switch";
import { MoonIcon, SunIcon } from "lucide-react";

import { styled } from "$:styled-system/jsx";
import { hstack } from "$:styled-system/patterns";
import { Switch } from "$/components/ui/compositions";
import { useEffect } from "react";

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

const Wrapper = styled("div", {
	base: hstack.raw({
		_icon: { cursor: "pointer" },
	}),
});

export default ThemeToggle;
