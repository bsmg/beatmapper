import { prompts } from "velite:content";
import styled from "styled-components";

import { dismissPrompt } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectSeenPrompts } from "$/store/selectors";

import { MDXContent } from "../Docs/MDXContent";
import List from "../List";
import Paragraph from "../Paragraph";
import UnobtrusivePrompt from "../UnobtrusivePrompt";

const components = {
	a: ({ ...rest }) => <ExternalLink {...rest} target="_blank" />,
	p: ({ ...rest }) => <Paragraph {...rest} style={{ marginBlockEnd: "1rem" }} />,
	ul: List,
	li: List.ListItem,
};

const EditorPrompts = () => {
	const prompt = useAppSelector((state) => {
		const seenPrompts = selectSeenPrompts(state);
		const unseenPrompts = prompts.filter((prompt) => !seenPrompts.includes(prompt.id));
		return unseenPrompts[0];
	});
	const dispatch = useAppDispatch();

	if (!prompt) {
		return null;
	}

	return (
		<UnobtrusivePrompt title={prompt.title} onDismiss={() => dispatch(dismissPrompt({ promptId: prompt.id }))}>
			<MDXContent code={prompt.code} components={components} />
		</UnobtrusivePrompt>
	);
};

const ExternalLink = styled.a`
  color: inherit;
`;

export default EditorPrompts;
