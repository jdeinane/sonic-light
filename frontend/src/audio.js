import { CANVAS } from './drawing';

/**
 * Settings and conversions
 */
const DURATION = 8;
const MIN_FREQUENCY = 110;
const OCTAVES = 4;
const MIN_NOTE = 0.15;
const MIN_STEP = 0.005;
const ATTACK = 0.02;
const RELEASE = 0.05;

const timeOf = (x) => (x / CANVAS.width) * DURATION;
const frequencyOf = (y) => MIN_FREQUENCY * 2 ** (OCTAVES * (1 - y / CANVAS.height));
const volumeOf = (width) => 0.03 + (width / 40) * 0.12;


/**
 * Stamp according to the color
 */
function waveformOf(hex) {
	const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
	const max = Math.max(r, g, b);
	const delta = max - Math.min(r, g, b);
	if (delta < 0.15)
		return 'sine';

	let hue;
	if (max === r)
		hue = ((g - b) / delta + 6) % 6;
	else if (max === g)
		hue = (b - r) / delta + 2;
	else
		hue = (r - g) / delta + 4;

	const waveforms = ['triangle', 'square', 'sine', 'sawtooth'];
	return waveforms[Math.floor((hue * 60) / 90) % 4];
}

/**
 * Play a stroke
 */
function scheduleStroke(ctx, destination, stroke, start) {
	const points = [...stroke.points].sort((a, b) => a[0] - b[0]);
	const volume = volumeOf(stroke.width);

	const oscillator = ctx.createOscillator();
	oscillator.type = waveformOf(stroke.color);
	const gain = ctx.createGain();
	oscillator.connect(gain).connect(destination);

	const begin = start + timeOf(points[0][0]);
	let time = begin;
	oscillator.frequency.setValueAtTime(frequencyOf(points[0][1]), time);
	for (const [x, y] of points.slice(1)) {
		time = Math.max(start + timeOf(x), time + MIN_STEP);
		oscillator.frequency.exponentialRampToValueAtTime(frequencyOf(y), time);
	}
	const end = Math.max(time, begin + MIN_NOTE);

	gain.gain.setValueAtTime(0, begin);
	gain.gain.linearRampToValueAtTime(volume, begin + ATTACK);
	gain.gain.setValueAtTime(volume, end - RELEASE);
	gain.gain.linearRampToValueAtTime(0, end);

	oscillator.start(begin);
	oscillator.stop(end);
	return end;
}

/**
 * Public function
 */
export function playDrawing(strokes, onEnded) {
	const ctx = new AudioContext();
	const compressor = ctx.createDynamicsCompressor();
	compressor.connect(ctx.destination);

	const start = ctx.currentTime + 0.1;
	let end = start;
	for (const stroke of strokes)
		end = Math.max(end, scheduleStroke(ctx, compressor, stroke, start));

	let stopped = false;
	const stop = () => {
		if (stopped)
			return;
		stopped = true;
		clearTimeout(timer);
		ctx.close();
		onEnded?.();
	};
	const timer = setTimeout(stop, (end - ctx.currentTime + 0.2) * 1000);

	return { stop };
}
