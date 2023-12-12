import { initSimnet, tx } from "@hirosystems/clarinet-sdk";
import { describe, expect, it } from "vitest";
import { Cl } from '@stacks/transactions';

const simnet = await initSimnet();
const accounts = simnet.getAccounts();
// const assestsMap = simnet.getAssetsMap();
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;
const address3 = accounts.get("wallet_3")!;
const BLOCKS_IN_HOUR = 6;
const BLOCKS_IN_DAY = BLOCKS_IN_HOUR * 24;
const BLOCKS_IN_WEEK = BLOCKS_IN_DAY * 7;
const BLOCKS_IN_MONTH = BLOCKS_IN_DAY * 30;
const BLOCKS_IN_YEAR = BLOCKS_IN_MONTH * 12;

// MAYBE USE FOR VERIFYING WALLETS HAVE CORRECT BALANCE AFTER INVEST AND REFUND
// const assestsMap = simnet.getAssetsMap();
// const wallet2Balance = assestsMap.get("STX")!.get(address2)!;
// console.log('wallet2Balance', wallet2Balance);
// const investResponse = simnet.callPublicFn('crowdfunding', 'invest', [Cl.uint(1), Cl.uint(50_000)], address2);
// expect(investResponse.result).toBeOk(Cl.bool(true));
// const assestsMapUpdated = simnet.getAssetsMap();
// const wallet2NewBalance = assestsMap.get("STX")!.get(address2)!;
// console.log('wallet2NewBalance', wallet2NewBalance);

/*
  The test below is an example. To learn more, read the testing documentation here:
  https://docs.hiro.so/clarinet/feature-guides/test-contract-with-clarinet-sdk
*/

