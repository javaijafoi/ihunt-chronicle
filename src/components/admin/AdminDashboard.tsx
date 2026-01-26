import { useRules } from "@/contexts/RulesContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Swords, Sparkles, Brain, CheckCircle2, AlertCircle } from "lucide-react";

export function AdminDashboard() {
    const { skillNames, maneuvers, gifts, drives, loading, error } = useRules();

    const stats = [
        {
            title: "Perícias",
            value: skillNames.length,
            icon: <Brain className="w-4 h-4 text-muted-foreground" />,
            description: "Perícias registradas no sistema",
        },
        {
            title: "Manobras",
            value: maneuvers.length,
            icon: <Swords className="w-4 h-4 text-muted-foreground" />,
            description: "Manobras (Gerais e de Perícia)",
        },
        {
            title: "Dons",
            value: gifts.length,
            icon: <Sparkles className="w-4 h-4 text-muted-foreground" />,
            description: "Dons disponíveis",
        },
        {
            title: "Taras",
            value: drives.length,
            icon: <Book className="w-4 h-4 text-muted-foreground" />,
            description: "Arquétipos (Taras) definidos",
        },
    ];

    if (loading) {
        return <div className="p-4 text-sm text-muted-foreground">Carregando estatísticas...</div>;
    }

    if (error) {
        return (
            <div className="p-4 flex items-center gap-2 text-destructive bg-destructive/10 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span>Erro ao carregar regras: {error}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            {stat.icon}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Status do Sistema
                </h3>
                <p className="text-sm text-muted-foreground">
                    O sistema de regras está operando normalmente. Os dados acima refletem o conteúdo atual do Firestore.
                    Se os números forem 0, utilize a ferramenta de importação na aba "Configurações".
                </p>
            </div>
        </div>
    );
}
