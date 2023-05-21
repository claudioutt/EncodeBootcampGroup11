import styles from "../styles/InstructionsComponent.module.css";
import Router, { useRouter } from "next/router";
import { useSigner, useNetwork, useBalance} from "wagmi";
import { useState, useEffect } from 'react';

export default function InstructionsComponent() {
	const router = useRouter();
	return (
		<div className={styles.container}>
			<header className={styles.header_container}>
				<h1>
					The Group11 <span>Democracy</span>
				</h1>
			</header>
			<div className={styles.buttons_container}>
				<PageBody></PageBody>
			</div>
			<div className={styles.footer}>
				Footer
			</div>
		</div>
	);
}

function PageBody() {
	return (
		<div>
			<WalletInfo></WalletInfo>
			
		</div>
	)
}

function WalletInfo() {
	const { data: signer, isError, isLoading } = useSigner();
	const { chain, chains } = useNetwork();
	if (signer) return (
		<>
			<p>Your account address is {signer._address}</p>
			<p>Connected to the {chain.name} network</p>
			<button onClick={() => signMessage(signer, "I love potatoes")}>Sign</button>
			<WalletBalance></WalletBalance>
			<p> </p>
			<RequestTokens></RequestTokens>
			<TokenBalance></TokenBalance>
			<GetResults></GetResults>
			<Vote></Vote>
		</>
	)
	else if (isLoading) return (
		<>
			<p>Loading...</p>
		</>
	)
	else return (
		<>
			<p>Connect account to continue</p>
		</>
	)
}

function TokenBalance() {
	const { data: signer } = useSigner();
	const [data, setData] = useState(null);
	const [isLoading, setLoading] = useState(false);

	if (data) return (
		<div>
			<p> Your token balance is: </p>
			<p>{data}</p>
		</div>
	)
	if (isLoading) return <p>Requesting balance...</p>;



	return (
		<div>
			{getBalance(signer, setLoading, setData)}
		</div>
	)
}

function getBalance(signer, setLoading, setTxData) {
	setLoading(true);
	fetch('http://localhost:3001/balance/' + signer._address)
		.then(response => response.json())
		.then((data) => {
			setTxData(data);
			setLoading(true);
		})
		
}

function GetResults() {
	const { data: signer } = useSigner();
	const [data, setData] = useState(null);
	const [isLoading, setLoading] = useState(false);

	if (data) return (
		<div>
			<p> The results are: {JSON.stringify(data)}</p>
			
		</div>
	)
	if (isLoading) return <p>And the results are...</p>;



	return (
		<div>
			{getResults(signer, setLoading, setData)}
		</div>
	)
}

function getResults(signer, setLoading, setTxData) {
	setLoading(true);
	fetch('http://localhost:3001/proposals/')
		.then((response) => response.json())
		.then((data) => {
			setTxData(data);
			setLoading(true);
		})
		
}

function RequestTokens() {
	const { data: signer } = useSigner();
	const [data, setData] = useState(null);
	const [isLoading, setLoading] = useState(false);

	if (data) return (
		<div>
			<p> Tx Completed!</p>
			<a href={'https://goerli.etherscan.io/tx/' + data.hash} target='_blank'>
				{data.hash}</a>
		</div>
	)
	if (isLoading) return <p>Requesting tokens to be minted...</p>;



	return (
		<div>
			<button onClick={() => requestTokens(signer, "signature", setLoading, setData)}>Request Tokens</button>
		</div>
	)
}

function requestTokens(signer, signature, setLoading, setTxData) {
	setLoading(true);
	const requestOptions = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json'},
		body: JSON.stringify({address: signer._address, signature: signature})
	};
	fetch('http://localhost:3001/request-tokens', requestOptions)
		.then(response => response.json())
		.then((data) => {
			setTxData(data);
			setLoading(true);
		})
}

function Vote() {
	const { data: signer } = useSigner();
	const [data, setData] = useState(null);
	const [isLoading, setLoading] = useState(false);

	if (data) return (
		<div>
			<p> Tx Completed!</p>
			<a href={'https://goerli.etherscan.io/tx/' + data.hash} target='_blank'>
				{data.hash}</a>
		</div>
	)
	if (isLoading) return <p>Voting for proposal 0...</p>;



	return (
		<div>
			<button onClick={() => vote(signer, "signature", setLoading, setData)}>Vote for Proposal 0</button>
		</div>
	)
}

function vote(signer, signature, setLoading, setTxData) {
	setLoading(true);
	const requestOptions = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json'},
		body: JSON.stringify({proposal: 0, voteNumbers: 10})
	};
	fetch('http://localhost:3001/vote', requestOptions)
		.then(response => response.json())
		.then((data) => {
			setTxData(data);
			setLoading(true);
		})
}

function WalletBalance() {
	const { data: signer } = useSigner();  
	const { data, isError, isLoading } = useBalance({address: signer._address,})
	
	  if (isLoading) return <div>Fetching balance…</div>
	  if (isError) return <div>Error fetching balance</div>
	  return (
		<div>
		  Balance: {data?.formatted} {data?.symbol}
		</div>
	  )
	
}

function signMessage(signer, message) {
	signer.signMessage(message).then(
		(signature) => {console.log(signature)},
		(error) => {console.error(error)});
}

function ApiInfo() {
	const [data, setData] = useState(null);
	const [isLoading, setLoading] = useState(false);

	useEffect(() => {
	setLoading(true);
	fetch('https://random-data-api.com/api/v2/users')
		.then((res) => res.json())
		.then((data) => {
		setData(data);
		setLoading(false);
		});
	}, []);

	if (isLoading) return <p>Loading...</p>;
	if (!data) return <p>No profile data</p>;

	return (
	<div>
		<h1>{data.username}</h1>
		<p>{data.email}</p>
	</div>
	);
}