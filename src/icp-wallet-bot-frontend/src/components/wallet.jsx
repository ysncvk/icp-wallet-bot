import { useState, useEffect } from "react";
import { icp_wallet_bot_backend } from "declarations/icp-wallet-bot-backend";
import { HttpAgent } from "@dfinity/agent";
import { AccountIdentifier, LedgerCanister } from "@dfinity/ledger-icp";
import { Principal } from "@dfinity/principal";
import { Buffer } from "buffer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Ed25519KeyIdentity } from "@dfinity/identity/lib/cjs/identity/ed25519";

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
    if (!user || !user[0].accountId) {
      console.error("User account ID is missing");
      return;
    }

    try {
      // Create an HttpAgent with the user's identity
      const privateKey = user[0].privateKey;
      const privateKeyUint8Array = Uint8Array.from(atob(privateKey), (c) =>
        c.charCodeAt(0)
      );
      const identity = Ed25519KeyIdentity.fromSecretKey(privateKeyUint8Array);

      const agent = new HttpAgent({
        host: "http://127.0.0.1:4943",
        identity: identity,
      });
      await agent.fetchRootKey();
      const ledger = LedgerCanister.create({
        agent,
        canisterId: localLedgerCanisterId,
      });

      const transferAmountE8s = BigInt(
        Math.round(transferAmount * 100_000_000)
      ); // Convert ICP to e8s format

      const recipientAccountIdBuffer =
        AccountIdentifier.fromHex(recipientAccountId);

      const result = await ledger.transfer({
        to: recipientAccountIdBuffer, // Assuming Account type is { hash: vec nat8 }
        amount: transferAmountE8s, // Assuming Icrc1Tokens type is { e8s: nat64 }
        fee: BigInt(10000), // Transfer fee, assuming Icrc1Tokens type is { e8s: nat64 }
      });

      console.log("Transfer result:", result);
      // Update balance if transfer is successful
      if (result.Ok !== undefined) {
        console.log("Transfer succeeded");
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
          await agent.fetchRootKey();
          const ledger = LedgerCanister.create({
            agent,
            canisterId: localLedgerCanisterId,
          });

          // Kullanıcının account ID'sini al ve Buffer kullanarak dönüştür
          const accountIdBuffer = Buffer.from(userData[0].accountId, "hex");

          // Bakiyeyi çek
          const balanceResult = await ledger.accountBalance({
            accountIdentifier: accountIdBuffer,
          });

          console.log("balance", balanceResult);
          if (Number(balanceResult) === 0) {
            setBalance(0);
          } else {
            const balanceICP = Number(balanceResult) / 100_000_000; // e8s formatından ICP'ye çevirme
            setBalance(balanceICP);
          }
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

        <input
          type="text"
          placeholder="Recipient Account ID"
          value={recipientAccountId}
          onChange={(e) => setRecipientAccountId(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={transferAmount}
          onChange={(e) => setTransferAmount(e.target.value)}
        />
        <button onClick={handleTransfer}>Send ICP</button>
      </div>
    </>
  );
}
