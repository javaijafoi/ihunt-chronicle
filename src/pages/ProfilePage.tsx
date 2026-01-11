import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Save, Upload, User, Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export function ProfilePage() {
    const { user, userProfile, signOut } = useAuth();
    const navigate = useNavigate();

    const [displayName, setDisplayName] = useState("");
    const [photoURL, setPhotoURL] = useState("");
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [currentPassword, setCurrentPassword] = useState(""); // Needed for sensitive changes
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || userProfile?.displayName || "");
            setPhotoURL(user.photoURL || userProfile?.photoURL || "");
            setEmail(user.email || userProfile?.email || "");
        }
    }, [user, userProfile]);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);

        try {
            const updates: any = {};
            let authUpdates = false;

            // 1. Update Profile (Name & Photo)
            if (displayName !== user.displayName || photoURL !== user.photoURL) {
                await updateProfile(user, {
                    displayName: displayName,
                    photoURL: photoURL
                });
                updates.displayName = displayName;
                updates.photoURL = photoURL;
                authUpdates = true;
            }

            // 2. Sensitive Updates (Email/Password) - requires re-auth
            if ((email !== user.email || newPassword) && currentPassword) {
                const credential = EmailAuthProvider.credential(user.email!, currentPassword);
                await reauthenticateWithCredential(user, credential);

                if (email !== user.email) {
                    await updateEmail(user, email);
                    updates.email = email;
                    authUpdates = true;
                }

                if (newPassword) {
                    if (newPassword !== confirmPassword) {
                        throw new Error("Novas senhas não conferem.");
                    }
                    await updatePassword(user, newPassword);
                    toast({ title: "Senha atualizada!", description: "Use a nova senha no próximo login." });
                }
            } else if ((email !== user.email || newPassword) && !currentPassword) {
                throw new Error("Para alterar email ou senha, confirme sua senha atual.");
            }

            // 3. Sync with Firestore
            if (Object.keys(updates).length > 0) {
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, updates);
            }

            if (authUpdates || Object.keys(updates).length > 0) {
                toast({ title: "Perfil atualizado!", description: "Suas informações foram salvas." });
            }

        } catch (error: any) {
            console.error("Profile update error:", error);
            toast({
                title: "Erro ao atualizar",
                description: error.message === "Firebase: Error (auth/wrong-password)."
                    ? "Senha atual incorreta."
                    : error.message,
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 sm:p-6 overflow-y-auto">
            <div className="max-w-xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 hover:bg-muted rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="font-display text-3xl text-primary">Meu Perfil</h1>
                </div>

                <div className="glass-panel p-6 space-y-6">
                    {/* Header with Avatar */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-primary overflow-hidden">
                                {photoURL ? (
                                    <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-bold text-primary">{displayName?.[0] || 'U'}</span>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-xl font-bold">{displayName || "Caçador"}</h2>
                            <p className="text-sm text-muted-foreground">{email}</p>
                            <p className="text-xs text-muted-foreground mt-1">Conta criada em: {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="displayName">Nome de Exibição</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="displayName"
                                        value={displayName}
                                        onChange={e => setDisplayName(e.target.value)}
                                        className="pl-9"
                                        placeholder="Seu nome público"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="photoURL">URL da Foto (Avatar)</Label>
                                <div className="relative">
                                    <Upload className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="photoURL"
                                        value={photoURL}
                                        onChange={e => setPhotoURL(e.target.value)}
                                        className="pl-9"
                                        placeholder="https://..."
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground">Cole um link de imagem direto (Imgur, Discord, etc).</p>
                            </div>
                        </div>

                        {/* Sensitive Info */}
                        <div className="pt-4 border-t border-border space-y-4">
                            <h3 className="font-display text-lg text-primary flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Segurança & Login
                            </h3>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email de Login</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">Nova Senha</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="Deixe em branco para manter"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="Repita a nova senha"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <Label htmlFor="currentPassword" className="text-destructive font-bold">Senha Atual (Obrigatório para alterações sensíveis)</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    placeholder="Digite sua senha atual para confirmar mudanças de email/senha"
                                    className="border-destructive/30 focus:border-destructive"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                        <Button
                            variant="destructive"
                            className="w-full sm:w-auto"
                            onClick={async () => {
                                await signOut();
                                navigate('/');
                            }}
                        >
                            Sair da Conta
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full sm:w-auto min-w-[150px]"
                        >
                            {isSaving ? <span className="animate-spin mr-2">⏳</span> : <Save className="w-4 h-4 mr-2" />}
                            Salvar Alterações
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
