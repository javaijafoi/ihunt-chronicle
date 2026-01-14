import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Save, X, Filter } from 'lucide-react';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useRules } from '@/contexts/RulesContext';
import { useToast } from '@/hooks/use-toast';
import type { SystemManeuver, ManeuverType, DriveName } from '@/types/rules';

const TYPE_LABELS: Record<ManeuverType, string> = {
  skill: 'Perícia',
  drive_free: 'Tara (Grátis)',
  drive_exclusive: 'Tara (Exclusiva)',
  general: 'Geral',
};

interface ManeuverFormData {
  name: string;
  description: string;
  type: ManeuverType;
  skillId: string;
  driveId: DriveName | '';
  cost: number;
}

const emptyForm: ManeuverFormData = {
  name: '',
  description: '',
  type: 'skill',
  skillId: '',
  driveId: '',
  cost: 1,
};

export function AdminManeuversTab() {
  const { allManeuvers, skills, drives, refetch } = useRules();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingManeuver, setEditingManeuver] = useState<SystemManeuver | null>(null);
  const [formData, setFormData] = useState<ManeuverFormData>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [filterType, setFilterType] = useState<ManeuverType | 'all'>('all');
  const [filterSkill, setFilterSkill] = useState<string>('all');
  const [filterDrive, setFilterDrive] = useState<string>('all');

  const filteredManeuvers = useMemo(() => {
    return allManeuvers.filter(m => {
      if (filterType !== 'all' && m.type !== filterType) return false;
      if (filterSkill !== 'all' && m.skillId !== filterSkill) return false;
      if (filterDrive !== 'all' && m.driveId !== filterDrive) return false;
      return true;
    });
  }, [allManeuvers, filterType, filterSkill, filterDrive]);

  const openCreate = () => {
    setEditingManeuver(null);
    setFormData(emptyForm);
    setIsOpen(true);
  };

  const openEdit = (maneuver: SystemManeuver) => {
    setEditingManeuver(maneuver);
    setFormData({
      name: maneuver.name,
      description: maneuver.description,
      type: maneuver.type,
      skillId: maneuver.skillId || '',
      driveId: maneuver.driveId || '',
      cost: maneuver.cost,
    });
    setIsOpen(true);
  };

  const generateId = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }

    if (formData.type === 'skill' && !formData.skillId) {
      toast({ title: 'Erro', description: 'Selecione uma perícia', variant: 'destructive' });
      return;
    }

    if ((formData.type === 'drive_free' || formData.type === 'drive_exclusive') && !formData.driveId) {
      toast({ title: 'Erro', description: 'Selecione uma tara', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const id = editingManeuver?.id || generateId(formData.name);
      
      const data: Partial<SystemManeuver> = {
        id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        cost: formData.type === 'drive_free' ? 0 : formData.cost,
        updatedAt: serverTimestamp() as any,
      };

      if (formData.type === 'skill') {
        data.skillId = formData.skillId;
        data.driveId = undefined;
      } else if (formData.type === 'drive_free' || formData.type === 'drive_exclusive') {
        data.driveId = formData.driveId as DriveName;
        data.skillId = undefined;
      } else {
        data.skillId = undefined;
        data.driveId = undefined;
      }

      if (!editingManeuver) {
        (data as any).createdAt = serverTimestamp();
      }

      await setDoc(doc(db, 'system_maneuvers', id), data, { merge: true });

      toast({ 
        title: editingManeuver ? 'Manobra atualizada' : 'Manobra criada',
        description: `"${formData.name}" foi ${editingManeuver ? 'atualizada' : 'criada'} com sucesso.`
      });
      
      setIsOpen(false);
      await refetch();
    } catch (err) {
      console.error('[AdminManeuversTab] Save error:', err);
      toast({ title: 'Erro ao salvar', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (maneuver: SystemManeuver) => {
    if (!confirm(`Excluir a manobra "${maneuver.name}"? Esta ação não pode ser desfeita.`)) return;

    try {
      await deleteDoc(doc(db, 'system_maneuvers', maneuver.id));
      toast({ title: 'Manobra excluída', description: `"${maneuver.name}" foi removida.` });
      await refetch();
    } catch (err) {
      console.error('[AdminManeuversTab] Delete error:', err);
      toast({ title: 'Erro ao excluir', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const getSkillName = (skillId?: string) => {
    if (!skillId) return null;
    return skills.find(s => s.id === skillId)?.name || skillId;
  };

  const getDriveName = (driveId?: DriveName) => {
    if (!driveId) return null;
    return drives.find(d => d.id === driveId)?.name || driveId;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manobras</CardTitle>
          <CardDescription>
            Gerencie as manobras de perícias e taras. ({allManeuvers.length} manobras)
          </CardDescription>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Manobra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingManeuver ? 'Editar Manobra' : 'Nova Manobra'}</DialogTitle>
              <DialogDescription>
                {editingManeuver ? 'Atualize os dados da manobra.' : 'Preencha os dados para criar uma nova manobra.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Golpe Certeiro"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: ManeuverType) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.type === 'skill' && (
                <div className="space-y-2">
                  <Label htmlFor="skillId">Perícia</Label>
                  <Select
                    value={formData.skillId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, skillId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a perícia" />
                    </SelectTrigger>
                    <SelectContent>
                      {skills.map(skill => (
                        <SelectItem key={skill.id} value={skill.id}>{skill.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(formData.type === 'drive_free' || formData.type === 'drive_exclusive') && (
                <div className="space-y-2">
                  <Label htmlFor="driveId">Tara</Label>
                  <Select
                    value={formData.driveId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, driveId: value as DriveName }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a tara" />
                    </SelectTrigger>
                    <SelectContent>
                      {drives.map(drive => (
                        <SelectItem key={drive.id} value={drive.id}>{drive.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.type !== 'drive_free' && (
                <div className="space-y-2">
                  <Label htmlFor="cost">Custo (Refresh)</Label>
                  <Select
                    value={String(formData.cost)}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, cost: Number(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 (Grátis)</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição da manobra..."
                  rows={4}
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
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-muted/30">
          <Filter className="w-4 h-4 text-muted-foreground mt-2" />
          <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Tipos</SelectItem>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterSkill} onValueChange={setFilterSkill}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Perícia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Perícias</SelectItem>
              {skills.map(skill => (
                <SelectItem key={skill.id} value={skill.id}>{skill.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterDrive} onValueChange={setFilterDrive}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Tara" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Taras</SelectItem>
              {drives.map(drive => (
                <SelectItem key={drive.id} value={drive.id}>{drive.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        <div className="space-y-2">
          {filteredManeuvers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma manobra encontrada.
            </p>
          ) : (
            filteredManeuvers.map(maneuver => (
              <div
                key={maneuver.id}
                className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{maneuver.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {TYPE_LABELS[maneuver.type]}
                    </Badge>
                    {maneuver.cost > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {maneuver.cost} refresh
                      </Badge>
                    )}
                    {maneuver.skillId && (
                      <Badge className="text-xs">{getSkillName(maneuver.skillId)}</Badge>
                    )}
                    {maneuver.driveId && (
                      <Badge className="text-xs">{getDriveName(maneuver.driveId)}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {maneuver.description}
                  </p>
                </div>
                <div className="flex gap-1 ml-2 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(maneuver)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(maneuver)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
