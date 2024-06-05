import { icp_wallet_bot_backend } from "declarations/icp-wallet-bot-backend";

import { useState, useEffect } from "react";
import { Ed25519KeyIdentity } from "@dfinity/identity";
import { HttpAgent } from "@dfinity/agent";
import { AccountIdentifier, LedgerCanister } from "@dfinity/ledger-icp"; // AccountIdentifier ve ICP sınıflarını içe aktarıyoruz
import { AppRoot, Cell, List, Section } from "@telegram-apps/telegram-ui";
import { Button } from "@telegram-apps/telegram-ui";
import { ButtonCell } from "@telegram-apps/telegram-ui";
import "iconify-icon";

const cellsTexts = ["Chat Settings", "Data and Storage", "Devices"];

const localLedgerCanisterId = "bnz7o-iuaaa-aaaaa-qaaaa-cai"; // Yerel Ledger canister ID'si

function App() {
  const [principalId, setPrincipalId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [balance, setBalance] = useState(0);
  const [privateKey, setPrivateKey] = useState("");
  const [publicKey, setPublicKey] = useState("");

  useEffect(() => {
    const fetchBalance = async () => {
      const identity = Ed25519KeyIdentity.generate(); // Yerelde bir kimlik oluşturuyoruz
      const publicKey = identity.getPublicKey().toDer();
      const privateKey = identity.getKeyPair().secretKey; // Private key

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

      const accountIdentifier = AccountIdentifier.fromPrincipal({ principal }); // Hesap kimliğini oluşturuyoruz
      const accountId = accountIdentifier.toHex(); // Hesap kimliğini hexadecimal formata dönüştürüyoruz

      // Hesap bakiyesini sorguluyoruz
      const agent = new HttpAgent({
        host: "http://localhost:4943",
      });

      const ledger = LedgerCanister.create({
        agent,
        canisterId: localLedgerCanisterId,
      });

      try {
        // State'leri güncelliyoruz
        setPrincipalId(principal.toText());
        setAccountId(accountId);
        setBalance(balance);
        setPrivateKey(privateKeyBase64);
        setPublicKey(publicKeyBase64);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    fetchBalance();
  }, []);

  return (
    <AppRoot>
      <List
        style={{
          padding: 10,
        }}
      >
        <Section>
          <Cell
            before={<iconify-icon icon="flowbite:profile-card-solid" />}
            subtitle="Click the button and we will create one for you"
          >
            You dont have a Wallet
          </Cell>
        </Section>
        <Button sx={{ paddingTop: 10 }} mode="filled" size="m" stretched="true">
          Create Wallet
        </Button>
      </List>
    </AppRoot>
  );
}

export default App;
