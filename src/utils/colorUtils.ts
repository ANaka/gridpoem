/**
 * Map probability (0-1) to a background color for heatmap
 * Low prob = subtle red, high prob = subtle green, mid = neutral
 */
export function probabilityToColor(probability: number | null): string {
  if (probability === null) {
    return 'transparent';
  }

  // Clamp probability to [0, 1]
  const p = Math.max(0, Math.min(1, probability));

  if (p < 0.33) {
    // Low probability: subtle red
    // Interpolate from stronger red to lighter red
    const intensity = Math.round(255 - (p / 0.33) * 50);
    const greenBlue = Math.round(200 + (p / 0.33) * 55);
    return `rgba(${intensity}, ${greenBlue}, ${greenBlue}, 0.3)`;
  } else if (p < 0.66) {
    // Mid probability: neutral (light gray to white)
    const normalized = (p - 0.33) / 0.33;
    const gray = Math.round(245 + normalized * 10);
    return `rgba(${gray}, ${gray}, ${gray}, 0.2)`;
  } else {
    // High probability: subtle green
    // Interpolate from lighter green to stronger green
    const normalized = (p - 0.66) / 0.34;
    const redBlue = Math.round(220 - normalized * 40);
    const green = Math.round(235 + normalized * 20);
    return `rgba(${redBlue}, ${green}, ${redBlue}, 0.3)`;
  }
}

/**
 * Map probability to CSS class name
 */
export function probabilityToClass(probability: number | null): string {
  if (probability === null) {
    return 'prob-unknown';
  }

  // Clamp probability to [0, 1]
  const p = Math.max(0, Math.min(1, probability));

  if (p < 0.2) {
    return 'prob-very-low';
  } else if (p < 0.4) {
    return 'prob-low';
  } else if (p < 0.6) {
    return 'prob-medium';
  } else if (p < 0.8) {
    return 'prob-high';
  } else {
    return 'prob-very-high';
  }
}
