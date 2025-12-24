declare module '@3d-dice/dice-box' {
  export interface DiceBoxOptions {
    assetPath: string;
    container?: string | HTMLElement;
    id?: string;
    theme?: string;
    themeColor?: string;
    lightIntensity?: number;
    ambientLightIntensity?: number;
    shadowTransparency?: number;
    delay?: number;
    scale?: number;
    gravity?: number;
    offscreen?: boolean;
    preloadThemes?: string[];
    origin?: string;
    suspendSimulation?: boolean;
    [key: string]: unknown;
  }

  export interface RollOptions {
    theme?: string;
    themeColor?: string;
    newStartPoint?: boolean;
  }

  export type DiceNotation =
    | string
    | {
        sides: number | string;
        qty?: number;
        modifier?: number;
        data?: string;
        rollId?: string;
        theme?: string;
      }
    | Array<
        | string
        | {
            sides: number | string;
            qty?: number;
            modifier?: number;
            data?: string;
            rollId?: string;
            theme?: string;
          }
      >;

  export default class DiceBox {
    constructor(options: DiceBoxOptions);
    init(): Promise<this>;
    roll(notation: DiceNotation, options?: RollOptions): Promise<unknown>;
    add(notation: DiceNotation, options?: RollOptions): Promise<unknown>;
    clear(): this;
    show(): this;
    hide(className?: string): this;
    updateConfig(options: Partial<DiceBoxOptions>): Promise<this>;
  }
}
