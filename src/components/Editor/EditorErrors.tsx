import { Component, type ErrorInfo, type PropsWithChildren } from "react";

class EditorErrors extends Component<PropsWithChildren> {
	state = {
		error: null,
	};

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error("Error in editor", error, info);
		this.setState({
			error,
		});
	}

	render() {
		if (!this.state.error) {
			return this.props.children;
		}

		return <div>An error has occurred :(</div>;
	}
}

export default EditorErrors;
