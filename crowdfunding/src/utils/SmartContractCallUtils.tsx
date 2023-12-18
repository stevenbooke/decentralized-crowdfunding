import { UserData } from "@stacks/connect";
import { StacksMocknet } from "@stacks/network";
import { 
    callReadOnlyFunction,
    uintCV,
    deserializeCV,
    cvToHex,
    ResponseOkCV,
    UIntCV,
    BooleanCV,
    TupleCV,
    StringUtf8CV,
    StandardPrincipalCV
} from "@stacks/transactions";

type CampaignIdNonceCV = ResponseOkCV<UIntCV>;
type IsActiveCampaignCV = ResponseOkCV<BooleanCV>;
type CampaignCV = ResponseOkCV<TupleCV<{
        ['name']: StringUtf8CV;
        ['fundraiser']: StandardPrincipalCV;
        ['goal']: UIntCV;
        ['target-block-height']: UIntCV;
    }>
>;
type CampaignInformationCV = ResponseOkCV<TupleCV<{
        ['description']: StringUtf8CV;
        ['link']: StringUtf8CV;
    }>
>;
type CampaignTotalsCV = ResponseOkCV<TupleCV<{
        ['total-investment']: UIntCV;    
        ['total-investors']: UIntCV;
    }>
>;

export const getCampaignIdNonce = async (userData: UserData | undefined): Promise<CampaignIdNonceCV> => {
    const contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const contractName = 'crowdfunding';
    const functionName = 'get-campaign-id-nonce';
    const network = new StacksMocknet();
    const stxAddress = userData!.profile!.stxAddress!.testnet;
    

    const options = {
        contractAddress: contractAddress,
        contractName: contractName,
        functionName: functionName,
        functionArgs: [],
        network: network,
        senderAddress: stxAddress,
    };

    const cv = await callReadOnlyFunction(options);
    const cvDeserialized = deserializeCV<CampaignIdNonceCV>(cvToHex(cv));
    return Promise.resolve(cvDeserialized);
};

export const getIsActiveCampaign = async (userData: UserData | undefined, campaignId: number): Promise<IsActiveCampaignCV> => {
    const contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const contractName = 'crowdfunding';
    const functionName = 'get-is-active-campaign';
    const network = new StacksMocknet();
    const stxAddress = userData!.profile!.stxAddress!.testnet;

    const options = {
        contractAddress: contractAddress,
        contractName: contractName,
        functionName: functionName,
        functionArgs: [uintCV(campaignId)],
        network: network,
        senderAddress: stxAddress,
    };

    const cv = await callReadOnlyFunction(options);
    const cvDeserialized = deserializeCV<IsActiveCampaignCV>(cvToHex(cv));
    return Promise.resolve(cvDeserialized);
};

export const getCampaign = async (userData: UserData | undefined, campaignId: number): Promise<CampaignCV> => {
    const contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const contractName = 'crowdfunding';
    const functionName = 'get-campaign';
    const network = new StacksMocknet();
    const stxAddress = userData!.profile!.stxAddress!.testnet;

    const options = {
        contractAddress: contractAddress,
        contractName: contractName,
        functionName: functionName,
        functionArgs: [uintCV(campaignId)],
        network: network,
        senderAddress: stxAddress,
    };

    const cv = await callReadOnlyFunction(options);
    const cvDeserialized = deserializeCV<CampaignCV>(cvToHex(cv));
    return Promise.resolve(cvDeserialized);
};

export const getCampaignInformation = async (userData: UserData | undefined, campaignId: number): Promise<CampaignInformationCV> => {
    const contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const contractName = 'crowdfunding';
    const functionName = 'get-campaign-information';
    const network = new StacksMocknet();
    const stxAddress = userData!.profile!.stxAddress!.testnet;

    const options = {
        contractAddress: contractAddress,
        contractName: contractName,
        functionName: functionName,
        functionArgs: [uintCV(campaignId)],
        network: network,
        senderAddress: stxAddress,
    };

    const cv = await callReadOnlyFunction(options);
    const cvDeserialized = deserializeCV<CampaignInformationCV>(cvToHex(cv));
    return Promise.resolve(cvDeserialized);
};

export const getCampaignTotals = async (userData: UserData | undefined, campaignId: number): Promise<CampaignTotalsCV> => {
    const contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const contractName = 'crowdfunding';
    const functionName = 'get-campaign-totals';
    const network = new StacksMocknet();
    const stxAddress = userData!.profile!.stxAddress!.testnet;

    const options = {
        contractAddress: contractAddress,
        contractName: contractName,
        functionName: functionName,
        functionArgs: [uintCV(campaignId)],
        network: network,
        senderAddress: stxAddress,
    };

    const cv = await callReadOnlyFunction(options);
    const cvDeserialized = deserializeCV<CampaignTotalsCV>(cvToHex(cv));
    return Promise.resolve(cvDeserialized);
};