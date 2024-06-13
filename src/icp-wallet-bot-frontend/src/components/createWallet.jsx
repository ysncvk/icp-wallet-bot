import { Ed25519KeyIdentity } from "@dfinity/identity/lib/cjs/identity/ed25519";
import { AccountIdentifier } from "@dfinity/ledger-icp";
import { icp_wallet_bot_backend } from "declarations/icp-wallet-bot-backend";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import LoadingButton from "@mui/lab/LoadingButton";

export default function CreateWallet({ userName, telegramId, userStatus }) {
  const [loading, setLoading] = useState(false);

  const createWallet = async () => {
    setLoading(true);
    const identity = Ed25519KeyIdentity.generate();
    const publicKey = identity.getPublicKey().toDer();
    const privateKey = identity.getKeyPair().secretKey;

    console.log("public key:", publicKey, "type:", typeof publicKey);
    console.log("private key:", privateKey, "type:", typeof privateKey);

    // Public key'i Base64 formatına çevir
    const publicKeyBase64 = btoa(
      String.fromCharCode(...new Uint8Array(publicKey))
    );

    // Private key'i Base64 formatına çevir
    const privateKeyBase64 = btoa(
      String.fromCharCode(...new Uint8Array(privateKey))
    );

    console.log("Public Key:", publicKeyBase64);
    console.log("Private Key:", privateKeyBase64);

    const principal = identity.getPrincipal(); // Principal'i alıyoruz

    console.log("Principal", principal);

    const accountIdentifier = AccountIdentifier.fromPrincipal({ principal });
    console.log(
      "accountIdentifier:",
      accountIdentifier,
      "type:",
      typeof accountIdentifier
    ); // Hesap kimliğini oluşturuyoruz
    const accountId = accountIdentifier.toHex(); // Hesap kimliğini hexadecimal formata dönü

    const result = await icp_wallet_bot_backend.createUser(telegramId, {
      principalId: principal,
      accountId: accountId,
      publicKey: publicKeyBase64,
      privateKey: privateKeyBase64,
    });
    if (result) {
      console.log("user created...");
      userStatus(true);
      setLoading(false);
    }
  };

  return (
    <Stack gap={0}>
      <Typography align="center" variant="h6">
        {`Hey ${userName}, you need a wallet!`}
      </Typography>
      <img src="/createwallet.png" width="300" />
      <LoadingButton
        onClick={createWallet}
        variant="contained"
        fullWidth
        sx={{ padding: 2 }}
        loading={loading}
      >
        Create Wallet
      </LoadingButton>
    </Stack>
  );
}
