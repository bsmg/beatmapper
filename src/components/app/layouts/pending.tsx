import { Float, styled } from "$:styled-system/jsx";
import { Spinner } from "$/components/ui/compositions";

function PendingBoundary() {
	return (
		<Wrapper placement={"middle-center"}>
			<Spinner />
		</Wrapper>
	);
}

const Wrapper = styled(Float, {
	base: {
		backgroundColor: "bg.canvas",
		color: "fg.default",
	},
});

export default PendingBoundary;
