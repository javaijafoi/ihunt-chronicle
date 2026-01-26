import { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Database, Sparkles, Sword, Users, LogOut, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useRules } from '@/contexts/RulesContext';
import { AdminSkillsTab } from '@/components/admin/AdminSkillsTab';
import { AdminManeuversTab } from '@/components/admin/AdminManeuversTab';
import { AdminGiftsTab } from '@/components/admin/AdminGiftsTab';
import { AdminDrivesTab } from '@/components/admin/AdminDrivesTab';
import { AdminSeedButton } from '@/components/admin/AdminSeedButton';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { LayoutDashboard } from 'lucide-react'; // Import Icon

const ADMIN_CREDENTIALS = {
  user: 'Peter',
  pass: '101917',
};

export function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('admin_auth') === 'true'
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const { toast } = useToast();
  const { isLoading, refetch } = useRules();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_CREDENTIALS.user && password === ADMIN_CREDENTIALS.pass) {
      sessionStorage.setItem('admin_auth', 'true');
      setIsAuthenticated(true);
      setLoginError('');
      toast({ title: 'Login realizado!', description: 'Bem-vindo ao painel administrativo.' });
    } else {
      setLoginError('Credenciais inválidas');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
    toast({ title: 'Logout realizado', description: 'Você saiu do painel administrativo.' });
  };

  const handleRefresh = async () => {
    await refetch();
    toast({ title: 'Dados atualizados', description: 'As regras foram recarregadas do Firestore.' });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Painel Administrativo</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar o sistema de regras.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Usuário"
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha"
                  autoComplete="current-password"
                />
              </div>
              {loginError && (
                <p className="text-sm text-destructive">{loginError}</p>
              )}
              <Button type="submit" className="w-full">
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/lobby"
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Database className="w-6 h-6 text-primary" />
              <h1 className="font-display text-xl text-foreground">Sistema de Regras</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AdminSeedButton onComplete={refetch} />
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-3xl">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Sword className="w-4 h-4" />
              Perícias
            </TabsTrigger>
            <TabsTrigger value="maneuvers" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Manobras
            </TabsTrigger>
            <TabsTrigger value="gifts" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Dons
            </TabsTrigger>
            <TabsTrigger value="drives" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Taras
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="skills">
            <AdminSkillsTab />
          </TabsContent>

          <TabsContent value="maneuvers">
            <AdminManeuversTab />
          </TabsContent>

          <TabsContent value="gifts">
            <AdminGiftsTab />
          </TabsContent>

          <TabsContent value="drives">
            <AdminDrivesTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
