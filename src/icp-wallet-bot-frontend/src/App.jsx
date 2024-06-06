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
  const [telegramId, setTelegramId] = useState(0);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    window.Telegram.WebApp.ready();
    const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
    setTelegramId(telegramUser.id);
    setUserName(telegramUser.first_name);
  }, []);

  useEffect(() => {
    if (telegramId !== 0) {
      checkUser(telegramId);
      console.log(telegramId);
    }
  }, [telegramId]);

  const checkUser = async () => {
    try {
      const result = await icp_wallet_bot_backend.checkUser(telegramId);
      setIsUser(result);
    } catch (error) {
      console.error("Error checking user:", error);
    }
  };

  return (
    <main>
      {!isUser ? (
        <CreateWallet
          telegramId={telegramId}
          userName={userName}
          userStatus={setIsUser}
        />
      ) : (
        <Wallet telegramId={telegramId} />
      )}
    </main>
  );
}

export default App;
