import { Float, styled } from "$:styled-system/jsx";
import { Spinner } from "$/components/ui/compositions";

const LoadingScreen = () => {
	return (
		<Wrapper placement={"middle-center"}>
			<Spinner />
		</Wrapper>
	);
};

const Wrapper = styled(Float, {
	base: {
		backgroundColor: "bg.canvas",
	},
});

export default LoadingScreen;
