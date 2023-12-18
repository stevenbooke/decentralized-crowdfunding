import {
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
import './App.css';
import Home from './components/Home';
import Campaigns from './components/Campaigns';
import Layout from './components/Layout';
import { CreateCampaignForm } from './components/CreateCampaignForm';

export type Campaign = {
  campaignId: number,
  name: string,
  fundraiser: string,
  goal: number,
  'target-block-height': number,
  description: string,
  link: string,
  // 'total-investment': number,
  // 'total-investors': number,
  // targetReached: boolean,
  // targetReachedHeight: number,
  // funded: boolean
};

function App() {

  const appConfig = new AppConfig(["store_write", "publish_data"]);
  const userSession = new UserSession({ appConfig });
  const [appDetails, setAppDetails] = useState({
    name: "Crowdfunding",
    icon: "https://freesvg.org/img/1541103084.png",
  });
  const [userData, setUserData] = useState<UserData | undefined>(undefined);

  // USER DATA
  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn()
      .then((userData: UserData) => {
        setUserData(userData);
      });
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
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
          <Route path="campaigns" element={<Campaigns userData={userData} />} />
          <Route path="create-campaign-form" element={<CreateCampaignForm userData={userData} />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;