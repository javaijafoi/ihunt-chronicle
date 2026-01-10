import { useParams } from 'react-router-dom';
import { CampaignProvider } from '@/contexts/CampaignContext';
import { VTTPage } from './VTTPage';
import { Loader2 } from 'lucide-react';

export function CampaignPageWrapper() {
    const { campaignId } = useParams<{ campaignId: string }>();

    if (!campaignId) {
        return <div>Erro: ID da campanha não fornecido.</div>;
    }

    return (
        <CampaignProvider campaignId={campaignId}>
            <VTTPage />
        </CampaignProvider>
    );
}
