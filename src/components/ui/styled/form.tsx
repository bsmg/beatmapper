import { ark } from "@ark-ui/react/factory";

import { styled } from "$:styled-system/jsx";
import { stack, wrap } from "$:styled-system/patterns";

export const Root = styled(ark.div, {
	base: stack.raw({
		gap: 4,
	}),
});

export const Row = styled(ark.div, {
	base: wrap.raw({
		gap: 2,
		"& > *": { flex: 1 },
	}),
});
