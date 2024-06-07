import { useState, useEffect } from "react";
import { icp_wallet_bot_backend } from "declarations/icp-wallet-bot-backend";
import { HttpAgent } from "@dfinity/agent";
import { LedgerCanister } from "@dfinity/ledger-icp";
import { Principal } from "@dfinity/principal";
import { Buffer } from "buffer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

if (!window.Buffer) {
  window.Buffer = Buffer;
}

const localLedgerCanisterId = "ryjl3-tyaaa-aaaaa-aaaba-cai"; // Yerel Ledger canister ID'si

export default function Wallet({ telegramId }) {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transferAmount, setTransferAmount] = useState("");
  const [recipientAccountId, setRecipientAccountId] = useState("");

  const handleTransfer = async () => {
    try {
      const agent = new HttpAgent({ host: "http://127.0.0.1:4943" });
      agent.fetchRootKey();
      const ledger = LedgerCanister.create({
        agent,
        canisterId: localLedgerCanisterId,
      });

      const accountIdBuffer = Buffer.from(user[0].accountId, "hex");
      const transferAmountE8s = Math.round(transferAmount * 100_000_000); // ICP'yi e8s formatına dönüştürme

      if (!/^[0-9a-fA-F]+$/.test(recipientAccountId)) {
        throw new Error("Recipient Account ID is not a valid hex string");
      }

      // recipientAccountIdBuffer değişkeni oluşturulurken alıcının account ID'si kullanılmalı
      const recipientAccountIdBuffer = Buffer.from(recipientAccountId, "hex");

      const result = await ledger.transfer({
        to: { accountId: recipientAccountIdBuffer },
        amount: { e8s: transferAmountE8s },
        memo: 0, // Opsiyonel olarak not eklemek için
        from_subaccount: accountIdBuffer,
      });

      console.log("Transfer result:", result);
      // Transfer başarılı ise bakiyeyi güncelle
      if (result.Ok !== undefined) {
        const balanceResult = await ledger.accountBalance({
          accountIdentifier: accountIdBuffer,
        });
        const balanceICP = Number(balanceResult.e8s) / 100_000_000;
        console.log("balance number: ", Number(balanceResult.e8s));
        console.log("balanceICP: ", balanceICP);
        setBalance(balanceICP);
      }
    } catch (error) {
      console.error("Error transferring ICP:", error);
    }
  };

  useEffect(() => {
    const fetchUserDataAndBalance = async () => {
      try {
        // Kullanıcı bilgilerini çek
        const userData = await icp_wallet_bot_backend.getUser(telegramId);
        if (userData) {
          setUser(userData);

          // Ledger canister ile bakiyeyi çek
          const agent = new HttpAgent({ host: "http://127.0.0.1:4943" });
          // Sertifika doğrulamasını devre dışı bırak
          agent.fetchRootKey();
          const ledger = LedgerCanister.create({
            agent,
            canisterId: localLedgerCanisterId,
          });

          // Kullanıcının account ID'sini al ve Buffer kullanarak dönüştür
          const accountIdBuffer = Buffer.from(userData[0].accountId, "hex");
          console.log(accountIdBuffer);

          // Bakiyeyi çek
          const balanceResult = await ledger.accountBalance({
            accountIdentifier: accountIdBuffer,
          });
          console.log(balanceResult);
          const balanceICP = Number(balanceResult) / 100_000_000; // e8s formatından ICP'ye çevirme
          console.log("balance number: ", Number(balanceResult));
          console.log("balanceICP: ", balanceICP);
          setBalance(balanceICP);
        }
      } catch (error) {
        console.error("Error fetching user data and balance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndBalance();
  }, [telegramId, setBalance]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>User not found</p>;
  }

  return (
    <>
      <Stack>
        <Typography variant="h4">Your Balance</Typography>
        <Stack direction="row" alignItems="end" gap={3}>
          <Typography variant="h4">{balance}</Typography>
          <Typography variant="body2"> ICP</Typography>
        </Stack>
        <Typography variant="caption">
          {user[0].principalId.toText()}
        </Typography>
      </Stack>

      <div>
        <p>Principal ID: {user[0].principalId.toText()}</p>
        <p>Account ID: {user[0].accountId}</p>
        <p>Public Key: {user[0].publicKey}</p>
        <p>Private Key: {user[0].privateKey}</p>
        <p>Balance: {balance} ICP</p>

        <input
          type="text"
          placeholder="Recipient Account ID"
          value={recipientAccountId}
          onChange={(e) => setRecipientAccountId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Transfer Amount"
          value={transferAmount}
          onChange={(e) => setTransferAmount(e.target.value)}
        />
        <button onClick={handleTransfer}>Send ICP</button>
      </div>
    </>
  );
}
