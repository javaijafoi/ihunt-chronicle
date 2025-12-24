import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
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
  const initializationRef = useRef<Promise<void> | null>(null);

  const notationFromResult = useMemo(
    () =>
      function notation(result?: DiceResult) {
        if (!result) {
          return '4d6';
        }

        // Standard Fate roll uses 4 dice. Advantage adds a d6 alongside 3 Fate dice,
        // so we keep four dice on the table for visual parity.
        const standardDice = { sides: 6, qty: 4 };

        return result.type === 'advantage'
          ? [
              { sides: 6, qty: 3 },
              { sides: 6, qty: 1 },
            ]
          : standardDice;
      },
    []
  );

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      if (!containerRef.current) return;

      try {
        const { default: DiceBox } = await import('@3d-dice/dice-box');

        const primaryColor = getComputedStyle(document.documentElement)
          .getPropertyValue('--primary')
          .trim();

        const box = new DiceBox({
          container: `#${containerId}`,
          assetPath: '/assets/',
          theme: 'default',
          themeColor: primaryColor || '#8b5cf6',
          lightIntensity: 1.2,
          ambientLightIntensity: 0.9,
          shadowTransparency: 0.7,
          delay: 200,
        });

        await box.init();

        if (isMounted) {
          diceBoxRef.current = box;
        } else {
          box.clear();
        }
      } catch (error) {
        console.error('Erro ao inicializar o Roller3D:', error);
      }
    };

    initializationRef.current = initialize();

    return () => {
      isMounted = false;
      diceBoxRef.current?.clear();
      diceBoxRef.current = null;
    };
  }, [containerId]);

  useImperativeHandle(ref, () => ({
    async roll(result?: DiceResult) {
      try {
        await initializationRef.current;

        if (!diceBoxRef.current) return;

        diceBoxRef.current.show();
        await diceBoxRef.current.roll(notationFromResult(result));
      } catch (error) {
        console.error('Falha ao rolar dados em 3D:', error);
      }
    },
  }));

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-50 ${className ?? ''}`}
      aria-hidden="true"
    >
      <div id={containerId} ref={containerRef} className="w-full h-full" />
    </div>
  );
});
