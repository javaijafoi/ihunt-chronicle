import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import '@3d-dice/dice-box/dist/style.css';
import type { DiceResult } from '@/types/game';

export interface Roller3DHandle {
  roll: (result?: DiceResult) => Promise<void>;
}

interface Roller3DProps {
  className?: string;
}

export const Roller3D = forwardRef<Roller3DHandle, Roller3DProps>(function Roller3D(
  { className },
  ref
) {
  const [containerId] = useState(() => `roller-3d-${Math.random().toString(36).slice(2, 10)}`);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const diceBoxRef = useRef<any>(null);
  const initPromiseRef = useRef<Promise<void> | null>(null);
  const [isReady, setIsReady] = useState(false);

  const notationFromResult = useCallback((result?: DiceResult) => {
    if (result?.type === 'advantage') {
      return '3dF+1d6';
    }

    return '4dF';
  }, []);

  const valuesFromResult = useCallback((result?: DiceResult) => {
    if (!result) return undefined;

    const fateFaceMap: Record<DiceResult['fateDice'][number], number> = {
      plus: 1,
      minus: -1,
      blank: 0,
    };

    const expectedFateDice = result.type === 'advantage' ? 3 : 4;
    const fateDiceFaces =
      result.fateDice.length >= expectedFateDice
        ? result.fateDice.slice(0, expectedFateDice)
        : [...result.fateDice, ...Array(expectedFateDice - result.fateDice.length).fill('blank')];

    const fateValues = fateDiceFaces.map(face => fateFaceMap[face]);

    if (result.type === 'advantage' && typeof result.d6 === 'number') {
      return [...fateValues, result.d6];
    }

    return fateValues;
  }, []);

  useEffect(() => {
    let isMounted = true;
    let box: any = null;

    const initialize = async () => {
      const container = containerRef.current;
      if (!container) {
        console.warn('[Roller3D] Container not found');
        return;
      }

      // Wait for container to have dimensions
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        console.warn('[Roller3D] Container has no dimensions, waiting...');
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      try {
        const { default: DiceBox } = await import('@3d-dice/dice-box');

        // Get theme color from CSS
        const computedStyle = getComputedStyle(document.documentElement);
        const primaryHsl = computedStyle.getPropertyValue('--primary').trim();
        let themeColor = '#8b5cf6'; // fallback purple

        if (primaryHsl) {
          // Convert HSL to hex if needed
          const hslMatch = primaryHsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
          if (hslMatch) {
            const [, h, s, l] = hslMatch.map(Number);
            themeColor = hslToHex(h, s, l);
          }
        }

        box = new DiceBox({
          container: `#${containerId}`,
          assetPath: '/assets/',
          theme: 'default',
          themeColor,
          scale: 6,
          lightIntensity: 1.2,
          shadowTransparency: 0.7,
          gravity: 2,
          spinForce: 4,
          throwForce: 5,
        });

        await box.init();

        if (isMounted) {
          diceBoxRef.current = box;
          setIsReady(true);
          console.log('[Roller3D] Initialized successfully');
        } else {
          box.clear?.();
        }
      } catch (error) {
        console.error('[Roller3D] Initialization failed:', error);
      }
    };

    initPromiseRef.current = initialize();

    return () => {
      isMounted = false;
      if (diceBoxRef.current) {
        diceBoxRef.current.clear?.();
        diceBoxRef.current = null;
      }
      setIsReady(false);
    };
  }, [containerId]);

  useImperativeHandle(ref, () => ({
    async roll(result?: DiceResult) {
      if (initPromiseRef.current) {
        await initPromiseRef.current;
      }

      const box = diceBoxRef.current;
      if (!box || !isReady) {
        console.warn('[Roller3D] DiceBox not ready, skipping roll');
        return;
      }

      try {
        const notation = notationFromResult(result);
        const values = valuesFromResult(result);
        console.log('[Roller3D] Rolling:', notation);

        box.show();

        if (values) {
          await box.roll(notation, values);
        } else {
          await box.roll(notation);
        }

        setTimeout(() => {
          box.hide?.();
        }, 3000);
      } catch (error) {
        console.error('[Roller3D] Roll failed:', error);
      }
    },
  }), [isReady, notationFromResult, valuesFromResult]);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-50 ${className ?? ''}`}
      aria-hidden="true"
    >
      <div 
        id={containerId} 
        ref={containerRef} 
        className="w-full h-full"
        style={{ minHeight: '100vh', minWidth: '100vw' }}
      />
    </div>
  );
});

// Helper function to convert HSL to Hex
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
