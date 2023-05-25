import styles from "../styles/InstructionsComponent.module.css";
import Router, { useRouter } from "next/router";
import { useSigner, useNetwork, useBalance } from 'wagmi';
import { useState, useEffect } from 'react';
import tokenJson from "../utils/MyERC20Votes.json";
import ballotJson from "../utils/Ballot.json";
import { ethers } from "ethers";

export default function InstructionsComponent() {
	const router = useRouter();
	return (
		<div className={styles.container}>
			<header className={styles.header_container}>
				<h1>
					Tokenized<span>Ballot</span>
				</h1>
			</header>

			<div className={styles.buttons_container}>
			    <PageBody></PageBody> 
			</div>
			<div style={{ paddingTop: '30px' }}></div> {/* Add a gap using padding */}
			<div className={styles.footer}>
				We made it!!!!
			</div>
		</div>
	);
}

function PageBody() {
	return (
		<div>
		<WalletInfo></WalletInfo>
		<div style={{ paddingTop: '10px' }}></div> {/* Add a gap using padding */}
		<RequestTokens></RequestTokens>
		<div style={{ paddingTop: '10px' }}></div> {/* Add a gap using padding */}
		<Delegate></Delegate>
		<div style={{ paddingTop: '10px' }}></div> {/* Add a gap using padding */}
		<Vote></Vote>
		</div>
	)
}

function WalletInfo() {
	const { data: signer, isError, isLoading } = useSigner()
	const { chain, chains } = useNetwork()
	if (signer) return (
		<>
			<p>Your account address is {signer._address}</p>
			<p>Connected to the {chain.name} network</p>
			<button onClick={() =>  signMessage(signer, "I love potatoes")}>Sign</button>
			<WalletBalance></WalletBalance>
			<TokenBalance></TokenBalance>
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
			Your token Balance is: {data}
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

function _getTokenAddress() {
	return fetch('http://localhost:3001/token-address')
	  .then(response => response.text())
	  .then(data => data)
	  .catch(error => {
		console.error('Error fetching token contract address:', error);
	  });
  }

  async function _getBallotAddress() {
		return fetch('http://localhost:3001/ballot-address')
			.then(response => response.text())
			.then(data => data)
			.catch(error => {
			console.error('Error fetching ballot contract address:', error);
			});
		}
		



function Delegate() {
	const { data: signer } = useSigner();
	const [txData, setTxData] = useState(null);
	const [isLoading, setLoading] = useState(false);
	const [delegateAddress, setDelegateAddress] = useState('');
	if (txData) return (
		<div>
			<p>Delegate Transaction completed!</p>
			<a href = {"https://goerli.etherscan.io/tx/" + txData.hash} target="_blank">
				{txData.hash}</a>
		</div>
	)
	if (isLoading) return <p>Delegating tokens...</p>;
	
	return(
	<div>
      <input
        type="text"
        value={delegateAddress}
        onChange={(e) => setDelegateAddress(e.target.value)}
        placeholder="Enter delegate address"
		/>
		<button onClick={() => delegateTokens(signer, delegateAddress, setLoading, setTxData)}>
			Delegate Tokens</button>
	  </div>
	);
}

async function delegateTokens(signer, DelegateAddress, setLoading, setTxData) {
		try {
			setLoading(true);
			const tokenAddress = _getTokenAddress();
			const tokenContract = new ethers.Contract(
				tokenAddress,
				tokenJson.abi,
				signer
			);
		
		const txData = await tokenContract.delegate(DelegateAddress);
		setLoading(false);
		setTxData(txData);

		} catch (error) {
			setTxData(null);
			setLoading(false);
			console.error('Error delegating tokens:', error);
		}
	}


	function Vote() {
		const { data: signer } = useSigner();
		const [proposals, setProposals] = useState([]);
		const [votesToSend, setVotesToSend] = useState([]);
		const [isLoading, setLoading] = useState(false);
		const [txData, setTxData] = useState(null);
	  
		useEffect(() => {
		  fetchProposals();
		}, [txData]);
	  
		const fetchProposals = async () => {
		  setLoading(true);
		  try {
			const response = await fetch('http://localhost:3001/proposals');
			const data = await response.json();
			setProposals(data);
  			setLoading(false);
		  } catch (error) {
			console.error('Error fetching proposals:', error);
			// Handle the error appropriately
			setLoading(false);
		  }
		};
	  
		const handleVote = async (proposalNumber) => {
		  setLoading(true);
		  if (votesToSend[proposalNumber] <= 0 || !votesToSend[proposalNumber]) {
			alert('Please enter a valid number of votes to send');
			//alert(proposals.map((proposal, index) => `${index}) ${proposal}`));
			setLoading(false);
			return;
		  }
		  try {
			const ballotAddress = _getBallotAddress();
			const ballotContract = new ethers.Contract(
				ballotAddress,
				ballotJson.abi,
				signer);	
			const transaction = await ballotContract.vote(proposalNumber, votesToSend[proposalNumber]);
			setTxData(transaction);
			fetchProposals();
			//setLoading(false);
		  } catch (error) {
			console.error('Error voting:', error);
			// Handle the error appropriately
			setLoading(false);
		  }
		};
	  
		if (isLoading) {
		  return <p>Loading proposals...</p>;
		}
	  
		if (txData) {
		  return (
			<div>
			  <p>Voting Transaction completed!</p>
			  <a href={`https://goerli.etherscan.io/tx/${txData.hash}`} target="_blank" rel="noopener noreferrer">
				{txData.hash}
			  </a>

			</div>
		  );
		}
		return (
			<div>
			  <h2>Proposals:</h2>
			  {proposals.map((proposal, index) => (
				<div key={index}>
				  <p>
					{proposal} {' '}
					<input
					  type="number"
					  value={votesToSend[index]}
						onChange={(e) => {
							const updatedVotesToSend = [...votesToSend];
							//otesToSend[index] = parseInt(e.target.value);
							updatedVotesToSend[index] = parseInt(e.target.value);
							setVotesToSend(updatedVotesToSend);
					}}
					/>
					<button onClick={() => handleVote(index)}>Vote</button>
				  </p>
				</div>
			  ))}
			</div>
		  );
	}
		  

function RequestTokens() {
	const { data: signer } = useSigner();
	const [txData, setTxData] = useState(null);
	const [isLoading, setLoading] = useState(false);
	if (txData) return (
		<div>
			<p>Transaction completed!</p>
			<a href = {"https://goerli.etherscan.io/tx/" + txData.hash} target="_blank">{txData.
			hash}</a>
		</div>
	)
	if (isLoading) return <p>Requesting token to be minted...</p>;
	
	return(
	<div>
		<button onClick={() => requestTokens(signer, "signature", setLoading, setTxData)}
		>Request Tokens</button>
	</div>
	);
}

	function requestTokens(signer, signature, setLoading, setTxData) {
	setLoading(true);
	const requestOptions = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({address: signer._address, signature: signature })
	};
	fetch('http://localhost:3001/request-tokens', requestOptions)
		.then(response => response.json())
		.then((data) => {
			setTxData(data);
			setLoading(true);
		});
	}


function signMessage(signer, message) {
	signer.signMessage(message).then(
	(signature) => {console.log(signature)},	
	(error) => {console.error(error)})
}


function WalletBalance() {
	const { data: signer } = useSigner()
	const { data, isError, isLoading } = useBalance({
		address: signer._address,
	  })
	 
	  if (isLoading) return <div>Fetching balance…</div>
	  if (isError) return <div>Error fetching balance</div>
	  return (
		<div>
		  Balance: {data?.formatted} {data?.symbol}
		</div>
	  )	
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
