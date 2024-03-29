import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { 
  useState,
  useEffect,
} from "react";
import {
  AppConfig,
  UserSession,
  showConnect,
  UserData,
} from "@stacks/connect";
import { StacksMocknet } from "@stacks/network";
import { 
  callReadOnlyFunction,
  cvToValue,
  ClarityValue
} from "@stacks/transactions";
import './App.css';
import Home from './components/Home';
import Campaigns from './components/Campaigns';
import Layout from './components/Layout';
import { CreateCampaignForm } from './components/CreateCampaignForm';

export type Campaign = {
  campaignId: number | bigint,
  name: string,
  fundraiser: string,
  goal: number | bigint,
  targetBlockHeight: number | bigint,
  description: string,
  link: string,
  targetReached: boolean,
  targetReachedHeight: number | bigint,
  funded: boolean
};

function App() {

  const appConfig = new AppConfig(["store_write", "publish_data"]);

  const [userSession, setUserSession] = useState<UserSession>(new UserSession({ appConfig }));
  const [appDetails, setAppDetails] = useState({
    name: "Crowdfunding",
    icon: "https://freesvg.org/img/1541103084.png",
  });
  const [userData, setUserData] = useState<UserData | undefined>(undefined);
  const [campaigns, setCampaigns] = useState<Array<Campaign>>([]);
  const [campaignIdNonce, setCampaignIdNonce] = useState<number | bigint | undefined>(undefined);

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn()
      .then((userData: UserData) => {
        setUserData(userData);
        const contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
        const contractName = 'crowdfunding';
        const functionName = 'get-campaign-id-nonce';
        const network = new StacksMocknet();
        const senderAddress = userData!.identityAddress!;

        const options = {
          contractAddress,
          contractName,
          functionName,
          functionArgs: [],
          network,
          senderAddress,
        };

        return callReadOnlyFunction(options);
      })
      .then((campaignIdNonce: ClarityValue) => {
        setCampaignIdNonce(cvToValue(campaignIdNonce));
      });
    } else if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setUserData(userSession.loadUserData());
      const contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
      const contractName = 'crowdfunding';
      const functionName = 'get-campaign-id-nonce';
      const network = new StacksMocknet();
      const senderAddress = userData!.identityAddress!;

      const options = {
        contractAddress,
        contractName,
        functionName,
        functionArgs: [],
        network,
        senderAddress,
      };

      callReadOnlyFunction(options).then((campaignIdNonce: ClarityValue) => {
        setCampaignIdNonce(cvToValue(campaignIdNonce));
      });
    }

  }, []);

  const connectWallet = () => {
    showConnect({
      appDetails,
      onFinish: () => window.location.reload(),
      userSession,
    });
  };

  return (
    <div>
      {/* Routes nest inside one another. Nested route paths build upon
            parent route paths, and nested route elements render inside
            parent route elements. See the note about <Outlet> below. */}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home userSession={userSession} userData={userData} connectWallet={connectWallet}/>} />
          <Route path="campaigns" element={<Campaigns userData={userData} campaigns={campaigns}/>} />
          <Route path="create-campaign-form" element={<CreateCampaignForm userData={userData}/>} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;