import { initSimnet } from "@hirosystems/clarinet-sdk";
import { describe, expect, it } from "vitest";
import { Cl } from '@stacks/transactions';

const simnet = await initSimnet();
const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;
const BLOCKS_IN_HOUR = 6;
const BLOCKS_IN_DAY = BLOCKS_IN_HOUR * 24;
const BLOCKS_IN_WEEK = BLOCKS_IN_DAY * 7;
const BLOCKS_IN_MONTH = BLOCKS_IN_DAY * 30;
const BLOCKS_IN_YEAR = BLOCKS_IN_MONTH * 12;

/*
  The test below is an example. To learn more, read the testing documentation here:
  https://docs.hiro.so/clarinet/feature-guides/test-contract-with-clarinet-sdk
*/

describe('test `create-campaign` public function ok', () => {
  it('creates a new campaign and verifies contract data members are updated accordingly', () => {
    // CREATE NEW CAMPAIGN
    const createCampaignResponse = simnet.callPublicFn('crowdfunding', 'create-campaign', [Cl.stringUtf8('First campaign'), Cl.stringUtf8('campaign1Description'), Cl.stringUtf8('campaign1Link'), Cl.uint(100_000), Cl.uint(BLOCKS_IN_WEEK)], address1);
    expect(createCampaignResponse.result).toBeOk(Cl.uint(1));

    const campaignId = simnet.getDataVar('crowdfunding', 'campaign-id-nonce');
    expect(campaignId).toBeUint(1);

    const getCampaignResponse = simnet.callReadOnlyFn('crowdfunding', 'get-campaign', [Cl.uint(1)], address1);
    expect(getCampaignResponse.result).toStrictEqual(Cl.ok(
      Cl.tuple({
          name: Cl.stringUtf8('First campaign'),
          fundraiser: Cl.standardPrincipal(address1),
          goal: Cl.uint(100_000),
          'target-block-height': Cl.uint(simnet.blockHeight + BLOCKS_IN_WEEK)
      })));

    const getCampaignInformationResponse = simnet.callReadOnlyFn('crowdfunding', 'get-campaign-information', [Cl.uint(1)], address1);
    expect(getCampaignInformationResponse.result).toStrictEqual(Cl.ok(
      Cl.tuple({
          description: Cl.stringUtf8('campaign1Description'),
          link: Cl.stringUtf8('campaign1Link')
      })));

    const getCampaignTotalsResponse = simnet.callReadOnlyFn('crowdfunding', 'get-campaign-totals', [Cl.uint(1)], address1);
    expect(getCampaignTotalsResponse.result).toStrictEqual(Cl.ok(
      Cl.tuple({
          'total-investment': Cl.uint(0),
          'total-investors': Cl.uint(0)
      })));

    const getCampaignStatusResponse = simnet.callReadOnlyFn('crowdfunding', 'get-campaign-status', [Cl.uint(1)], address1);
    expect(getCampaignStatusResponse.result).toStrictEqual(Cl.ok(
      Cl.tuple({
          'target-reached': Cl.bool(false),
          'target-reached-height': Cl.uint(0),
          funded: Cl.bool(false)
      })));

  });
});