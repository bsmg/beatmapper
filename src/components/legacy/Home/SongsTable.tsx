import { useAppSelector } from "$/store/hooks";
import { selectSongIds } from "$/store/selectors";

import { Center, styled } from "$:styled-system/jsx";
import { Spinner } from "$/components/ui/compositions";
import { Table } from "$/components/ui/styled";
import SongsTableRow from "./SongsTableRow";

interface Props {
	isLoading: boolean;
}

const SongsTable = ({ isLoading }: Props) => {
	const songIds = useAppSelector(selectSongIds);
	return (
		<Wrapper>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell />
						<Table.HeaderCell>Title</Table.HeaderCell>
						<Table.HeaderCell>Difficulties</Table.HeaderCell>
						<Table.HeaderCell>Actions</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{songIds.map((songId) => (
						<SongsTableRow key={songId} songId={songId} />
					))}
				</Table.Body>
			</Table.Root>

			{isLoading && (
				<LoadingBlocker>
					<Spinner />
				</LoadingBlocker>
			)}
		</Wrapper>
	);
};

const Wrapper = styled("div", {
	base: {
		position: "relative",
	},
});

const LoadingBlocker = styled(Center, {
	base: {
		position: "absolute",
		inset: 0,
		zIndex: 2,
		backgroundColor: "color-mix(in srgb, {colors.bg.canvas}, transparent)",
	},
});

export default SongsTable;
