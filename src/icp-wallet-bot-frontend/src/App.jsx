import { icp_wallet_bot_backend } from "declarations/icp-wallet-bot-backend";

import { useState, useEffect } from "react";
import { Ed25519KeyIdentity } from "@dfinity/identity";
import { HttpAgent } from "@dfinity/agent";
import { AccountIdentifier, LedgerCanister } from "@dfinity/ledger-icp"; // AccountIdentifier ve ICP sınıflarını içe aktarıyoruz
import CreateWallet from "./components/createWallet";
import Wallet from "./components/wallet";

const localLedgerCanisterId = "bnz7o-iuaaa-aaaaa-qaaaa-cai"; // Yerel Ledger canister ID'si

function App() {
  const [isUser, setIsUser] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const result = await icp_wallet_bot_backend.checkUser();
        setIsUser(result);
      } catch (error) {
        console.error("Error checking user:", error);
      }
    };

    checkUser();
  }, []);

  return <main>{!isUser ? <CreateWallet /> : <Wallet />}</main>;
}

export default App;
