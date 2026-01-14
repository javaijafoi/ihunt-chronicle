import { useState } from 'react';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useRules } from '@/contexts/RulesContext';
import { useToast } from '@/hooks/use-toast';
import type { SystemSkill, SkillAction } from '@/types/rules';

const ACTION_OPTIONS: { value: SkillAction; label: string }[] = [
  { value: 'overcome', label: 'Superar' },
  { value: 'createAdvantage', label: 'Criar Vantagem' },
  { value: 'attack', label: 'Atacar' },
  { value: 'defend', label: 'Defender' },
];

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

interface SkillFormData {
  name: string;
  description: string;
  actions: SkillAction[];
}

const emptyForm: SkillFormData = {
  name: '',
  description: '',
  actions: ['overcome', 'createAdvantage'],
};

export function AdminSkillsTab() {
  const { skills, refetch } = useRules();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SystemSkill | null>(null);
  const [formData, setFormData] = useState<SkillFormData>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const openCreate = () => {
    setEditingSkill(null);
    setFormData(emptyForm);
    setIsOpen(true);
  };

  const openEdit = (skill: SystemSkill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      description: skill.description || '',
      actions: skill.actions,
    });
    setIsOpen(true);
  };

  const toggleAction = (action: SkillAction) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.includes(action)
        ? prev.actions.filter(a => a !== action)
        : [...prev.actions, action],
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const id = editingSkill?.id || toSlug(formData.name);
      
      await setDoc(doc(db, 'system_skills', id), {
        id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        actions: formData.actions,
        updatedAt: serverTimestamp(),
        ...(editingSkill ? {} : { createdAt: serverTimestamp() }),
      }, { merge: true });

      toast({ 
        title: editingSkill ? 'Perícia atualizada' : 'Perícia criada',
        description: `"${formData.name}" foi ${editingSkill ? 'atualizada' : 'criada'} com sucesso.`
      });
      
      setIsOpen(false);
      await refetch();
    } catch (err) {
      console.error('[AdminSkillsTab] Save error:', err);
      toast({ title: 'Erro ao salvar', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (skill: SystemSkill) => {
    if (!confirm(`Excluir a perícia "${skill.name}"? Esta ação não pode ser desfeita.`)) return;

    try {
      await deleteDoc(doc(db, 'system_skills', skill.id));
      toast({ title: 'Perícia excluída', description: `"${skill.name}" foi removida.` });
      await refetch();
    } catch (err) {
      console.error('[AdminSkillsTab] Delete error:', err);
      toast({ title: 'Erro ao excluir', description: (err as Error).message, variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Perícias</CardTitle>
          <CardDescription>
            Gerencie as perícias disponíveis no sistema. ({skills.length} perícias)
          </CardDescription>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Perícia
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSkill ? 'Editar Perícia' : 'Nova Perícia'}</DialogTitle>
              <DialogDescription>
                {editingSkill ? 'Atualize os dados da perícia.' : 'Preencha os dados para criar uma nova perícia.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Lutador"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição da perícia..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Ações Permitidas</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ACTION_OPTIONS.map(option => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`action-${option.value}`}
                        checked={formData.actions.includes(option.value)}
                        onCheckedChange={() => toggleAction(option.value)}
                      />
                      <label htmlFor={`action-${option.value}`} className="text-sm">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
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
        <div className="space-y-2">
          {skills.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma perícia cadastrada. Use o botão "Importar Regras Iniciais" ou crie uma nova.
            </p>
          ) : (
            skills.map(skill => (
              <div
                key={skill.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-xs text-muted-foreground">({skill.id})</span>
                  </div>
                  <div className="flex gap-1 mt-1">
                    {skill.actions.map(action => (
                      <Badge key={action} variant="secondary" className="text-xs">
                        {ACTION_OPTIONS.find(a => a.value === action)?.label || action}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(skill)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(skill)}>
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
