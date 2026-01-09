import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LogIn,
  UserCircle,
  Loader2,
  LogOut,
  AlertCircle,
  Crown,
  Sword,
  Users,
  MapPin,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSession, GLOBAL_SESSION_ID } from '@/hooks/useSession';
import { usePartyCharacters } from '@/hooks/usePartyCharacters';
import { useScenes } from '@/hooks/useScenes';

export function LobbyPage() {
  const navigate = useNavigate();
  const { userProfile, loading: authLoading, signInWithGoogle, signInAnonymously, signOut } = useAuth();
  const { claimGmRole, currentSession, joinAsGM } = useSession();
  const { partyCharacters } = usePartyCharacters();

  // Check if user is GM to show all scenes or just active
  const isGM = currentSession?.gmId === userProfile?.uid;
  const { scenes, activeScene, createScene } = useScenes(GLOBAL_SESSION_ID, isGM);

  const [authError, setAuthError] = useState('');
  const [actionError, setActionError] = useState('');
  const [gmActionLoading, setGmActionLoading] = useState(false);

  // Create default scene if none exists (GM action)
  useEffect(() => {
    const createDefaultScene = async () => {
      if (currentSession && scenes.length === 0 && isGM && !activeScene) {
        await createScene({
          name: 'Beco Escuro',
          background: '',
          aspects: [
            { id: crypto.randomUUID(), name: 'Sombras Densas', freeInvokes: 1, createdBy: 'gm', isTemporary: false },
            { id: crypto.randomUUID(), name: 'Lixo e Entulho', freeInvokes: 0, createdBy: 'gm', isTemporary: false },
            { id: crypto.randomUUID(), name: 'Silêncio Opressivo', freeInvokes: 0, createdBy: 'gm', isTemporary: false },
          ],
          isActive: true,
        });
      }
    };
    createDefaultScene();
  }, [isGM, scenes.length, activeScene, createScene, currentSession]);

  // Redirect to VTT if authenticated
  useEffect(() => {
    if (userProfile) {
      navigate('/vtt');
    }
  }, [userProfile, navigate]);

  // Show login if not authenticated
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        {/* Background Grid */}
        <div
          className="fixed inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center"
        >
          <h1 className="font-display text-6xl mb-4">
            <span className="text-primary text-glow-primary">#i</span>
            <span className="text-foreground">HUNT</span>
          </h1>
          <p className="text-muted-foreground font-ui mb-8">
            Virtual Tabletop para caçadores de monstros
          </p>

          <div className="glass-panel p-8 max-w-md mx-auto space-y-4">
            <h2 className="font-display text-xl mb-6">Entrar</h2>

            {authLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {authError && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-destructive">{authError}</p>
                  </div>
                )}

                <button
                  onClick={async () => {
                    try {
                      setAuthError('');
                      await signInWithGoogle();
                    } catch (e: any) {
                      setAuthError(e.message || 'Erro ao fazer login');
                    }
                  }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg
                           bg-primary text-primary-foreground font-ui
                           hover:bg-primary/90 transition-colors"
                >
                  <LogIn className="w-5 h-5" />
                  Entrar com Google
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">ou</span>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    try {
                      setAuthError('');
                      await signInAnonymously();
                    } catch (e: any) {
                      setAuthError(e.message || 'Erro ao entrar como visitante');
                    }
                  }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg
                           bg-muted text-foreground font-ui
                           hover:bg-muted/80 transition-colors"
                >
                  <UserCircle className="w-5 h-5" />
                  Entrar como Visitante
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Loading state while redirecting
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
