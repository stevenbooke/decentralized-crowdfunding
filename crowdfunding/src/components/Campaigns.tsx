import {
    useState,
    useEffect
} from "react";
import {
    UserData
} from "@stacks/connect";
import { Campaign } from '../App';
import StackedCard from './StackedCard';
import {
    trueCV,
    principalToString
} from "@stacks/transactions";

import { 
    getCampaignIdNonce,
    getIsActiveCampaign,
    getCampaign,
    getCampaignInformation,
    getCampaignTotals
} from "../utils/SmartContractCallUtils";

type CampaignsProps = {
    userData: UserData | undefined,
}

function Campaigns({userData}: CampaignsProps) {
    const [campaignIdNonce, setCampaignIdNonce] = useState<number>(0);
    const [campaigns, setCampaigns] = useState<Array<Campaign>>([]);

    // CAMPAIGN ID NONCE
    useEffect(() => {
        if (userData === undefined) {
            return;
        }
        let ignore = false;
        getCampaignIdNonce(userData).then((cv) => {
            if (!ignore) {
                setCampaignIdNonce(Number(cv.value.value));
            }
        });

        return () => {
            ignore = true;
        };
    }, []);

    // ACTIVE CAMPAIGNS
    // get-is-active-campaign -> get-campaign (name, fundraiser, goal, target-block-height)
    // -> get-campaign-information (description, link) -> get-campaign-totals (total-investment, total-investors)
    useEffect(() => {
        const getCampaigns = async () => {
            const campaignIds = Array.from(Array(campaignIdNonce).keys(), x => x+1);
            const isCampaignActiveResolutions = await Promise.all(campaignIds.map((campaignId) => getIsActiveCampaign(userData, campaignId)));
            const activeCampaignIds = campaignIds.map((campaignId, index) => {
                return {
                    campaignId: campaignId,
                    response: isCampaignActiveResolutions[index]
                };
            }).filter((campaignIdAndResponse) => trueCV().type === campaignIdAndResponse.response.value.type);

            const activeCampaignResolutions = await Promise.all(activeCampaignIds.map((activeCampaign) => getCampaign(userData, activeCampaign.campaignId)));
            const activeCampaignInformationResolutions = await Promise.all(activeCampaignIds.map((activeCampaign) => getCampaignInformation(userData, activeCampaign.campaignId)));
            const activeCampaignTotalResolutions = await Promise.all(activeCampaignIds.map((activeCampaign) => getCampaignTotals(userData, activeCampaign.campaignId)));

            const campaigns = activeCampaignIds.map((activeCampaign, index) => {
                const activeCampaignDetails = activeCampaignResolutions[index];
                const activeCampaignInformation = activeCampaignInformationResolutions[index];
                const activeCampaignTotal = activeCampaignTotalResolutions[index];

                return {
                  campaignId: activeCampaign.campaignId,
                  name: activeCampaignDetails.value.data.name.data,
                  fundraiser: principalToString(activeCampaignDetails.value.data.fundraiser),
                  goal: Number(activeCampaignDetails.value.data.goal.value),
                  'target-block-height': Number(activeCampaignDetails.value.data["target-block-height"].value),
                  description: activeCampaignInformation.value.data.description.data,
                  link: activeCampaignInformation.value.data.link.data,
                  totalInvestments: Number(activeCampaignTotal.value.data['total-investment'].value),
                  totalInvestors: Number(activeCampaignTotal.value.data['total-investors'].value)
                };

            });

            if (!ignore) {
                setCampaigns(campaigns);
            }

        };

        let ignore = false;
        getCampaigns();
        return () => {
            ignore = true;
        };
        
    }, [campaignIdNonce]);

    
    return (
        <ul>
            {campaigns.map((campaign) => (
                <StackedCard key={campaign.campaignId} userData={userData} campaign={campaign} />
            ))}
        </ul>
      );
}

export default Campaigns;