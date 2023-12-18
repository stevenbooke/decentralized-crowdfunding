import { 
  useState,
} from "react";
import {
  UserData, openContractCall,
} from "@stacks/connect";
import { StacksMocknet } from "@stacks/network";
import { 
  stringUtf8CV,
  uintCV,
  AnchorMode,
  PostConditionMode,
} from "@stacks/transactions";

type CreateCampaignProps = {
  userData: UserData | undefined
}

function CreateCampaignForm({userData}: CreateCampaignProps) {
  const INITIAL_STATE = {
    campaignName: '',
    campaignDescription: '',
    campaignLink: '',
    campaignGoal: 0,
    campaignDuration: 0 
  };
  
  const [form, setForm] = useState(INITIAL_STATE);

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // call handler here
    createCampaign(form.campaignName, form.campaignDescription, form.campaignLink, form.campaignGoal, form.campaignDuration);

    setForm(INITIAL_STATE);
  };

  const createCampaign = async (name: string, description: string, link: string, goal: number | bigint, duration: number | bigint) => {
    const network = new StacksMocknet();
    const stxAddress = userData!.profile!.stxAddress!.testnet;

    const txOptions = {
      contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      contractName: 'crowdfunding',
      functionName: 'create-campaign',
      functionArgs: [stringUtf8CV(name), stringUtf8CV(description), stringUtf8CV(link), uintCV(goal), uintCV(duration)],
      stxAddress: stxAddress,
      validateWithAbi: true,
      network,
      anchorMode: AnchorMode.Any,
      PostConditionMode: PostConditionMode.Allow,
      onFinish: (response: any) => {
        // WHEN user confirms pop-up
      },
      onCancel: () => {
        // WHEN user cancels/closes pop-up
      },
    };
    
    await openContractCall(txOptions);
  };

  return (<div>
          {userData && (<div className="flex flex-col justify-center items-center h-screen gap-8">
                          <div className="w-full max-w-xs">
                            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmit}>
                              <div className="mb-4">
                              <label htmlFor="campaignName" className="block text-gray-700 text-sm font-bold mb-2">
                                  Campaign Name
                              </label>
                              <input id="campaignName" type="text" value={form.campaignName} onChange={handleChange} placeholder="Campaign Name" className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" />
                              </div>
                              <div className="mb-4">
                              <label htmlFor="campaignDescription" className="block text-gray-700 text-sm font-bold mb-2">
                                  Description
                              </label>
                              <input id="campaignDescription" type="text" value={form.campaignDescription} onChange={handleChange} placeholder="Description" className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" />
                              </div>
                              <div className="mb-4">
                              <label htmlFor="campaignLink" className="block text-gray-700 text-sm font-bold mb-2">
                                  Link
                              </label>
                              <input id="campaignLink" type="text" value={form.campaignLink} onChange={handleChange} placeholder="Link" className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" />
                              </div>
                              <div className="mb-4">
                              <label htmlFor="campaignGoal" className="block text-gray-700 text-sm font-bold mb-2">
                                  Goal
                              </label>
                              <input id="campaignGoal" type="number" value={form.campaignGoal} onChange={handleChange} placeholder="Goal" className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" />
                              </div>
                              <div className="mb-4">
                              <label htmlFor="campaignDuration" className="block text-gray-700 text-sm font-bold mb-2">
                                  Duration
                              </label>
                              <input id="campaignDuration" type="number" value={form.campaignDuration} onChange={handleChange} placeholder="Duration" className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" />
                              </div>
                              <div className="flex items-center justify-between">
                              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                                  Create Campaign
                              </button>
                              </div>
                            </form>
                          </div>
                        </div>)}
        </div>
  );
}
  
  export { CreateCampaignForm };