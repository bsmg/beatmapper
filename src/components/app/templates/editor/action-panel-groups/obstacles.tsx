import { number, object } from "valibot";

import { ActionPanelGroup } from "$/components/app/layouts";
import { Button, usePrompt } from "$/components/ui/compositions";
import { updateAllSelectedObstacles } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAllSelectedObstacles } from "$/store/selectors";

function ObstaclesActionPanelGroup() {
	const dispatch = useAppDispatch();
	const selectedObstacles = useAppSelector(selectAllSelectedObstacles);

	const { trigger: triggerUpdateDurationForObstacles } = usePrompt({
		title: "Update Duration for Obstacles",
		description: "Changes the duration for all selected obstacles.",
		validate: object({ duration: number() }),
		defaultValues: { duration: selectedObstacles?.[0]?.duration },
		render: ({ form }) => <form.AppField name="duration">{(ctx) => <ctx.NumberInput autoFocus label="Duration" placeholder="4" />}</form.AppField>,
		onSubmit: ({ value: { duration } }) => {
			return dispatch(updateAllSelectedObstacles({ changes: { duration: duration } }));
		},
	});

	if (!selectedObstacles.length) return null;

	return (
		<ActionPanelGroup.Root label="Obstacles">
			<ActionPanelGroup.ActionGroup>
				<Button variant="subtle" size="sm" unfocusOnPress onClick={triggerUpdateDurationForObstacles}>
					Change duration
				</Button>
			</ActionPanelGroup.ActionGroup>
		</ActionPanelGroup.Root>
	);
}

export default ObstaclesActionPanelGroup;
