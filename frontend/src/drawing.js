export const CANVAS = { width: 800, height: 600 };

export function renderStrokes(ctx, strokes) {
	ctx.fillStyle = '#ffffff';
	ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';

	for (const stroke of strokes) {
		ctx.strokeStyle = stroke.color;
		ctx.lineWidth = stroke.width;
		ctx.beginPath();
		const [first, ...rest] = stroke.points;
		ctx.moveTo(first[0], first[1]);
		if (rest.length === 0)
			ctx.lineTo(first[0], first[1]);
		for (const [x, y] of rest)
			ctx.lineTo(x, y);
		ctx.stroke();
	}
}
