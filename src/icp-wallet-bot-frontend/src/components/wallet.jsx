import { useState, useEffect } from "react";
import { icp_wallet_bot_backend } from "declarations/icp-wallet-bot-backend";
import { HttpAgent } from "@dfinity/agent";
import { LedgerCanister } from "@dfinity/ledger-icp";

const localLedgerCanisterId = "bnz7o-iuaaa-aaaaa-qaaaa-cai"; // Yerel Ledger canister ID'si

export default function Wallet({ telegramId }) {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDataAndBalance = async () => {
      try {
        // Kullanıcı bilgilerini çek
        const userData = await icp_wallet_bot_backend.getUser(telegramId);
        if (userData) {
          setUser(userData);

          // Hesap bakiyesini çek
          const agent = new HttpAgent();
          const ledgerCanister = LedgerCanister.create({
            agent,
            canisterId: localLedgerCanisterId,
          });

          const balanceResult = await ledgerCanister.accountBalance({
            accountIdentifier: userData.accountId,
            certified: true,
          });
          setBalance(balanceResult.toString());
        }
      } catch (error) {
        console.error("Error fetching user data and balance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndBalance();
  }, [telegramId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>User not found</p>;
  }

  return (
    <div>
      <p>Principal ID: {user.principalId.toText()}</p>
      <p>Account ID: {user.accountId}</p>
      <p>Public Key: {user.publicKey}</p>
      <p>Private Key: {user.privateKey}</p>
      <p>Balance: {balance} ICP</p>
    </div>
  );
}
