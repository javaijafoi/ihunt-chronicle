import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Campaign } from '@/types/schema';

export function CreateCampaignPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        theme: '',
        private: false
    });

    const handleCreate = async () => {
        if (!user || !formData.title) return;
        setLoading(true);

        try {
            // Create Campaign Doc
            const campaignRef = await addDoc(collection(db, 'campaigns'), {
                title: formData.title,
                description: formData.description,
                gmId: user.uid,
                status: 'active',
                joinCode: `HUNT-${Math.floor(1000 + Math.random() * 9000)}`, // Simple code generation
                theme: {
                    tone: 'dark',
                    safetyTools: [],
                    customSetting: formData.theme
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                currentEpisodeId: null,
                members: [user.uid] // Basic array for index-less querying until we have subcollections sorted
            } as Omit<Campaign, 'id'>);

            // Create GM Member record
            await setDoc(doc(db, `campaigns/${campaignRef.id}/members`, user.uid), {
                userId: user.uid,
                role: 'gm',
                characterId: null,
                joinedAt: serverTimestamp()
            });

            toast.success("Crônica criada com sucesso!");
            navigate('/'); // Go back to lobby or directly to campaign
        } catch (e) {
            console.error(e);
            toast.error("Erro ao criar crônica.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-8 flex flex-col items-center">
            <div className="w-full max-w-2xl">
                <Button variant="ghost" onClick={() => navigate('/')} className="mb-6 gap-2">
                    <ArrowLeft className="w-4 h-4" /> Voltar
                </Button>

                <h1 className="text-3xl font-display mb-2">Nova Crônica</h1>
                <p className="text-muted-foreground mb-8">Defina os parâmetros iniciais da suca caçada.</p>

                <div className="bg-card border rounded-xl p-6 space-y-6">
                    <div className="space-y-2">
                        <Label>Título da Crônica</Label>
                        <Input
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ex: O Mistério de São Paulo"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Premissa / Descrição</Label>
                        <Textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Sobre o que é essa campanha?"
                            rows={4}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Temas & Nuances</Label>
                        <Input
                            value={formData.theme}
                            onChange={e => setFormData({ ...formData, theme: e.target.value })}
                            placeholder="Ex: Horror Investigativo, Ação, Drama Político..."
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button onClick={handleCreate} disabled={loading || !formData.title}>
                            {loading ? <Loader2 className="animate-spin" /> : 'Criar Crônica'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
