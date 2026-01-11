import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { IdentityStep, MonsterData } from "./steps/IdentityStep";
import { AspectsStep } from "./steps/AspectsStep";
import { SkillsStep } from "./steps/SkillsStep";
import { StuntsStep } from "./steps/StuntsStep";
import { StressStep } from "./steps/StressStep";
import { ReviewStep } from "./steps/ReviewStep";

// Placeholder steps
const STEPS = [
    { id: "identity", label: "Identidade" },
    { id: "aspects", label: "Aspectos" },
    { id: "skills", label: "Perícias" },
    { id: "stunts", label: "Proezas" },
    { id: "stress", label: "Estresse" },
    { id: "review", label: "Revisão" },
];

const INITIAL_DATA: MonsterData = {
    name: "",
    clado: "",
    subtipo: "",
    description: "",
    avatar: "",
    highConcept: "",
    trouble: "",
    otherAspects: [],
    skills: {},
    stunts: [],
    stressTotal: 2,
    consequences: {
        mild: null,
        moderate: null,
        severe: null
    }
};

export const MonsterWizard = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [monsterData, setMonsterData] = useState<MonsterData>(INITIAL_DATA);

    const updateData = (updates: Partial<MonsterData>) => {
        setMonsterData((prev) => ({ ...prev, ...updates }));
    };

    const nextStep = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return <IdentityStep data={monsterData} updateData={updateData} />;
            case 1:
                return <AspectsStep data={monsterData} updateData={updateData} />;
            case 2:
                return <SkillsStep data={monsterData} updateData={updateData} />;
            case 3:
                return <StuntsStep data={monsterData} updateData={updateData} />;
            case 4:
                return <StressStep data={monsterData} updateData={updateData} />;
            case 5:
                return <ReviewStep data={monsterData} />;
            default:
                return null;
        }
    };

    const progress = ((currentStep + 1) / STEPS.length) * 100;

    return (
        <div className="space-y-8">
            {/* Wizard Progress */}
            <div className="space-y-4">
                <div className="flex justify-between text-sm text-neutral-400">
                    <span>Passo {currentStep + 1} de {STEPS.length}</span>
                    <span>{STEPS[currentStep].label}</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between hidden md:flex">
                    {STEPS.map((step, index) => (
                        <div
                            key={step.id}
                            className={`text-xs ${index <= currentStep ? "text-red-400 font-medium" : "text-neutral-600"
                                }`}
                        >
                            {step.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <Card className="min-h-[400px] p-6 bg-neutral-900 border-neutral-800">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
                <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="w-32 bg-transparent border-neutral-700 hover:bg-neutral-800"
                >
                    Anterior
                </Button>
                {currentStep < STEPS.length - 1 && (
                    <Button
                        onClick={nextStep}
                        className="w-32 bg-red-600 hover:bg-red-700 text-white"
                    >
                        Próximo
                    </Button>
                )}
            </div>
        </div>
    );
};
