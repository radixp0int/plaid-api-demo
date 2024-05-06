import axios from "axios";
import { usePlaidLink } from "react-plaid-link";
import { useCallback, useEffect, useState } from "react";

axios.defaults.baseURL = "http://localhost:8000";

type LinkProps = string | null;
type PublicTokenProps = string | null;
interface AccountProps {
  account: string;
  routing: string;
}

function PlaidAuth({ publicToken }: { publicToken: string }) {
  const [account, setAccount] = useState<AccountProps>();

  useEffect(() => {
    async function fetchData() {
      const accessToken = await axios.post("/api/exchange_public_token", {
        public_token: publicToken,
      });
      console.log("accessToken", accessToken.data);
      const auth = await axios.post("/auth", {
        access_token: accessToken.data.accessToken,
      });
      console.log("auth data ", auth.data);
      setAccount(auth.data.numbers.ach[0]);
    }
    fetchData();
  }, [publicToken]);

  return (
    account && (
      <>
        <p>Account number: {account.account}</p>
        <p>Routing number: {account.routing}</p>
      </>
    )
  );
}

function App() {
  const [linkToken, setLinkToken] = useState<LinkProps>(null);
  const [publicToken, setPublicToken] = useState<PublicTokenProps>(null);

  const fetchLinkToken = useCallback(async () => {
    const response = await axios.post("/api/create_link_token");
    setLinkToken(response.data.link_token);
    console.log("response :", response.data);
  }, []);

  useEffect(() => {
    fetchLinkToken();
  }, [fetchLinkToken]);

  const config: Parameters<typeof usePlaidLink>[0] = {
    token: linkToken,
    onSuccess: (public_token, metadata) => {
      setPublicToken(public_token);
      console.log("public_token :", public_token);
      console.log("metadata :", metadata);
    },
  };

  const { open, ready } = usePlaidLink(config);

  return publicToken ? (
    <PlaidAuth publicToken={publicToken} />
  ) : (
    <>
      <button onClick={() => open()} disabled={!ready}>
        Link account
      </button>
    </>
  );
}

export default App;
