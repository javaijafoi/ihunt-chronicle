import { describe, expect, it } from 'vitest';

import { calculateTokenPercentPosition } from './TokenLayer';

describe('calculateTokenPercentPosition', () => {
  const rect = {
    width: 200,
    height: 100,
    left: 10,
    top: 20,
  };

  it('returns null when container has no size', () => {
    expect(
      calculateTokenPercentPosition(
        { x: 10, y: 10 },
        { ...rect, width: 0 },
      ),
    ).toBeNull();
    expect(
      calculateTokenPercentPosition(
        { x: 10, y: 10 },
        { ...rect, height: 0 },
      ),
    ).toBeNull();
  });

  it('converts pointer coordinates to percentages relative to container', () => {
    const result = calculateTokenPercentPosition({ x: 110, y: 70 }, rect);

    expect(result).toEqual({ x: 50, y: 50 });
  });

  it('clamps positions to the container bounds', () => {
    const beyondTopLeft = calculateTokenPercentPosition({ x: 0, y: 0 }, rect);
    const beyondBottomRight = calculateTokenPercentPosition(
      { x: 500, y: 500 },
      rect,
    );

    expect(beyondTopLeft).toEqual({ x: 0, y: 0 });
    expect(beyondBottomRight).toEqual({ x: 100, y: 100 });
  });
});
