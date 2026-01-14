import { useState } from 'react';
import { Plus, Pencil, Trash2, Save, X, Sparkles } from 'lucide-react';
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
import type { SystemGift } from '@/types/rules';

interface GiftFormData {
  name: string;
  description: string;
  essenceCost: number;
}

const emptyForm: GiftFormData = {
  name: '',
  description: '',
  essenceCost: 1,
};

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

export function AdminGiftsTab() {
  const { gifts, refetch } = useRules();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<SystemGift | null>(null);
  const [formData, setFormData] = useState<GiftFormData>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const openCreate = () => {
    setEditingGift(null);
    setFormData(emptyForm);
    setIsOpen(true);
  };

  const openEdit = (gift: SystemGift) => {
    setEditingGift(gift);
    setFormData({
      name: gift.name,
      description: gift.description,
      essenceCost: gift.essenceCost,
    });
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const id = editingGift?.id || toSlug(formData.name);
      
      await setDoc(doc(db, 'system_gifts', id), {
        id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        essenceCost: formData.essenceCost,
        updatedAt: serverTimestamp(),
        ...(editingGift ? {} : { createdAt: serverTimestamp() }),
      }, { merge: true });

      toast({ 
        title: editingGift ? 'Dom atualizado' : 'Dom criado',
        description: `"${formData.name}" foi ${editingGift ? 'atualizado' : 'criado'} com sucesso.`
      });
      
      setIsOpen(false);
      await refetch();
    } catch (err) {
      console.error('[AdminGiftsTab] Save error:', err);
      toast({ title: 'Erro ao salvar', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (gift: SystemGift) => {
    if (!confirm(`Excluir o dom "${gift.name}"? Esta ação não pode ser desfeita.`)) return;

    try {
      await deleteDoc(doc(db, 'system_gifts', gift.id));
      toast({ title: 'Dom excluído', description: `"${gift.name}" foi removido.` });
      await refetch();
    } catch (err) {
      console.error('[AdminGiftsTab] Delete error:', err);
      toast({ title: 'Erro ao excluir', description: (err as Error).message, variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Dons Mágicos
          </CardTitle>
          <CardDescription>
            Gerencie os dons sobrenaturais disponíveis para personagens com Embruxação. ({gifts.length} dons)
          </CardDescription>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Dom
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingGift ? 'Editar Dom' : 'Novo Dom'}</DialogTitle>
              <DialogDescription>
                {editingGift ? 'Atualize os dados do dom.' : 'Preencha os dados para criar um novo dom.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Bênção"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="essenceCost">Custo de Essência</Label>
                <Select
                  value={String(formData.essenceCost)}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, essenceCost: Number(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(cost => (
                      <SelectItem key={cost} value={String(cost)}>
                        {cost} ponto{cost > 1 ? 's' : ''} de essência
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do dom e seus efeitos..."
                  rows={6}
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
        <div className="space-y-2">
          {gifts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum dom cadastrado. Use o botão "Importar Regras Iniciais" ou crie um novo.
            </p>
          ) : (
            gifts.map(gift => (
              <div
                key={gift.id}
                className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{gift.name}</span>
                    <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-400">
                      {gift.essenceCost} essência
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {gift.description}
                  </p>
                </div>
                <div className="flex gap-1 ml-2 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(gift)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(gift)}>
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
