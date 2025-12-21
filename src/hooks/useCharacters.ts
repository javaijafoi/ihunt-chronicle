import { useCallback } from 'react';
import { Character } from '@/types/game';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'ihunt-vtt-characters';

export function useCharacters() {
  const [characters, setCharacters] = useLocalStorage<Character[]>(STORAGE_KEY, []);

  const createCharacter = useCallback((character: Omit<Character, 'id'>): Character => {
    const newCharacter: Character = {
      ...character,
      id: crypto.randomUUID(),
    };
    setCharacters(prev => [...prev, newCharacter]);
    return newCharacter;
  }, [setCharacters]);

  const updateCharacter = useCallback((id: string, updates: Partial<Character>) => {
    setCharacters(prev => 
      prev.map(c => c.id === id ? { ...c, ...updates } : c)
    );
  }, [setCharacters]);

  const deleteCharacter = useCallback((id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
  }, [setCharacters]);

  const getCharacter = useCallback((id: string): Character | undefined => {
    return characters.find(c => c.id === id);
  }, [characters]);

  const duplicateCharacter = useCallback((id: string): Character | undefined => {
    const original = characters.find(c => c.id === id);
    if (!original) return undefined;

    const duplicate: Character = {
      ...original,
      id: crypto.randomUUID(),
      name: `${original.name} (cópia)`,
    };
    setCharacters(prev => [...prev, duplicate]);
    return duplicate;
  }, [characters, setCharacters]);

  const exportCharacters = useCallback((): string => {
    return JSON.stringify(characters, null, 2);
  }, [characters]);

  const importCharacters = useCallback((json: string): boolean => {
    try {
      const imported = JSON.parse(json) as Character[];
      if (!Array.isArray(imported)) return false;
      
      // Assign new IDs to avoid conflicts
      const withNewIds = imported.map(c => ({
        ...c,
        id: crypto.randomUUID(),
      }));
      
      setCharacters(prev => [...prev, ...withNewIds]);
      return true;
    } catch {
      return false;
    }
  }, [setCharacters]);

  return {
    characters,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    getCharacter,
    duplicateCharacter,
    exportCharacters,
    importCharacters,
  };
}
