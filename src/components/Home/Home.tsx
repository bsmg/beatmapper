import { useState } from "react";

import { useAppSelector } from "$/store/hooks";
import { getIsNewUser, selectIsProcessingImport } from "$/store/selectors";

import AddSongForm from "../AddSongForm";
import BasicLayout from "../BasicLayout";
import ImportMapForm from "../ImportMapForm";
import Modal from "../Modal";
import FirstTimeHome from "./FirstTimeHome";
import ReturningHome from "./ReturningHome";

const Home = () => {
	const isNewUser = useAppSelector(getIsNewUser);
	const isProcessingImport = useAppSelector(selectIsProcessingImport);

	const [modal, setModal] = useState<string | null>(null);

	return (
		<BasicLayout>
			{isNewUser ? <FirstTimeHome setModal={setModal} /> : <ReturningHome isProcessingImport={isProcessingImport} setModal={setModal} />}

			<Modal isVisible={modal === "create-new-song"} clickBackdropToDismiss={false} onDismiss={() => setModal(null)}>
				<AddSongForm />
			</Modal>
			<Modal isVisible={modal === "import-map"} onDismiss={() => setModal(null)}>
				<ImportMapForm onImport={() => setModal(null)} onCancel={() => setModal(null)} />
			</Modal>
		</BasicLayout>
	);
};

export default Home;
