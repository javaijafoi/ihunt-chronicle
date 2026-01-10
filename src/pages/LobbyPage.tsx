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
  Sparkles,
  Mail
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSession, GLOBAL_SESSION_ID } from '@/hooks/useSession';
import { usePartyCharacters } from '@/hooks/usePartyCharacters';
import { useScenes } from '@/hooks/useScenes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function LobbyPage() {
  const navigate = useNavigate();
  const { userProfile, loading: authLoading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
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

                {/* Google Login */}
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
                           bg-background border border-border text-foreground font-ui
                           hover:bg-muted transition-colors relative group"
                >
                  <img src="https://www.google.com/favicon.ico" alt="G" className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                  Entrar com Google
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">ou continue com email</span>
                  </div>
                </div>

                {/* Email/Password Form */}
                <AuthForm
                  onError={setAuthError}
                  signInWithEmail={signInWithEmail}
                  signUpWithEmail={signUpWithEmail}
                />
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

// Auth Form Component
function AuthForm({
  onError,
  signInWithEmail,
  signUpWithEmail
}: {
  onError: (msg: string) => void;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string, n: string) => Promise<void>;
}) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      onError('Preencha email e senha.');
      return;
    }
    if (isRegistering && !name) {
      onError('Preencha seu nome.');
      return;
    }

    setLoading(true);
    onError('');

    try {
      if (isRegistering) {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') onError('Email ou senha incorretos.');
      else if (err.code === 'auth/email-already-in-use') onError('Este email já está em uso.');
      else if (err.code === 'auth/weak-password') onError('Senha muito fraca (min 6 caracteres).');
      else onError('Erro na autenticação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-2">
        {isRegistering && (
          <div className="space-y-1">
            <Label htmlFor="name">Nome de Caçador</Label>
            <Input
              id="name"
              placeholder="Como quer ser chamado?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="bg-background/50"
            />
          </div>
        )}

        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              className="pl-9 bg-background/50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="******"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="bg-background/50"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {isRegistering ? 'Criar Conta' : 'Entrar com Email'}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-sm text-primary hover:underline"
        >
          {isRegistering ? 'Já tenho conta. Fazer Login.' : 'Não tem conta? Cadastre-se.'}
        </button>
      </div>
    </form>
  );
}
