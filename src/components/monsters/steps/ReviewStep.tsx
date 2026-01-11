import { useRef } from "react";
import { MonsterData } from "./IdentityStep";
import { MonsterCard } from "../MonsterCard";
import { Button } from "@/components/ui/button";
import { Download, FileJson, Save } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";

interface ReviewStepProps {
    data: MonsterData;
}

export const ReviewStep = ({ data }: ReviewStepProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const handleExportJSON = () => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${data.name.replace(/\s+/g, "_").toLowerCase() || "monster"}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ description: "Arquivo JSON exportado com sucesso!" });
    };

    const handleExportPDF = async () => {
        if (!cardRef.current) return;

        try {
            const canvas = await html2canvas(cardRef.current, {
                useCORS: true,
                scale: 2, // Better quality
                backgroundColor: "#0a0a0a"
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;

            // Calculate scale to fit width with some margin
            const margin = 20;
            const availableWidth = pdfWidth - (margin * 2);
            const ratio = availableWidth / imgWidth;
            const finalHeight = imgHeight * ratio;

            pdf.addImage(imgData, "PNG", margin, margin, availableWidth, finalHeight);
            pdf.save(`${data.name || "monster"}.pdf`);
            toast({ description: "PDF gerado com sucesso!" });

        } catch (error) {
            console.error("PDF Error:", error);
            toast({ variant: "destructive", description: "Erro ao gerar PDF." });
        }
    };

    const handleSaveToSystem = () => {
        // Todo: Implement firebase save logic
        toast({ description: "Funcionalidade de salvar em breve!" });
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
            {/* Visual Preview */}
            <div className="flex-shrink-0 mx-auto lg:mx-0">
                <MonsterCard data={data} ref={cardRef} />
            </div>

            {/* Actions */}
            <div className="flex-1 space-y-6 max-w-md w-full">
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">Pronto para Caçar?</h3>
                    <p className="text-neutral-400">
                        Seu monstro foi criado. Você pode exportar a ficha ou salvar na sua coleção se estiver logado.
                    </p>
                </div>

                <div className="grid gap-4">
                    <Button onClick={handleExportJSON} variant="outline" className="w-full justify-start h-12">
                        <FileJson className="mr-2 h-4 w-4 text-yellow-500" />
                        Exportar JSON (Backup)
                    </Button>

                    <Button onClick={handleExportPDF} variant="outline" className="w-full justify-start h-12">
                        <Download className="mr-2 h-4 w-4 text-blue-500" />
                        Baixar Ficha (PDF/Imagem)
                    </Button>

                    <Button onClick={handleSaveToSystem} disabled className="w-full justify-start h-12 opacity-50 cursor-not-allowed">
                        <Save className="mr-2 h-4 w-4" />
                        Salvar na Coleção (Em Breve)
                    </Button>
                </div>

                <div className="bg-neutral-900/50 p-4 rounded text-xs text-neutral-500 border border-neutral-800">
                    Dica: Para usar este monstro no sistema iHunt, você pode importar o JSON na área do GM no futuro.
                </div>
            </div>
        </div>
    );
};
