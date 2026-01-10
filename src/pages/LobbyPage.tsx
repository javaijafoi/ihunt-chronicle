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
  Mail,
  BookOpen,
  Plus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getDocs, query, where, collection, setDoc, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';


// ... inputs



export function LobbyPage() {
  const navigate = useNavigate();
  const { userProfile, loading: authLoading, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, signOut } = useAuth();

  // Dashboard State
  const [myCampaigns, setMyCampaigns] = useState<any[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [joinCode, setJoinCode] = useState("");


  // Fetch Campaigns
  useEffect(() => {
    if (!userProfile) {
      setMyCampaigns([]);
      return;
    }

    const fetchCampaigns = async () => {
      setLoadingCampaigns(true);
      console.log("Fetching campaigns with V2 query (array-contains)...");
      try {
        // Query campaigns using array-contains on the 'members' field
        const q = query(
          collection(db, 'campaigns'),
          where('members', 'array-contains', userProfile.uid)
        );
        const querySnapshot = await getDocs(q);
        const campaigns = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setMyCampaigns(campaigns);
      } catch (e) {
        console.error(e);
      }
      setLoadingCampaigns(false);
    };

    fetchCampaigns();
  }, [userProfile]);

  const handleJoin = async () => {
    if (!joinCode) return;
    console.log("Join", joinCode);
  };

  // Guard against null profile
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
                {/* Google Login */}
                <button
                  onClick={async () => {
                    try {
                      await signInWithGoogle();
                    } catch (e: any) {
                      console.error(e);
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

                <AuthForm
                  onError={(msg) => console.log(msg)}
                  signInWithEmail={signInWithEmail}
                  signUpWithEmail={signUpWithEmail}
                  resetPassword={resetPassword}
                />
              </>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Dashboard UI (Authenticated)
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between pb-6 border-b border-border">
          <div>
            <h1 className="font-display text-3xl">Lobby de Caçadores</h1>
            <p className="text-muted-foreground">Bem-vindo, {userProfile.displayName}</p>
          </div>
          <div className="flex items-center gap-4">

            <Button variant="outline" className="gap-2" onClick={() => signOut()}>
              <LogOut className="w-4 h-4" /> Sair
            </Button>
          </div>
        </header>



        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content: Campaign List */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Minhas Crônicas
              </h2>
            </div>

            {loadingCampaigns ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
            ) : myCampaigns.length === 0 ? (
              <div className="text-center p-12 border border-dashed rounded-xl bg-muted/20">
                <p className="text-muted-foreground mb-4">Você não está participando de nenhuma crônica.</p>
                <Button onClick={() => navigate('/campaigns/new')}>Criar Nova Crônica</Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {myCampaigns.map(camp => (
                  <div key={camp.id} className="p-4 border rounded-lg bg-card hover:border-primary transition-colors cursor-pointer" onClick={() => navigate(`/campaign/${camp.id}`)}>
                    <h3 className="font-bold text-lg">{camp.title}</h3>
                    <p className="text-sm text-muted-foreground">{camp.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: Actions */}
          <div className="space-y-6">
            <div className="p-6 rounded-xl border bg-card space-y-4">
              <h3 className="font-bold">Ações Rápidas</h3>
              <Button className="w-full gap-2" onClick={() => navigate('/campaigns/new')}>
                <Plus className="w-4 h-4" /> Criar Crônica
              </Button>

              <div className="pt-4 border-t">
                <Label>Entrar com Código</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="HUNT-XXXX" className="uppercase" />
                  <Button variant="secondary" onClick={handleJoin}>Entrar</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Auth Form Component Reuse
function AuthForm({
  onError,
  signInWithEmail,
  signUpWithEmail,
  resetPassword
}: {
  onError: (msg: string) => void;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string, n: string) => Promise<void>;
  resetPassword: (e: string) => Promise<void>;
}) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      onError('Digite seu email para recuperar a senha.');
      return;
    }
    setLoading(true);
    onError('');
    try {
      await resetPassword(email);
      onError('Email de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') onError('Email não cadastrado.');
      else onError('Erro ao enviar email. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

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
          {!isRegistering && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
                disabled={loading}
              >
                Esqueci minha senha
              </button>
            </div>
          )}
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
