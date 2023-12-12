import { initSimnet, tx } from "@hirosystems/clarinet-sdk";
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

describe('test `collect` public function', () => {
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

    describe('test `collect` public function ok', () => {
        it('creates a new campaign and verifies contract data members are updated accordingly, investor invests, campaign goal amount is reached, fundraiser collects funds, verifies STX transfers to fundraiser and contract campaign data members are updated accordingly', () => {
          // INVEST
          const assestsMap = simnet.getAssetsMap();
          const wallet1Balance = assestsMap.get("STX")!.get(address1)!;
          const wallet2Balance = assestsMap.get("STX")!.get(address2)!;
          const block = simnet.mineBlock([
            tx.callPublicFn('crowdfunding', 'invest', [Cl.uint(1), Cl.uint(100_000)], address2),
            tx.callPublicFn('crowdfunding', 'collect', [Cl.uint(1)], address1)
          ]);
          const investResponse = block[0];
          const collectResponse = block[1];
          expect(investResponse.result).toBeOk(Cl.bool(true));
          expect(collectResponse.result).toBeOk(Cl.bool(true));
          const assestsMapUpdated = simnet.getAssetsMap();
          const wallet1NewBalance = assestsMapUpdated.get("STX")!.get(address1)!;
          const wallet2NewBalance = assestsMapUpdated.get("STX")!.get(address2)!;
          expect(wallet1NewBalance).toEqual(wallet1Balance + BigInt(100_000));
          expect(wallet2NewBalance).toEqual(wallet2Balance - BigInt(100_000));
          const getCampaignTotalsResponse = simnet.callReadOnlyFn('crowdfunding', 'get-campaign-totals', [Cl.uint(1)], address1);
          expect(getCampaignTotalsResponse.result).toStrictEqual(Cl.ok(
                Cl.tuple({
                    'total-investment': Cl.uint(100_000),
                    'total-investors': Cl.uint(1)
                }))
          );

      
          const getTotalInvestmentsResponse = simnet.callReadOnlyFn('crowdfunding', 'get-total-investments', [], address1);
          expect(getTotalInvestmentsResponse.result).toBeOk(Cl.uint(1));
      
          const getTotalInvestmentValueResponse = simnet.callReadOnlyFn('crowdfunding', 'get-total-investment-value', [], address1);
          expect(getTotalInvestmentValueResponse.result).toBeOk(Cl.uint(100_000));

          const getCampaignStatusResponse = simnet.callReadOnlyFn('crowdfunding', 'get-campaign-status', [Cl.uint(1)], address1);
          // -1 block height, calling collect after invest increased the current
          // block height by 1
          
          // How does block height change when tx.mineBlock is called?
          // Does it go up by 1 for first deploying the contract and then
          // +1 for each tx in the function call?
          expect(getCampaignStatusResponse.result).toStrictEqual(Cl.ok(
            Cl.tuple({
                'target-reached': Cl.bool(true),
                'target-reached-height': Cl.uint(simnet.blockHeight-1),
                funded: Cl.bool(true)
            })));
      
        });
    });

});