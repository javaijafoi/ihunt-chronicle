import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  LogIn, 
  UserCircle, 
  Plus, 
  Users, 
  ArrowRight,
  Loader2,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSession } from '@/hooks/useSession';

export function LobbyPage() {
  const navigate = useNavigate();
  const { userProfile, loading: authLoading, signInWithGoogle, signInAnonymously, signOut } = useAuth();
  const { createSession, joinSession, loading: sessionLoading } = useSession();
  
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [sessionName, setSessionName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

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
                <button
                  onClick={signInWithGoogle}
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
                  onClick={signInAnonymously}
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

  const handleCreateSession = async () => {
    if (!sessionName.trim()) {
      setError('Digite um nome para a sessão');
      return;
    }
    
    setError('');
    const id = await createSession(sessionName.trim());
    if (id) {
      navigate('/vtt');
    } else {
      setError('Erro ao criar sessão');
    }
  };

  const handleJoinSession = async () => {
    if (!joinCode.trim()) {
      setError('Digite o código da sessão');
      return;
    }
    
    setError('');
    // For now, we'll join without a character and select one in CharacterSelect
    // This is a simplified flow
    navigate('/vtt', { state: { pendingSessionId: joinCode.trim() } });
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
        <div className="glass-panel p-6">
          <AnimatePresence mode="wait">
            {mode === 'menu' && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <h2 className="font-display text-xl text-center mb-6">O que deseja fazer?</h2>
                
                <button
                  onClick={() => navigate('/vtt')}
                  className="w-full flex items-center justify-between p-4 rounded-lg
                           bg-primary/10 hover:bg-primary/20 border border-primary/20
                           transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <UserCircle className="w-6 h-6 text-primary" />
                    <div className="text-left">
                      <p className="font-display">Meus Personagens</p>
                      <p className="text-xs text-muted-foreground">Gerenciar fichas e jogar solo</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={() => setMode('create')}
                  className="w-full flex items-center justify-between p-4 rounded-lg
                           bg-accent/10 hover:bg-accent/20 border border-accent/20
                           transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Plus className="w-6 h-6 text-accent" />
                    <div className="text-left">
                      <p className="font-display">Criar Sessão</p>
                      <p className="text-xs text-muted-foreground">Mestrar uma nova mesa</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={() => setMode('join')}
                  className="w-full flex items-center justify-between p-4 rounded-lg
                           bg-muted hover:bg-muted/80 border border-border
                           transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-foreground" />
                    <div className="text-left">
                      <p className="font-display">Entrar em Sessão</p>
                      <p className="text-xs text-muted-foreground">Juntar-se a uma mesa existente</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </motion.div>
            )}

            {mode === 'create' && (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <button
                  onClick={() => setMode('menu')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Voltar
                </button>
                
                <h2 className="font-display text-xl">Criar Nova Sessão</h2>
                
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Nome da Sessão
                  </label>
                  <input
                    type="text"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="Ex: Caçada em São Paulo"
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border
                             focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <button
                  onClick={handleCreateSession}
                  disabled={sessionLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                           bg-accent text-accent-foreground font-ui
                           hover:bg-accent/90 disabled:opacity-50 transition-colors"
                >
                  {sessionLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Criar Sessão
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {mode === 'join' && (
              <motion.div
                key="join"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <button
                  onClick={() => setMode('menu')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Voltar
                </button>
                
                <h2 className="font-display text-xl">Entrar em Sessão</h2>
                
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Código da Sessão
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Cole o código aqui"
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border
                             focus:border-primary focus:outline-none transition-colors font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Peça o código ao mestre da sessão
                  </p>
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <button
                  onClick={handleJoinSession}
                  disabled={sessionLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                           bg-primary text-primary-foreground font-ui
                           hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {sessionLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Users className="w-5 h-5" />
                      Entrar na Sessão
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
