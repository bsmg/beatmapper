import type { LucideProps } from "lucide-react";
import styled from "styled-components";

interface Props extends LucideProps {
	color: string;
}

const BlockIcon = ({ color, size = 16 }: Props) => {
	return (
		<Block color={color} style={{ width: size, height: size }}>
			<svg width={`calc(${size} - ${size} / 4)`} height={`calc(${size} - ${size} / 4)`} viewBox="0 0 12 12">
				<path d="M0,2 L12,2 L6,6 Z" fill="#FFF" />
			</svg>
		</Block>
	);
};

const Block = styled.div`
  border-radius: 4px;
  background-color: ${(props) => props.color};
  padding: 2px;
`;

export default BlockIcon;