describe("example tests", () => {
  it("ensures simnet is well initalised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

});

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

describe('test `update-campaign-information` public function ok', () => {
  it('creates a new campaign and verifies contract data members are updated accordingly, then campaign owner updates campaign information and verifies contract data members are updated accordingly', () => {
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
    
    // UPDATE CAMPAIGN INFORMATION
    const updateCampaignInformationResponse = simnet.callPublicFn('crowdfunding', 'update-campaign-information', [Cl.uint(1), Cl.stringUtf8('campaign1UpdatedDescription'), Cl.stringUtf8('campaign1UpdatedLink')], address1);
    expect(updateCampaignInformationResponse.result).toBeOk(Cl.bool(true));

    const getCampaignInformationUpdatedResponse = simnet.callReadOnlyFn('crowdfunding', 'get-campaign-information', [Cl.uint(1)], address1);
    expect(getCampaignInformationUpdatedResponse.result).toStrictEqual(Cl.ok(
      Cl.tuple({
          description: Cl.stringUtf8('campaign1UpdatedDescription'),
          link: Cl.stringUtf8('campaign1UpdatedLink')
      })));

  });
});

describe('test `update-campaign-information` public function errorr-not-owner', () => {
  it('creates a new campaign and verifies contract data members are updated accordingly, then non campaign owner attempts to updates campaign information and fails', () => {
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
    
    // UPDATE CAMPAIGN INFORMATION ERROR
    const updateCampaignInformationResponse = simnet.callPublicFn('crowdfunding', 'update-campaign-information', [Cl.uint(1), Cl.stringUtf8('campaign1UpdatedDescription'), Cl.stringUtf8('campaign1UpdatedLink')], address2);
    expect(updateCampaignInformationResponse.result).toBeErr(Cl.uint(2));

    const getCampaignInformationUpdatedResponse = simnet.callReadOnlyFn('crowdfunding', 'get-campaign-information', [Cl.uint(1)], address1);
    expect(getCampaignInformationUpdatedResponse.result).toStrictEqual(Cl.ok(
      Cl.tuple({
          description: Cl.stringUtf8('campaign1Description'),
          link: Cl.stringUtf8('campaign1Link')
      })));

  });
});

describe('test `invest` public function ok', () => {
  it('creates a new campaign and verifies contract data members are updated accordingly, investor invests, verifies contract campaign data members are updated accordingly', () => {
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

    // INVEST
    const investResponse = simnet.callPublicFn('crowdfunding', 'invest', [Cl.uint(1), Cl.uint(50_000)], address2);
    expect(investResponse.result).toBeOk(Cl.bool(true));

    const getCampaignTotalsResponse2 = simnet.callReadOnlyFn('crowdfunding', 'get-campaign-totals', [Cl.uint(1)], address1);
    expect(getCampaignTotalsResponse2.result).toStrictEqual(Cl.ok(
      Cl.tuple({
          'total-investment': Cl.uint(50_000),
          'total-investors': Cl.uint(1)
      })));

    const getTotalInvestmentsResponse = simnet.callReadOnlyFn('crowdfunding', 'get-total-investments', [], address1);
    expect(getTotalInvestmentsResponse.result).toBeOk(Cl.uint(1));

    const getTotalInvestmentValueResponse = simnet.callReadOnlyFn('crowdfunding', 'get-total-investment-value', [], address1);
    expect(getTotalInvestmentValueResponse.result).toBeOk(Cl.uint(50_000));

  });
});

describe('test `invest` public function error-campaign-does-not-exist', () => {
  it('investor tries to invest in a non-existent campaign, verifies contract campaign data members remain unchanged after failed investment attempt', () => {
    // INVEST
    const investResponse = simnet.callPublicFn('crowdfunding', 'invest', [Cl.uint(1), Cl.uint(1)], address2);
    expect(investResponse.result).toBeErr(Cl.uint(3));

    const getTotalInvestmentsResponse = simnet.callReadOnlyFn('crowdfunding', 'get-total-investments', [], address1);
    expect(getTotalInvestmentsResponse.result).toBeOk(Cl.uint(0));

    const getTotalInvestmentValueResponse = simnet.callReadOnlyFn('crowdfunding', 'get-total-investment-value', [], address1);
    expect(getTotalInvestmentValueResponse.result).toBeOk(Cl.uint(0));

  });
});

describe('test `invest` public function error-insufficient-balance', () => {
  it('creates a new campaign and verifies contract data members are updated accordingly, investor tries to invest more than their STX balance, verifies contract campaign data members remain unchanged after failed investment attempt', () => {
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

    // INVEST
    const investResponse = simnet.callPublicFn('crowdfunding', 'invest', [Cl.uint(1), Cl.uint(100_000_000_000_001)], address2);
    expect(investResponse.result).toBeErr(Cl.uint(5));

    const getCampaignTotalsResponse2 = simnet.callReadOnlyFn('crowdfunding', 'get-campaign-totals', [Cl.uint(1)], address1);
    expect(getCampaignTotalsResponse2.result).toStrictEqual(Cl.ok(
      Cl.tuple({
          'total-investment': Cl.uint(0),
          'total-investors': Cl.uint(0)
      })));

    const getTotalInvestmentsResponse = simnet.callReadOnlyFn('crowdfunding', 'get-total-investments', [], address1);
    expect(getTotalInvestmentsResponse.result).toBeOk(Cl.uint(0));

    const getTotalInvestmentValueResponse = simnet.callReadOnlyFn('crowdfunding', 'get-total-investment-value', [], address1);
    expect(getTotalInvestmentValueResponse.result).toBeOk(Cl.uint(0));

  });
});

describe('test `refund` public function ok', () => {
  it('creates a new campaign and verifies contract data members are updated accordingly, investor invests, investor requests refund, verifies contract campaign data members are updated accordingly', () => {
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

    // INVEST
    const investResponse = simnet.callPublicFn('crowdfunding', 'invest', [Cl.uint(1), Cl.uint(50_000)], address2);
    expect(investResponse.result).toBeOk(Cl.bool(true));

    const getCampaignTotalsResponse2 = simnet.callReadOnlyFn('crowdfunding', 'get-campaign-totals', [Cl.uint(1)], address1);
    expect(getCampaignTotalsResponse2.result).toStrictEqual(Cl.ok(
      Cl.tuple({
          'total-investment': Cl.uint(50_000),
          'total-investors': Cl.uint(1)
      })));

    const getTotalInvestmentsResponse = simnet.callReadOnlyFn('crowdfunding', 'get-total-investments', [], address1);
    expect(getTotalInvestmentsResponse.result).toBeOk(Cl.uint(1));

    const getTotalInvestmentValueResponse = simnet.callReadOnlyFn('crowdfunding', 'get-total-investment-value', [], address1);
    expect(getTotalInvestmentValueResponse.result).toBeOk(Cl.uint(50_000));

    // REFUND
    const refundResponse = simnet.callPublicFn('crowdfunding', 'refund', [Cl.uint(1)], address2);
    expect(refundResponse.result).toBeOk(Cl.bool(true));

    const getCampaignTotalsResponse3 = simnet.callReadOnlyFn('crowdfunding', 'get-campaign-totals', [Cl.uint(1)], address1);
    expect(getCampaignTotalsResponse3.result).toStrictEqual(Cl.ok(
      Cl.tuple({
          'total-investment': Cl.uint(0),
          'total-investors': Cl.uint(0)
      })));

    const getTotalInvestmentsResponse2 = simnet.callReadOnlyFn('crowdfunding', 'get-total-investments', [], address1);
    expect(getTotalInvestmentsResponse2.result).toBeOk(Cl.uint(0));

    const getTotalInvestmentValueResponse2 = simnet.callReadOnlyFn('crowdfunding', 'get-total-investment-value', [], address1);
    expect(getTotalInvestmentValueResponse2.result).toBeOk(Cl.uint(0));

  });
});

describe('test `refund` public function error-no-investment', () => {
  it('creates a new campaign and verifies contract data members are updated accordingly, non-investor attempts refund request', () => {
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

    // REFUND
    const refundResponse = simnet.callPublicFn('crowdfunding', 'refund', [Cl.uint(1)], address2);
    expect(refundResponse.result).toBeErr(Cl.uint(6));

  });
});

describe('test `refund` public function error-campaign-does-not-exist', () => {
  it('attempts a refund request on a campaign that does not exist', () => {
    // REFUND
    const refundResponse = simnet.callPublicFn('crowdfunding', 'refund', [Cl.uint(1)], address2);
    expect(refundResponse.result).toBeErr(Cl.uint(3));

  });
});