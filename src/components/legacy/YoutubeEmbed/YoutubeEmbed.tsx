interface Props {
	title: string;
	width?: number;
	height?: number;
	src: string;
}

const YoutubeEmbed = ({ title, width = 560, height = 315, src }: Props) => {
	return <iframe width={width} height={height} src={src} title={title} frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />;
};

export default YoutubeEmbed;
