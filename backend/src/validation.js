export const CANVAS = { width: 800, height: 600 };

const MAX_STROKES = 2000;
const MAX_POINTS_PER_STROKE = 5000;
const USERNAME_RE = /^[\p{L}\p{N}_ .-]{1,32}$/u;

/**
 * Username validation
 * @param {string} value 
 * @returns sanitized username, or null if invalid
 */
export function normalizeUsername(value) {
	if (typeof value !== 'string') return null;
	const name = value.trim();
	return USERNAME_RE.test(name) ? name : null;
}


const isCoord = (n, max) => Number.isFinite(n) && n >= 0 && n <= max;

/**
 * Validate and clean a drawing sent by the client
 * @param {{ strokes: Array }} input 
 * @returns {object | null} the sanitized drawing, or null if invalid
 */
export function parseDrawing(input) {
	const strokes = input?.strokes;
	if (!Array.isArray(strokes) || strokes.length > MAX_STROKES)
		return null;

	const clean = [];
	for (const stroke of strokes) {
		if (typeof stroke?.color !== 'string' || !/^#[0-9a-f]{6}$/i.test(stroke.color))
			return null;
		if (!Number.isFinite(stroke.width) || stroke.width < 1 || stroke.width > 40)
			return null;
		if (!Array.isArray(stroke.points) || stroke.points.length < 1 
			|| stroke.points.length > MAX_POINTS_PER_STROKE)
			return null;
		
		for (const point of stroke.points) {
			if (!Array.isArray(point) || point.length !== 2 || !isCoord(point[0], CANVAS.width) 
				|| !isCoord(point[1], CANVAS.height))
				return null;
		}

		clean.push({ color: stroke.color, width: stroke.width, points: stroke.points.map(
			([x, y]) => [x, y])
		});
	}

	return { ...CANVAS, strokes:clean };
}
