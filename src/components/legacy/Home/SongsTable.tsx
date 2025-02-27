import styled from "styled-components";

import { token } from "$:styled-system/tokens";
import { useAppSelector } from "$/store/hooks";
import { selectSongIds } from "$/store/selectors";

import CenteredSpinner from "../CenteredSpinner";
import SongsTableRow from "./SongsTableRow";

interface Props {
	isLoading: boolean;
}

const SongsTable = ({ isLoading }: Props) => {
	const songIds = useAppSelector(selectSongIds);
	return (
		<Wrapper>
			<Table>
				<thead>
					<tr>
						<th />
						<th>Title</th>
						<th>Difficulties</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{songIds.map((songId) => (
						<SongsTableRow key={songId} songId={songId} />
					))}
				</tbody>
			</Table>

			{isLoading && (
				<LoadingBlocker>
					<CenteredSpinner />
				</LoadingBlocker>
			)}
		</Wrapper>
	);
};

const Wrapper = styled.div`
  position: relative;
`;

const LoadingBlocker = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  background: hsla(222, 30%, 7%, 0.75);
`;

const Table = styled.table`
  position: relative;
  z-index: 1;
  width: 100%;

  & th {
    text-align: left;
    font-size: 13px;
    font-weight: 300;
    color: ${token.var("colors.gray.300")};
    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
    padding: ${token.var("spacing.1")};
  }

  & th:nth-of-type(3),
  & th:nth-of-type(4) {
    text-align: center;
  }

  tr {
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }
  tr:last-of-type {
    border-bottom: none;
  }
`;

export default SongsTable;
