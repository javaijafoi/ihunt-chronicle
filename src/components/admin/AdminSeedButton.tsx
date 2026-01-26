import { useState } from 'react';
import { Download, Loader2, AlertTriangle, Trash2, Settings2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { seedDatabase, clearAllRules, exportRules, type SeedProgress } from '@/lib/seedRules';
import { useToast } from '@/hooks/use-toast';
import { useRules } from '@/contexts/RulesContext';

interface AdminSeedButtonProps {
  onComplete?: () => void;
}

export function AdminSeedButton({ onComplete }: AdminSeedButtonProps) {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [progress, setProgress] = useState<SeedProgress | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { toast } = useToast();
  const { skillNames, maneuvers, refresh } = useRules();

  const hasData = skillNames.length > 0 || maneuvers.length > 0;

  const handleSeed = async () => {
    setShowConfirm(false);
    setIsSeeding(true);
    setProgress({ current: 0, total: 1, stage: 'skills', message: 'Iniciando...' });

    const result = await seedDatabase((p) => setProgress(p));

    if (result.success) {
      toast({
        title: 'Importação concluída!',
        description: 'Todas as regras foram importadas com sucesso.',
      });
      onComplete?.();
    } else {
      toast({
        title: 'Erro na importação',
        description: result.error,
        variant: 'destructive',
      });
    }

    setIsSeeding(false);
    setProgress(null);
    refresh(); // Refresh context
  };

  const handleClear = async () => {
    setShowClearConfirm(false);
    setIsClearing(true);

    const result = await clearAllRules();

    if (result.success) {
      toast({
        title: 'Dados limpos!',
        description: 'Todas as regras foram removidas do Firestore.',
      });
      onComplete?.();
    } else {
      toast({
        title: 'Erro ao limpar',
        description: result.error,
        variant: 'destructive',
      });
    }

    setIsClearing(false);
    refresh(); // Refresh context
  };

  const progressPercent = progress ? (progress.current / progress.total) * 100 : 0;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings2 className="w-4 h-4" />
            Ferramentas
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Gerenciar Regras</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {!hasData && (
            <DropdownMenuItem onClick={() => setShowConfirm(true)} disabled={isSeeding || isClearing}>
              <Download className="w-4 h-4 mr-2" />
              Importar Regras Iniciais
            </DropdownMenuItem>
          )}

          {hasData && (
            <DropdownMenuItem onClick={() => setShowConfirm(true)} disabled={isSeeding || isClearing}>
              <Download className="w-4 h-4 mr-2" />
              Re-importar (Sobrescrever)
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => exportRules()}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Backup (JSON)
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setShowClearConfirm(true)}
            disabled={isSeeding || isClearing}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Tudo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Regras Iniciais</DialogTitle>
            <DialogDescription>
              Esta ação irá importar todos os dados dos arquivos estáticos para o Firestore.
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>
              Dados existentes com os mesmos IDs serão sobrescritos. Esta operação não pode ser desfeita.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSeed}>
              Confirmar Importação
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear Confirmation Dialog */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Limpar Todos os Dados</DialogTitle>
            <DialogDescription>
              Esta ação irá remover TODAS as regras do Firestore.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Perigo!</AlertTitle>
            <AlertDescription>
              Todos os dados de perícias, manobras, dons e taras serão permanentemente excluídos.
              Esta operação NÃO pode ser desfeita.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowClearConfirm(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleClear}>
              Sim, Excluir Tudo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Progress Dialog */}
      <Dialog open={isSeeding} onOpenChange={() => { }}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Importando Regras...</DialogTitle>
            <DialogDescription>
              Por favor, aguarde enquanto os dados são importados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Progress value={progressPercent} />
            <div className="text-sm text-center text-muted-foreground">
              {progress?.message}
            </div>
            <div className="text-xs text-center text-muted-foreground">
              {progress?.current} / {progress?.total} itens
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
