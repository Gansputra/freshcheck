/**
 * Generates high-fidelity synthetic produce samples onto a canvas for instant verification
 * when a physical webcam is not available or to test inference repeatability.
 */
export function createSyntheticSample(type: 'fresh' | 'semifresh' | 'rotten'): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 400, 400);

  if (type === 'fresh') {
    // Fresh Green Apple
    // Shadow
    ctx.beginPath();
    ctx.ellipse(200, 320, 110, 24, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
    ctx.fill();

    // Body gradient
    const grad = ctx.createRadialGradient(160, 160, 20, 200, 200, 140);
    grad.addColorStop(0, '#86efac');
    grad.addColorStop(0.5, '#22c55e');
    grad.addColorStop(0.9, '#15803d');
    grad.addColorStop(1, '#14532d');

    ctx.beginPath();
    ctx.arc(200, 200, 115, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Natural sheen
    ctx.beginPath();
    ctx.ellipse(160, 150, 45, 25, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fill();

    // Stem
    ctx.beginPath();
    ctx.moveTo(200, 85);
    ctx.bezierCurveTo(205, 55, 220, 50, 230, 45);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#451a03';
    ctx.lineCap = 'round';
    ctx.stroke();
  } else if (type === 'semifresh') {
    // Semi-fresh with ripening brown speckles and duller yellow/green tones
    // Shadow
    ctx.beginPath();
    ctx.ellipse(200, 320, 110, 24, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
    ctx.fill();

    // Body
    const grad = ctx.createRadialGradient(170, 170, 20, 200, 200, 140);
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.5, '#eab308');
    grad.addColorStop(0.85, '#ca8a04');
    grad.addColorStop(1, '#854d0e');

    ctx.beginPath();
    ctx.arc(200, 200, 115, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Aging spots
    ctx.fillStyle = '#713f12';
    const spots = [
      [160, 220, 7],
      [175, 240, 9],
      [220, 180, 11],
      [235, 200, 6],
      [190, 160, 5],
      [240, 230, 8],
    ];
    spots.forEach(([x, y, r]) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Stem
    ctx.beginPath();
    ctx.moveTo(200, 85);
    ctx.bezierCurveTo(205, 55, 215, 50, 225, 45);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#3f1f0a';
    ctx.stroke();
  } else {
    // Rotten Produce with mold patches and dark necrosis
    // Shadow
    ctx.beginPath();
    ctx.ellipse(200, 320, 110, 24, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
    ctx.fill();

    // Decayed body
    const grad = ctx.createRadialGradient(160, 160, 10, 200, 200, 140);
    grad.addColorStop(0, '#78716c');
    grad.addColorStop(0.4, '#44403c');
    grad.addColorStop(0.8, '#292524');
    grad.addColorStop(1, '#1c1917');

    ctx.beginPath();
    ctx.arc(200, 200, 115, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Mold patches (white/blue-green fungal colonies)
    const moldPatches = [
      [170, 180, 28, '#a8a29e'],
      [175, 175, 18, '#cbd5e1'],
      [180, 182, 9, '#f1f5f9'],
      [220, 230, 24, '#57534e'],
      [225, 235, 14, '#94a3b8'],
      [150, 240, 16, '#475569'],
    ];
    moldPatches.forEach(([x, y, r, color]) => {
      ctx.beginPath();
      ctx.arc(x as number, y as number, r as number, 0, Math.PI * 2);
      ctx.fillStyle = color as string;
      ctx.fill();
    });
  }

  return canvas;
}

