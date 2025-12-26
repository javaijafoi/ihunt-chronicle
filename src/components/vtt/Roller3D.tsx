import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import '@3d-dice/dice-box/dist/style.css';
import type { DiceResult } from '@/types/game';

// Interface pública do componente
export interface Roller3DHandle {
  roll: (result?: DiceResult) => Promise<void>;
}

interface Roller3DProps {
  className?: string;
}

// Mapeia os símbolos do Fate para números que o dice-box entende
// DiceBox (theme: 'fate') mapeia: 1=Plus, 0=Blank, -1=Minus (geralmente)
// Mas para garantir, vamos usar a notação de valores explícitos se necessário.
// Na verdade, o tema 'fate' padrão do dice-box usa faces indexadas. 
// Vamos simplificar: O dice-box aceita resultados explícitos no método roll.
const mapFateToValue = (face: 'plus' | 'minus' | 'blank'): number => {
  switch (face) {
    case 'plus': return 1;
    case 'minus': return -1;
    case 'blank': return 0;
  }
};

export const Roller3D = forwardRef<Roller3DHandle, Roller3DProps>(function Roller3D(
  { className },
  ref
) {
  const [containerId] = useState(() => `roller-3d-${Math.random().toString(36).slice(2, 10)}`);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const diceBoxRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // Inicialização do DiceBox
  useEffect(() => {
    let box: any = null;

    const initDiceBox = async () => {
      // 1. Verifica se o container existe e tem tamanho
      if (!containerRef.current) return;
      
      try {
        // Import dinâmico para não quebrar SSR se houver
        const { default: DiceBox } = await import('@3d-dice/dice-box');

        // 2. Configuração Visual
        // Pega a cor primária do CSS para pintar os dados
        const computedStyle = getComputedStyle(document.documentElement);
        const primaryColor = computedStyle.getPropertyValue('--primary').trim() || '#8b5cf6';

        // Conversão simples de HSL para Hex se necessário seria feita aqui, 
        // mas o dice-box aceita cores bem de boa. Vamos usar um Hex fixo roxo se falhar.
        const themeColor = primaryColor.startsWith('#') ? primaryColor : '#6d28d9'; 

        box = new DiceBox({
          container: `#${containerId}`,
          assetPath: '/assets/', // IMPORTANTE: Caminho relativo à pasta public
          theme: 'default',      // O tema padrão suporta dF se configurado ou se usarmos assets certos
          scale: 6,
          lightIntensity: 1,
          gravity: 3,
          mass: 5,
          friction: 0.8,
        });

        // 3. Carrega os assets
        await box.init();
        
        diceBoxRef.current = box;
        setIsReady(true);
        console.log('🎲 [Roller3D] Sistema de dados pronto.');
      } catch (error) {
        console.error('❌ [Roller3D] Falha ao carregar assets 3D.', error);
        console.warn('DICA: Verifique se rodou "node scripts/copy-dice-assets.mjs"');
      }
    };

    initDiceBox();

    // Cleanup
    return () => {
      if (diceBoxRef.current) {
        // Tenta limpar canvas se a lib suportar ou remove do DOM
        const canvas = containerRef.current?.querySelector('canvas');
        if (canvas) canvas.remove();
      }
    };
  }, [containerId]);

  // Expose roll method
  useImperativeHandle(ref, () => ({
    async roll(result?: DiceResult) {
      const box = diceBoxRef.current;
      
      if (!box || !isReady) {
        console.warn('⚠️ [Roller3D] Tentativa de rolagem antes da inicialização.');
        return;
      }

      if (!result) {
        // Fallback visual sem resultado lógico
        await box.roll('4dF');
        return;
      }

      try {
        console.log('🎲 [Roller3D] Rolando visual:', result.type);
        
        // Mapeia os resultados lógicos para valores físicos
        // Ordem: Dados Fate primeiro
        const fateValues = result.fateDice.map(mapFateToValue);
        
        // Prepara a notação e os resultados
        let notation = '4dF';
        let values = fateValues;

        if (result.type === 'advantage' && result.d6) {
          notation = '3dF+1d6';
          // Se for vantagem, usamos só 3 dados Fate + 1 d6
          // O array fateDice do backend vem com 3 dados nesse caso? 
          // O seu useGameState gera 3 se for advantage.
          values = [...fateValues, result.d6];
        }

        // Mostra o canvas
        box.show();
        
        // Rola com valores forçados para bater com o chat
        // A sintaxe pode variar levemente dependendo da versão, 
        // mas geralmente o segundo argumento força os resultados.
        await box.roll(notation, values);

        // Esconde após 3 segundos
        setTimeout(() => {
          box.hide();
        }, 3500);

      } catch (error) {
        console.error('❌ [Roller3D] Erro na animação:', error);
      }
    },
  }), [isReady]);

  return (
    <div className={`pointer-events-none fixed inset-0 z-50 ${className || ''}`}>
      <div 
        id={containerId} 
        ref={containerRef} 
        className="w-full h-full"
      />
    </div>
  );
});
