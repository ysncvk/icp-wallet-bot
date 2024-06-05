import { Ed25519KeyIdentity } from "@dfinity/identity/lib/cjs/identity/ed25519";
import { AccountIdentifier } from "@dfinity/ledger-icp";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";

export default function CreateWallet() {
  const [principalId, setPrincipalId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [balance, setBalance] = useState(0);
  const [privateKey, setPrivateKey] = useState("");
  const [publicKey, setPublicKey] = useState("");

  const createWallet = async () => {
    const identity = Ed25519KeyIdentity.generate();
    const publicKey = identity.getPublicKey().toDer();
    const privateKey = identity.getKeyPair().secretKey;

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
    console.log("Principal", principal.toText());

    const accountIdentifier = AccountIdentifier.fromPrincipal({ principal }); // Hesap kimliğini oluşturuyoruz
    const accountId = accountIdentifier.toHex(); // Hesap kimliğini hexadecimal formata dönü
    console.log("accountId", accountId);
  };

  return (
    <Stack gap={3}>
      <Typography align="center" variant="h6">
        Hey, you need a wallet!
      </Typography>
      <img src="/walet.png" width="200" />
      <Button
        onClick={createWallet}
        variant="contained"
        fullWidth
        sx={{ padding: 2 }}
      >
        Create Wallet
      </Button>
    </Stack>
  );
}
