import { Fragment } from "react";
import { Route, Routes } from "react-router-dom";

import { useAppSelector } from "$/store/hooks";
import { selectInitialized } from "$/store/selectors";

import Docs from "../Docs";
import Editor from "../Editor";
import GlobalStyles from "../GlobalStyles";
import Home from "../Home";
import LoadingScreen from "../LoadingScreen";

import "react-tippy/dist/tippy.css";

const App = () => {
	const hasInitialized = useAppSelector(selectInitialized);

	if (!hasInitialized) {
		return <LoadingScreen />;
	}

	return (
		<Fragment>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/edit/:songId/:difficulty/*" element={<Editor />} />
				<Route path="/docs/*" element={<Docs />} />
			</Routes>
			<GlobalStyles />
		</Fragment>
	);
};

export default App;
