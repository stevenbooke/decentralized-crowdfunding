import { MouseEventHandler } from 'react';
import {
    UserSession,
    UserData
} from "@stacks/connect";

type HomeProps = {
    userSession: UserSession,
    userData: UserData | undefined,
    connectWallet: MouseEventHandler<HTMLButtonElement>
}

function Home({userSession, userData, connectWallet}: HomeProps) {
  


    return (
        <div className="flex flex-col justify-center items-center h-screen gap-8">
          {!userData && (
            <button
              className="p-4 bg-indigo-500 rounded text-white"
              onClick={connectWallet}
            >
              Connect Wallet
            </button>
          )}
          {userData && (
            <div className="flex gap-4">
                <h1>Crowdfunding</h1>
                <p>Welcome to the decentralized crowdfunding application</p>
            </div>
          )}
        </div>
      );
}

export default Home;