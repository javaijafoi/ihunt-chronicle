import { Character } from "../types/game";

export function migrateCharacter(data: any): Character {
    return {
        ...data,
        // Campos novos com valores default se não existirem
        skillManeuvers: data.skillManeuvers ?? [],
        gifts: data.gifts ?? [],
        notes: data.notes ?? '',
        // Manter campos antigos funcionando
        maneuvers: data.maneuvers ?? [],
    };
}
