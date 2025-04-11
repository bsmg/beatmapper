import { useAppSelector } from "$/store/hooks";
import { selectIsNew, selectIsProcessingImport } from "$/store/selectors";

import BasicLayout from "../BasicLayout";
import FirstTimeHome from "./FirstTimeHome";
import ReturningHome from "./ReturningHome";

const Home = () => {
	const isNewUser = useAppSelector(selectIsNew);
	const isProcessingImport = useAppSelector(selectIsProcessingImport);

	return <BasicLayout>{isNewUser ? <FirstTimeHome /> : <ReturningHome isProcessingImport={isProcessingImport} />}</BasicLayout>;
};

export default Home;
