import { ChevronDownIcon } from "lucide-react";
import type { CSSProperties } from "react";
import styled from "styled-components";

import { deleteSong, downloadMapFiles } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectSongById } from "$/store/selectors";
import type { SongId } from "$/types";

import MiniButton from "../MiniButton";

interface Props {
	songId: SongId;
	size: CSSProperties["height"];
}

const SongRowActions = ({ songId, size }: Props) => {
	const song = useAppSelector((state) => selectSongById(state, songId));
	const dispatch = useAppDispatch();

	const handleDelete = () => {
		if (window.confirm("Are you sure? This action cannot be undone 😱")) {
			dispatch(deleteSong(song));
		}
	};

	const handleCopy = () => {
		window.alert("This feature does not exist yet. Sorry! Coming soon.");
	};

	return (
		<MiniButton style={{ height: size, width: size }}>
			<ChevronDownIcon size={16} />
			<Select
				style={{ height: size, width: size }}
				value=""
				onChange={(ev) => {
					switch (ev.target.value) {
						case "copy":
							return handleCopy();
						case "delete":
							return handleDelete();
						case "download":
							return dispatch(downloadMapFiles({ songId }));
						default:
							throw new Error(`Unrecognized action: ${ev.target.value}`);
					}
				}}
			>
				<option />
				{(import.meta.env.DEV || !song.demo) && <option value="copy">Copy</option>}
				<option value="delete">Delete</option>
				{(import.meta.env.DEV || !song.demo) && <option value="download">Download</option>}
			</Select>
		</MiniButton>
	);
};

const Select = styled.select`
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;

  /*
    Reports of invisible text on options on Chrome Windows.
    Not sure if this is an actual fix tho.
  */
  option {
    color: black;
  }
`;

export default SongRowActions;
