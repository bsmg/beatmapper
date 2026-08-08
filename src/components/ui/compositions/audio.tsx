import { PlayIcon, SquareIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAudioContext } from "$/components/context";
import { Button } from "$/components/ui/compositions";
import { AudioSample } from "$/services/audio.service";
import { styled } from "$:styled-system/jsx";
import { center } from "$:styled-system/patterns";

interface Props {
	file: File;
	startTime?: number;
	duration?: number;
	volume?: number;
}

export function AudioPreview({ file, startTime = 0, duration, volume }: Props) {
	const audioContext = useAudioContext();

	const [isLoaded, setIsLoaded] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [progress, setProgress] = useState(0);

	const audio = useMemo(() => new AudioSample(audioContext, { volume }), [audioContext, volume]);
	const requestRef = useRef<number>(null);

	const getEffectiveDuration = () => {
		if (duration) return duration;
		return audio.buffer ? audio.buffer.duration - startTime : 0;
	};

	const animate = () => {
		if (audio.isPlaying) {
			const current = audio.getCurrentTime();
			const effectiveDuration = getEffectiveDuration();

			const elapsedInSnippet = current - startTime;
			const percent = Math.min(Math.max((elapsedInSnippet / effectiveDuration) * 100, 0), 100);

			setProgress(percent);

			if (percent >= 100) {
				setIsPlaying(false);
				setProgress(0);
				return;
			}

			requestRef.current = requestAnimationFrame(animate);
		} else {
			setIsPlaying(false);
			setProgress(0);
		}
	};

	useEffect(() => {
		if (file) {
			setIsLoaded(false);
			audio.loadFromFile(file).then(() => setIsLoaded(true));
		}
		return () => {
			audio.pause();
			if (requestRef.current) cancelAnimationFrame(requestRef.current);
		};
	}, [file, audio]);

	const handleTogglePreview = () => {
		if (!isLoaded) return;

		if (isPlaying) {
			audio.pause();
			setIsPlaying(false);
			setProgress(0);
			if (requestRef.current) cancelAnimationFrame(requestRef.current);
		} else {
			setIsPlaying(true);
			audio.play(startTime, duration);
			requestRef.current = requestAnimationFrame(animate);
		}
	};

	const styles = useMemo(() => ({ "--progress": `${progress}%` }) as React.CSSProperties, [progress]);

	return (
		<Progress style={styles}>
			<PlayButton loading={!!file && !isLoaded} onClick={handleTogglePreview}>
				{isPlaying ? <SquareIcon size={16} /> : <PlayIcon size={16} />}
			</PlayButton>
		</Progress>
	);
}

const PlayButton = styled(Button, {
	base: {
		zIndex: 1,
		boxSize: "32px",
		borderRadius: "full",
		layerStyle: "ghost",
	},
});

const Progress = styled("div", {
	base: center.raw({
		position: "relative",
		boxSize: "32px",
		borderRadius: "full",
		background: "conic-gradient({colors.blue.500} var(--progress), {colors.border.muted} 0deg)",
		_before: {
			content: '""',
			position: "absolute",
			inset: "3px",
			borderRadius: "full",
			backgroundColor: "bg.muted",
			zIndex: 0,
		},
	}),
});
