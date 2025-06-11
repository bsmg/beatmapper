import { EDITOR_TOASTER } from "$/components/app/constants";
import { Toaster } from "$/components/ui/compositions";

function EditorPrompts() {
	return <Toaster toaster={EDITOR_TOASTER} />;
}

export default EditorPrompts;
