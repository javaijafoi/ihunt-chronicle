import { useState } from 'react';
import { Plus, Pencil, Trash2, Save, X, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useRules } from '@/contexts/RulesContext';
import { useToast } from '@/hooks/use-toast';
import type { DriveName, ResolvedDrive } from '@/types/rules';

interface DriveFormData {
  id: DriveName | '';
  name: string;
  icon: string;
  summary: string;
}

const emptyForm: DriveFormData = {
  id: '',
  name: '',
  icon: '',
  summary: '',
};

const DRIVE_ID_OPTIONS: { value: DriveName; label: string }[] = [
  { value: 'malina', label: 'Malina' },
  { value: 'cavalo', label: 'Cavalo' },
  { value: 'fui', label: 'Fui' },
  { value: 'os66', label: 'Os 66' },
];

export function AdminDrivesTab() {
  const { drives, refetch } = useRules();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingDrive, setEditingDrive] = useState<ResolvedDrive | null>(null);
  const [formData, setFormData] = useState<DriveFormData>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedDrives, setExpandedDrives] = useState<Set<string>>(new Set());

  const toggleExpanded = (driveId: string) => {
    setExpandedDrives(prev => {
      const newSet = new Set(prev);
      if (newSet.has(driveId)) {
        newSet.delete(driveId);
      } else {
        newSet.add(driveId);
      }
      return newSet;
    });
  };

  const openCreate = () => {
    setEditingDrive(null);
    setFormData(emptyForm);
    setIsOpen(true);
  };

  const openEdit = (drive: ResolvedDrive) => {
    setEditingDrive(drive);
    setFormData({
      id: drive.id,
      name: drive.name,
      icon: drive.icon,
      summary: drive.summary,
    });
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.id) {
      toast({ title: 'Erro', description: 'ID e Nome são obrigatórios', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      // Get existing drive to preserve maneuver references
      const existingDrive = drives.find(d => d.id === formData.id);
      
      await setDoc(doc(db, 'system_drives', formData.id), {
        id: formData.id,
        name: formData.name.trim(),
        icon: formData.icon.trim(),
        summary: formData.summary.trim(),
        freeManeuverIds: existingDrive?.freeManeuvers.map(m => m.id) || [],
        exclusiveManeuverIds: existingDrive?.exclusiveManeuvers.map(m => m.id) || [],
        updatedAt: serverTimestamp(),
        ...(editingDrive ? {} : { createdAt: serverTimestamp() }),
      }, { merge: true });

      toast({ 
        title: editingDrive ? 'Tara atualizada' : 'Tara criada',
        description: `"${formData.name}" foi ${editingDrive ? 'atualizada' : 'criada'} com sucesso.`
      });
      
      setIsOpen(false);
      await refetch();
    } catch (err) {
      console.error('[AdminDrivesTab] Save error:', err);
      toast({ title: 'Erro ao salvar', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (drive: ResolvedDrive) => {
    if (!confirm(`Excluir a tara "${drive.name}"? Esta ação não pode ser desfeita.\n\nNota: As manobras associadas não serão excluídas.`)) return;

    try {
      await deleteDoc(doc(db, 'system_drives', drive.id));
      toast({ title: 'Tara excluída', description: `"${drive.name}" foi removida.` });
      await refetch();
    } catch (err) {
      console.error('[AdminDrivesTab] Delete error:', err);
      toast({ title: 'Erro ao excluir', description: (err as Error).message, variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Taras
          </CardTitle>
          <CardDescription>
            Gerencie as taras (especializações de caçador). ({drives.length} taras)
            <br />
            <span className="text-xs">Para gerenciar manobras de taras, use a aba "Manobras".</span>
          </CardDescription>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Tara
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDrive ? 'Editar Tara' : 'Nova Tara'}</DialogTitle>
              <DialogDescription>
                {editingDrive ? 'Atualize os dados da tara.' : 'Preencha os dados para criar uma nova tara.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="id">ID (identificador único)</Label>
                <select
                  id="id"
                  value={formData.id}
                  onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value as DriveName }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  disabled={!!editingDrive}
                >
                  <option value="">Selecione...</option>
                  {DRIVE_ID_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Malinas (Os Sabichões)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Ícone (emoji)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="Ex: 📚"
                  maxLength={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Resumo</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Descrição breve da tara..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {drives.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma tara cadastrada. Use o botão "Importar Regras Iniciais" ou crie uma nova.
            </p>
          ) : (
            drives.map(drive => (
              <Collapsible
                key={drive.id}
                open={expandedDrives.has(drive.id)}
                onOpenChange={() => toggleExpanded(drive.id)}
              >
                <div className="rounded-lg border bg-card overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{drive.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{drive.name}</span>
                            <Badge variant="outline" className="text-xs">{drive.id}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{drive.summary}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(drive); }}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(drive); }}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                        {expandedDrives.has(drive.id) ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-3 border-t pt-3">
                      {/* Free Maneuvers */}
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-green-500">Manobras Grátis</h4>
                        {drive.freeManeuvers.length === 0 ? (
                          <p className="text-xs text-muted-foreground">Nenhuma manobra grátis associada.</p>
                        ) : (
                          <div className="space-y-1">
                            {drive.freeManeuvers.map(m => (
                              <div key={m.id} className="text-sm p-2 rounded bg-muted/50">
                                <span className="font-medium">{m.name}</span>
                                <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Exclusive Maneuvers */}
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-primary">Manobras Exclusivas</h4>
                        {drive.exclusiveManeuvers.length === 0 ? (
                          <p className="text-xs text-muted-foreground">Nenhuma manobra exclusiva associada.</p>
                        ) : (
                          <div className="space-y-1">
                            {drive.exclusiveManeuvers.map(m => (
                              <div key={m.id} className="text-sm p-2 rounded bg-muted/50">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{m.name}</span>
                                  <Badge variant="secondary" className="text-xs">{m.cost} refresh</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
