import { useMemo } from 'react';
import { Character } from '@/types/game';
import { useAuth } from '@/hooks/useAuth';
import { useCampaign } from '@/contexts/CampaignContext';
import { PublicCharacterWizard } from '@/components/characters/PublicCharacterWizard';
import { X } from 'lucide-react';

interface CharacterCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (character: Omit<Character, 'id'>) => void;
  editingCharacter?: Character;
}

const BASE_CHARACTER: Omit<Character, 'id' | 'campaignId' | 'sessionId' | 'createdBy' | 'userId'> = {
  name: '',
  avatar: '',
  drive: undefined,
  aspects: {
    highConcept: '',
    drama: '',
    job: '',
    dreamBoard: '',
    free: [],
  },
  skills: {},
  maneuvers: [],
  selfies: [],
  stress: {
    physical: [false, false, false],
    mental: [false, false, false],
  },
  consequences: {
    mild: null,
    moderate: null,
    severe: null,
  },
  fatePoints: 3,
  refresh: 3,
  skillManeuvers: [],
  gifts: [],
};

const buildDefaultCharacter = (campaignId: string, userId: string): Omit<Character, 'id'> => ({
  ...BASE_CHARACTER,
  campaignId,
  createdBy: userId,
  userId,
});

export function CharacterCreator({ isOpen, onClose, onSave, editingCharacter }: CharacterCreatorProps) {
  const { user } = useAuth();
  const { campaign } = useCampaign();

  const initialData = useMemo(() => {
    if (editingCharacter) return editingCharacter;
    return buildDefaultCharacter(campaign?.id || 'offline', user?.uid || 'anonymous');
  }, [editingCharacter, campaign?.id, user?.uid]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto relative">
          {/* Close Button if not handled inside Wizard's Cancel */}
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 p-2 rounded-full bg-background border border-border shadow-sm z-50 hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>

          <PublicCharacterWizard
            initialData={initialData}
            onSave={(char) => {
              onSave(char);
              onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
