import { initSimnet } from "@hirosystems/clarinet-sdk";
import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from '@stacks/transactions';

const simnet = await initSimnet();
const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;
const BLOCKS_IN_HOUR = 6;
const BLOCKS_IN_DAY = BLOCKS_IN_HOUR * 24;
const BLOCKS_IN_WEEK = BLOCKS_IN_DAY * 7;
const BLOCKS_IN_MONTH = BLOCKS_IN_DAY * 30;
const BLOCKS_IN_YEAR = BLOCKS_IN_MONTH * 12;

/*
  The test below is an example. To learn more, read the testing documentation here:
  https://docs.hiro.so/clarinet/feature-guides/test-contract-with-clarinet-sdk
*/

describe('test `update-campaign-information` public function', () => {
    beforeEach(() => {
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
            }))
        );

        const getCampaignInformationResponse = simnet.callReadOnlyFn('crowdfunding', 'get-campaign-information', [Cl.uint(1)], address1);
        expect(getCampaignInformationResponse.result).toStrictEqual(Cl.ok(
            Cl.tuple({
                description: Cl.stringUtf8('campaign1Description'),
                link: Cl.stringUtf8('campaign1Link')
            }))
        );

        const getCampaignTotalsResponse = simnet.callReadOnlyFn('crowdfunding', 'get-campaign-totals', [Cl.uint(1)], address1);
        expect(getCampaignTotalsResponse.result).toStrictEqual(Cl.ok(
            Cl.tuple({
                'total-investment': Cl.uint(0),
                'total-investors': Cl.uint(0)
            }))
        );

        const getCampaignStatusResponse = simnet.callReadOnlyFn('crowdfunding', 'get-campaign-status', [Cl.uint(1)], address1);
        expect(getCampaignStatusResponse.result).toStrictEqual(Cl.ok(
            Cl.tuple({
                'target-reached': Cl.bool(false),
                'target-reached-height': Cl.uint(0),
                funded: Cl.bool(false)
            }))
        );
    });

    describe('test `update-campaign-information` public function ok', () => {
        it('creates a new campaign and verifies contract data members are updated accordingly, then campaign owner updates campaign information and verifies contract data members are updated accordingly', () => {
          // UPDATE CAMPAIGN INFORMATION
          const updateCampaignInformationResponse = simnet.callPublicFn('crowdfunding', 'update-campaign-information', [Cl.uint(1), Cl.stringUtf8('campaign1UpdatedDescription'), Cl.stringUtf8('campaign1UpdatedLink')], address1);
          expect(updateCampaignInformationResponse.result).toBeOk(Cl.bool(true));
      
          const getCampaignInformationUpdatedResponse = simnet.callReadOnlyFn('crowdfunding', 'get-campaign-information', [Cl.uint(1)], address1);
          expect(getCampaignInformationUpdatedResponse.result).toStrictEqual(Cl.ok(
                Cl.tuple({
                    description: Cl.stringUtf8('campaign1UpdatedDescription'),
                    link: Cl.stringUtf8('campaign1UpdatedLink')
                }))
            );
      
        });
    });

    describe('test `update-campaign-information` public function errorr-not-owner', () => {
        it('creates a new campaign and verifies contract data members are updated accordingly, then non-campaign owner attempts to updates campaign information and fails', () => {
          // UPDATE CAMPAIGN INFORMATION ERROR
          const updateCampaignInformationResponse = simnet.callPublicFn('crowdfunding', 'update-campaign-information', [Cl.uint(1), Cl.stringUtf8('campaign1UpdatedDescription'), Cl.stringUtf8('campaign1UpdatedLink')], address2);
          expect(updateCampaignInformationResponse.result).toBeErr(Cl.uint(2));
      
          const getCampaignInformationUpdatedResponse = simnet.callReadOnlyFn('crowdfunding', 'get-campaign-information', [Cl.uint(1)], address1);
          expect(getCampaignInformationUpdatedResponse.result).toStrictEqual(Cl.ok(
                Cl.tuple({
                    description: Cl.stringUtf8('campaign1Description'),
                    link: Cl.stringUtf8('campaign1Link')
                }))
            );
      
        });
    });

    describe('test `update-campaign-information` public function error-campaign-does-not-exist', () => {
        it('creates a new campaign and verifies contract data members are updated accordingly, then tx-sender attempts to update non-existent-campaign and fails', () => {
          // UPDATE CAMPAIGN INFORMATION ERROR
          const updateCampaignInformationResponse = simnet.callPublicFn('crowdfunding', 'update-campaign-information', [Cl.uint(2), Cl.stringUtf8('campaign1UpdatedDescription'), Cl.stringUtf8('campaign1UpdatedLink')], address2);
          expect(updateCampaignInformationResponse.result).toBeErr(Cl.uint(3));
      
        });
    });
  
});