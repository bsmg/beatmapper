import { Fragment } from "react";
import styled from "styled-components";

import { dismissPrompt } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectSeenPrompts } from "$/store/selectors";

import Paragraph from "../Paragraph";
import UnobtrusivePrompt from "../UnobtrusivePrompt";

// TODO: compose prompts in mdx for better dx
const PROMPTS = [
	{
		id: "bsmg",
		title: "Beatmapper lives on!",
		contents: () => (
			<Fragment>
				<Paragraph>
					Good news, everyone — The kind folks at the Beat Saber Modding Group have agreed to <ExternalLink href="https://github.com/bsmg/beatmapper">maintain this project</ExternalLink>. Beatmapper will remain online!
				</Paragraph>
			</Fragment>
		),
	},
];

const EditorPrompts = () => {
	const prompt = useAppSelector((state) => {
		const seenPrompts = selectSeenPrompts(state);
		const unseenPrompts = PROMPTS.filter((prompt) => !seenPrompts.includes(prompt.id));
		return unseenPrompts[0];
	});
	const dispatch = useAppDispatch();

	if (!prompt) {
		return null;
	}

	return (
		<UnobtrusivePrompt title={prompt.title} onDismiss={() => dispatch(dismissPrompt({ promptId: prompt.id }))}>
			{prompt.contents()}
		</UnobtrusivePrompt>
	);
};

const ExternalLink = styled.a`
  color: inherit;
`;

export default EditorPrompts;
