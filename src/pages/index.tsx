import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import { useState } from "react";
import { useAccount, useContractWrite, useWaitForTransaction, useNetwork, useSwitchNetwork } from "wagmi";
import { parseEther, parseUnits } from "viem";
import DonateABI from "../../Donate.json";
import USDCABI from "../../USDC.json";


const DONATION_CONTRACT_ADDRESS = "0x451497cb178DAcC5f70ACff6dc5Aa0915B13bE3F";
const USDC_CONTRACT_ADDRESS = "0x53C3a97CD1256b85f142C1C9addD254EE9Cc9696";
const SEPOLIA_CHAIN_ID = 11155111;

// Sepolia network configuration for public RPC
const SEPOLIA_NETWORK = {
	chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
	chainName: 'Sepolia test network',
	rpcUrls: ['https://1rpc.io/sepolia'],
	nativeCurrency: {
		name: 'Ethereum',
		symbol: 'ETH',
		decimals: 18,
	},
	blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

export default function Home() {
	const [ethAmount, setEthAmount] = useState("");
	const [usdcAmount, setUsdcAmount] = useState("");
	const [isApproving, setIsApproving] = useState(false);
	
	const { address, isConnected } = useAccount();
	const { chain } = useNetwork();
	const { switchNetwork, isLoading: isSwitching, error: switchError } = useSwitchNetwork();
	
	const isCorrectNetwork = chain?.id === SEPOLIA_CHAIN_ID;
	
	const switchToSepolia = async () => {
		try {
			switchNetwork?.(SEPOLIA_CHAIN_ID);
		} catch (error) {
			console.error('Failed to switch to Sepolia:', error);
		}
	};
	
	// Contract write hooks
	const { write: donateEth, data: ethTxData, isLoading: isEthPending } = useContractWrite({
		address: DONATION_CONTRACT_ADDRESS,
		abi: DonateABI.abi,
		functionName: "donateEth",
	});
	
	const { write: approveUsdc, data: approveTxData, isLoading: isApprovePending } = useContractWrite({
		address: USDC_CONTRACT_ADDRESS,
		abi: USDCABI.abi,
		functionName: "approve",
	});
	
	const { write: donateUsdc, data: usdcTxData, isLoading: isUsdcPending } = useContractWrite({
		address: DONATION_CONTRACT_ADDRESS,
		abi: DonateABI.abi,
		functionName: "donateUsdc",
	});
	
	// Transaction receipt hooks
	const { isLoading: isEthTxLoading } = useWaitForTransaction({ hash: ethTxData?.hash });
	const { isLoading: isApproveTxLoading } = useWaitForTransaction({ hash: approveTxData?.hash });
	const { isLoading: isUsdcTxLoading } = useWaitForTransaction({ hash: usdcTxData?.hash });

	const handleEthDonation = async () => {
		if (!ethAmount || !isConnected || !isCorrectNetwork) return;
		
		try {
			donateEth?.({
				value: parseEther(ethAmount)
			});
		} catch (error) {
			console.error("ETH donation failed:", error);
		}
	};

	const handleUsdcDonation = async () => {
		if (!usdcAmount || !isConnected || !isCorrectNetwork) return;
		
		try {
			const amount = parseUnits(usdcAmount, 6); // USDC has 6 decimals
			
			// First approve USDC spending
			approveUsdc?.({
				args: [DONATION_CONTRACT_ADDRESS, amount]
			});
			
		} catch (error) {
			console.error("USDC donation failed:", error);
		}
	};

	// Function to donate USDC after approval
	const handleUsdcDonationAfterApproval = () => {
		if (!usdcAmount || !isConnected || !isCorrectNetwork) return;
		
		const amount = parseUnits(usdcAmount, 6);
		donateUsdc?.({
			args: [amount]
		});
	};

	return (
		<>
			<Head>
				<title>WalletConnect | Sepolia Testnet</title>
				<meta
					name="description"
					content="Connect your wallet to Sepolia testnet"
				/>
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1"
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<header>
				<div className={styles.header}>
					<div className={styles.logo}>
						<Image
							src="/logo.svg"
							alt="WalletConnect Logo"
							height="32"
							width="203"
						/>
					</div>
					<div className={styles.buttons}>
						<w3m-button />
					</div>
				</div>
			</header>
			<main className={styles.main}>
				<div className={styles.wrapper}>
					<div className={styles.container}>
						<h1>Sepolia Testnet Donation Platform</h1>
						<div className={styles.content}>
							<p>
								Connect your wallet and donate ETH or USDC to support the project.
							</p>
							
							{isConnected ? (
								<>
									{!isCorrectNetwork ? (
										<div className={styles.networkWarning}>
											<p>⚠️ Please switch to Sepolia testnet to use this dApp</p>
											<p>Current network: {chain?.name || 'Unknown'}</p>
											<button
												onClick={switchToSepolia}
												className={styles.switchButton}
												disabled={isSwitching}
											>
												{isSwitching ? 'Switching...' : 'Switch to Sepolia'}
											</button>
											{switchError && (
												<p className={styles.error}>
													Error switching network: {switchError.message}
												</p>
											)}
										</div>
									) : (
										<div className={styles.donationSection}>
									{/* ETH Donation */}
									<div className={styles.donationCard}>
										<h3>Donate ETH</h3>
										<input
											type="number"
											placeholder="Amount in ETH"
											value={ethAmount}
											onChange={(e) => setEthAmount(e.target.value)}
											className={styles.input}
											step="0.001"
											min="0"
										/>
										<button
											onClick={handleEthDonation}
											disabled={!ethAmount || isEthPending || isEthTxLoading}
											className={styles.donateButton}
										>
											{isEthPending || isEthTxLoading ? "Donating..." : "Donate ETH"}
										</button>
									</div>

									{/* USDC Donation */}
									<div className={styles.donationCard}>
										<h3>Donate USDC</h3>
										<input
											type="number"
											placeholder="Amount in USDC"
											value={usdcAmount}
											onChange={(e) => setUsdcAmount(e.target.value)}
											className={styles.input}
											step="0.01"
											min="0"
										/>
										<button
											onClick={handleUsdcDonation}
											disabled={!usdcAmount || isApprovePending || isApproveTxLoading}
											className={styles.donateButton}
										>
											{isApprovePending || isApproveTxLoading ? "Approving..." : "1. Approve USDC"}
										</button>
										<button
											onClick={handleUsdcDonationAfterApproval}
											disabled={!usdcAmount || isUsdcPending || isUsdcTxLoading || !approveTxData}
											className={styles.donateButton}
											style={{ marginTop: '0.5rem' }}
										>
											{isUsdcPending || isUsdcTxLoading ? "Donating..." : "2. Donate USDC"}
										</button>
										<p className={styles.note}>
											Note: First approve, then donate in two separate transactions
										</p>
									</div>
									</div>
									)}
								</>
							) : (
								<p>Please connect your wallet to make donations.</p>
							)}
						</div>
					</div>
					<div className={styles.footer}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							height={16}
							width={16}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
							/>
						</svg>
						<a
							href="https://docs.walletconnect.com/web3modal/react/about"
							target="_blank"
						>
							Check out the full documentation here
						</a>
					</div>
				</div>
			</main>
		</>
	);
}