import React from 'react';

export const SectionTitle = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <h3 className={`font-bold uppercase tracking-wider text-sm border-b-2 border-gray-800 mb-3 pb-1 ${className}`}>
        {children}
    </h3>
);

export const SkillRow = ({ label, skills }: { label: string, skills: string[] }) => (
    <div className="flex gap-2 mb-1 text-sm">
        <span className="font-bold w-12 text-right shrink-0">{label}</span>
        <span className="text-gray-700">{skills.join(", ")}</span>
    </div>
);

export const AspectItem = ({ label, value }: { label: string, value: string }) => (
    <div className="mb-2">
        <span className="text-xs font-bold text-gray-500 uppercase block">{label}</span>
        <div className="font-serif italic text-lg leading-snug border-b border-gray-200 pb-1">{value}</div>
    </div>
);

export const Card = ({ title, desc }: { title: string, desc: string }) => (
    <div className="bg-gray-50 border border-gray-200 p-3 rounded mb-2 break-inside-avoid">
        <div className="font-bold text-sm mb-1">{title}</div>
        <div className="text-xs text-gray-600 leading-relaxed">{desc}</div>
    </div>
);

export const StressBox = ({ type, count }: { type: string, count: number }) => (
    <div className="mb-4">
        <div className="font-bold text-xs uppercase mb-1 text-center">{type}</div>
        <div className="flex gap-2 justify-center">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="w-8 h-8 border-2 border-gray-800 rounded-sm flex items-center justify-center text-gray-300 font-bold">
                    {i + 1}
                </div>
            ))}
        </div>
    </div>
);
