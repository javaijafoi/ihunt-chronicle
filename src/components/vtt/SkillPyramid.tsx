import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, X } from 'lucide-react';
import { SKILL_NAMES } from '@/data/skills';

// Pyramid structure: level -> max skills at that level
const PYRAMID_STRUCTURE = {
  4: 1,  // +4: 1 skill (Ótimo)
  3: 2,  // +3: 2 skills (Bom)
  2: 3,  // +2: 3 skills (Razoável)
  1: 4,  // +1: 4 skills (Regular)
};

const LEVEL_NAMES: Record<number, string> = {
  4: 'Ótimo',
  3: 'Bom',
  2: 'Razoável',
  1: 'Regular',
};

interface SkillPyramidProps {
  skills: Record<string, number>;
  onChange: (skills: Record<string, number>) => void;
  readOnly?: boolean;
}

export function SkillPyramid({ skills, onChange, readOnly = false }: SkillPyramidProps) {
  const [customSkill, setCustomSkill] = useState('');

  // Get skills at each level
  const getSkillsAtLevel = (level: number): string[] => {
    return Object.entries(skills)
      .filter(([, value]) => value === level)
      .map(([skill]) => skill);
  };

  // Check if we can add more skills at a level
  const canAddAtLevel = (level: number): boolean => {
    const current = getSkillsAtLevel(level).length;
    const max = PYRAMID_STRUCTURE[level as keyof typeof PYRAMID_STRUCTURE] || 0;
    return current < max;
  };

  // Get available skills (not yet assigned)
  const availableSkills = SKILL_NAMES.filter(skill => !(skill in skills));

  // Add skill at level
  const addSkill = (skill: string, level: number) => {
    if (!canAddAtLevel(level)) return;
    onChange({ ...skills, [skill]: level });
  };

  // Remove skill
  const removeSkill = (skill: string) => {
    const newSkills = { ...skills };
    delete newSkills[skill];
    onChange(newSkills);
  };

  // Move skill up/down
  const moveSkill = (skill: string, direction: 'up' | 'down') => {
    const currentLevel = skills[skill];
    const newLevel = direction === 'up' ? currentLevel + 1 : currentLevel - 1;

    if (newLevel < 1 || newLevel > 4) return;
    if (!canAddAtLevel(newLevel)) return;

    onChange({ ...skills, [skill]: newLevel });
  };

  // Add custom skill
  const addCustomSkill = () => {
    if (!customSkill.trim()) return;
    if (customSkill in skills || SKILL_NAMES.includes(customSkill)) return;
    onChange({ ...skills, [customSkill.trim()]: 1 });
    setCustomSkill('');
  };

  // Count current skills per level
  const counts = {
    4: getSkillsAtLevel(4).length,
    3: getSkillsAtLevel(3).length,
    2: getSkillsAtLevel(2).length,
    1: getSkillsAtLevel(1).length,
  };

  // Check if pyramid is valid
  const isValid =
    counts[4] === 1 &&
    counts[3] === 2 &&
    counts[2] === 3 &&
    counts[1] === 4;

  return (
    <div className="space-y-4">
      {/* Pyramid Levels */}
      {[4, 3, 2, 1].map(level => (
        <div key={level} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-display text-xl text-primary">+{level}</span>
              <span className="text-sm text-muted-foreground font-ui">
                {LEVEL_NAMES[level]}
              </span>
            </div>
            <span className={`text-xs font-mono ${counts[level as keyof typeof counts] === PYRAMID_STRUCTURE[level as keyof typeof PYRAMID_STRUCTURE]
              ? 'text-green-500'
              : 'text-muted-foreground'
              }`}>
              {counts[level as keyof typeof counts]}/{PYRAMID_STRUCTURE[level as keyof typeof PYRAMID_STRUCTURE]}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {getSkillsAtLevel(level).map(skill => (
              <motion.div
                key={skill}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-muted border border-border"
              >
                <span className="font-ui text-sm">{skill}</span>
                {!readOnly && (
                  <div className="flex items-center gap-0.5 ml-2">
                    {level < 4 && canAddAtLevel(level + 1) && (
                      <button
                        onClick={() => moveSkill(skill, 'up')}
                        className="p-0.5 rounded hover:bg-primary/20 transition-colors"
                      >
                        <Plus className="w-3 h-3 text-primary" />
                      </button>
                    )}
                    {level > 1 && (
                      <button
                        onClick={() => moveSkill(skill, 'down')}
                        className="p-0.5 rounded hover:bg-muted-foreground/20 transition-colors"
                      >
                        <Minus className="w-3 h-3 text-muted-foreground" />
                      </button>
                    )}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="p-0.5 rounded hover:bg-destructive/20 transition-colors"
                    >
                      <X className="w-3 h-3 text-destructive" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}

            {/* Add skill dropdown */}
            {!readOnly && canAddAtLevel(level) && (
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addSkill(e.target.value, level);
                    e.target.value = '';
                  }
                }}
                className="px-3 py-1.5 rounded-md bg-input border border-dashed border-border 
                         text-sm font-ui text-muted-foreground cursor-pointer
                         focus:border-primary focus:outline-none"
                defaultValue=""
              >
                <option value="" disabled>+ Adicionar</option>
                {availableSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      ))}

      {/* Custom Skill Input */}
      {!readOnly && (
        <div className="pt-4 border-t border-border">
          <label className="text-xs text-muted-foreground font-ui uppercase tracking-wider mb-2 block">
            Habilidade Personalizada
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomSkill()}
              placeholder="Nome da habilidade..."
              className="flex-1 px-3 py-2 rounded-md bg-input border border-border 
                       focus:border-primary focus:outline-none font-ui text-sm"
            />
            <button
              onClick={addCustomSkill}
              disabled={!customSkill.trim()}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-ui text-sm
                       hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Adicionar
            </button>
          </div>
        </div>
      )}

      {/* Validation Status */}
      <div className={`text-sm font-ui p-3 rounded-md ${isValid
        ? 'bg-green-500/10 text-green-500 border border-green-500/30'
        : 'bg-accent/10 text-accent border border-accent/30'
        }`}>
        {isValid
          ? '✓ Pirâmide completa!'
          : `Adicione: ${1 - counts[4]} em +4, ${2 - counts[3]} em +3, ${3 - counts[2]} em +2, ${4 - counts[1]} em +1`
        }
      </div>
    </div>
  );
}
