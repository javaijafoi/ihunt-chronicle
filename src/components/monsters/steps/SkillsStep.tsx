import { Button } from "@/components/ui/button";
import { MonsterData } from "./IdentityStep";
import { SKILLS, SKILL_NAMES } from "@/data/skills";
import { motion } from "framer-motion";

interface SkillsStepProps {
    data: MonsterData;
    updateData: (updates: Partial<MonsterData>) => void;
}

export const SkillsStep = ({ data, updateData }: SkillsStepProps) => {
    const updateSkill = (skill: string, value: number) => {
        updateData({
            skills: {
                ...data.skills,
                [skill]: value,
            },
        });
    };

    const getSkillValue = (skill: string) => data.skills[skill] || 0;

    // Render a mini-bar or something for the value
    const renderValueSelector = (skill: string) => {
        const value = getSkillValue(skill);
        return (
            <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4, 5, 6].map((v) => (
                    <button
                        key={v}
                        onClick={() => updateSkill(skill, v)}
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs transition-colors
              ${v === value
                                ? "bg-red-600 text-white font-bold"
                                : v < value
                                    ? "bg-red-900/40 text-red-200"
                                    : "bg-neutral-900 text-neutral-600 hover:bg-neutral-800"
                            }`}
                    >
                        {v}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="space-y-2 text-center">
                <h3 className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                    Habilidades & Perícias
                </h3>
                <p className="text-neutral-400 text-sm">
                    Defina o quão bom o monstro é em cada área. (+0 a +6).
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SKILL_NAMES.map((skillName) => (
                    <motion.div
                        key={skillName}
                        layoutId={`skill-${skillName}`}
                        className={`p-3 rounded-lg border flex flex-col gap-2 transition-colors
               ${getSkillValue(skillName) > 0 ? 'bg-neutral-900 border-red-900/50' : 'bg-neutral-950/50 border-neutral-800'}
            `}
                    >
                        <div className="flex justify-between items-center">
                            <span className={`font-medium ${getSkillValue(skillName) > 0 ? 'text-white' : 'text-neutral-500'}`}>
                                {skillName}
                            </span>
                            <span className="text-lg font-bold text-red-500">
                                +{getSkillValue(skillName)}
                            </span>
                        </div>
                        {renderValueSelector(skillName)}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
