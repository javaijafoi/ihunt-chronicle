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
import { CharacterSeeder } from '@/components/vtt/CharacterSeeder';

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

  // Get current scene info - use activeScene from hook or fallback
  const currentActiveScene = activeScene || currentSession?.currentScene;
  const onlineCount = partyCharacters.filter(p => p.isOnline).length;

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

  const handlePlayAsHunter = () => {
    navigate('/vtt', { state: { isGM: false } });
  };

  const handleAssumeAsGm = async () => {
    setActionError('');

    if (!currentSession) {
      setActionError('Sessão não disponível no momento. Tente novamente.');
      return;
    }

    setGmActionLoading(true);

    try {
      const gmId = currentSession.gmId;

      if (!gmId || gmId === userProfile.uid) {
        await claimGmRole();
        navigate('/vtt', { state: { isGM: true } });
        return;
      }

      const confirmed = confirm('Golpe de Estado: deseja assumir a mesa como Mestre?');

      if (confirmed) {
        await claimGmRole();
        navigate('/vtt', { state: { isGM: true } });
      }
    } catch (error) {
      console.error('Erro ao assumir como Mestre:', error);
      setActionError('Não foi possível assumir como Mestre. Tente novamente.');
    } finally {
      setGmActionLoading(false);
    }
  };

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
        className="relative z-10 w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl mb-2">
            <span className="text-primary text-glow-primary">#i</span>
            <span className="text-foreground">HUNT</span>
            <span className="text-muted-foreground text-2xl ml-3">VTT</span>
          </h1>
        </div>

        {/* Session Status Card */}
        {currentSession && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-4 mb-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-sm">{currentSession.name}</h3>
                <p className="text-xs text-muted-foreground">Sessão Ativa</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-fate-plus animate-pulse" />
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Current Scene */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-secondary" />
                  <span className="text-[10px] uppercase text-muted-foreground font-ui tracking-wider">Cena Atual</span>
                </div>
                <p className="font-display text-sm truncate">
                  {currentActiveScene?.name || 'Nenhuma cena'}
                </p>
              </div>

              {/* Players Online */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] uppercase text-muted-foreground font-ui tracking-wider">Jogadores</span>
                </div>
                <p className="font-display text-sm">
                  {onlineCount} online
                </p>
              </div>
            </div>

            {/* Scene Aspects Preview */}
            {currentActiveScene?.aspects && currentActiveScene.aspects.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-[10px] uppercase text-muted-foreground font-ui tracking-wider mb-2">Aspectos da Cena</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentActiveScene.aspects.slice(0, 3).map((aspect, i) => (
                    <span 
                      key={aspect.id || i} 
                      className="px-2 py-0.5 rounded text-xs bg-secondary/20 text-secondary border border-secondary/30"
                    >
                      {aspect.name}
                    </span>
                  ))}
                  {currentActiveScene.aspects.length > 3 && (
                    <span className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                      +{currentActiveScene.aspects.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* User Info */}
        <div className="glass-panel p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {userProfile.photoURL ? (
              <img 
                src={userProfile.photoURL} 
                alt={userProfile.displayName || 'User'}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-primary" />
              </div>
            )}
            <div>
              <p className="font-display text-sm">{userProfile.displayName}</p>
              <p className="text-xs text-muted-foreground">
                {userProfile.isAnonymous ? 'Visitante' : 'Conectado'}
              </p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="Sair"
          >
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Main Content */}
        <div className="glass-panel p-6 space-y-4">
          <h2 className="font-display text-xl text-center">Escolha como entrar</h2>

          {actionError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-destructive">{actionError}</p>
            </div>
          )}
          
          <button
            onClick={handlePlayAsHunter}
            className="w-full flex items-center justify-between p-4 rounded-lg
                     bg-primary/10 hover:bg-primary/20 border border-primary/20
                     transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Sword className="w-6 h-6 text-primary" />
              <div className="text-left">
                <p className="font-display">Jogar como Caçador</p>
                <p className="text-xs text-muted-foreground">Entrar como jogador na sessão</p>
              </div>
            </div>
            <LogIn className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={handleAssumeAsGm}
            disabled={gmActionLoading}
            className="w-full flex items-center justify-between p-4 rounded-lg
                     bg-accent/10 hover:bg-accent/20 border border-accent/20
                     transition-colors group disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-accent" />
              <div className="text-left">
                <p className="font-display">Assumir como Mestre</p>
                <p className="text-xs text-muted-foreground">Tomar o controle da mesa</p>
              </div>
            </div>
            {gmActionLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
            ) : (
              <LogIn className="w-5 h-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
        </div>
      </motion.div>
      <div className="fixed bottom-4 right-4 z-50">
        <CharacterSeeder />
      </div>
    </div>
  );
}
