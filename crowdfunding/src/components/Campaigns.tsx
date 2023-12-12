import {
    UserData
} from "@stacks/connect";
import { Campaign } from '../App';
import StackedCard from './StackedCard';

type CampaignsProps = {
    userData: UserData | undefined,
    campaigns: Array<Campaign>
}

function Campaigns({userData, campaigns}: CampaignsProps) {
    
    return (
        <ul>
            {campaigns.map((campaign) => (
                <StackedCard key={campaign.campaignId} userData={userData} campaign={campaign} />
            ))}
        </ul>
      );
}

export default Campaigns;