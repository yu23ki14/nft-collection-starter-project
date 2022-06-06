import './styles/App.css'
import twitterLogo from './assets/twitter-logo.svg'
import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import myEpicNft from './utils/MyEpicNFT.json'

// Constantsを宣言する: constとは値書き換えを禁止した変数を宣言する方法です。
const TWITTER_HANDLE = 'k_0214'
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`
const OPENSEA_LINK = ''
const TOTAL_MINT_COUNT = 50
const CONTRACT_ADDRESS = '0x4ecBD7D6d27C64D19839e322BD5B4d8CD7b31B0E'

const App = () => {
	const [currentAccount, setCurrentAccount] = useState('')

	const checkIswalletConnected = async () => {
		const { ethereum } = window
		if (!ethereum) {
			alert('make sure you have metamask')
			return
		}

		const accounts = await ethereum.request({ method: 'eth_accounts' })

		if (accounts.length > 0) {
			setCurrentAccount(accounts[0])
			setupEventListener()
		}
	}

	useEffect(() => {
		const checkNetwork = async () => {
			const { ethereum } = window
			if (!ethereum) return
			let chainId = await ethereum.request({ method: 'eth_chainId' })
			if (currentAccount && chainId !== '0x4') {
				alert('Rinkeby Network に接続してください。')
			}
		}
		checkNetwork()
	}, [currentAccount])

	const connectWallet = async () => {
		try {
			const { ethereum } = window
			if (!ethereum) {
				alert('get metamask')
				return
			}

			const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
			setCurrentAccount(accounts[0])
			setupEventListener()
		} catch (error) {
			console.log(error)
		}
	}

	const setupEventListener = () => {
		try {
			const { ethereum } = window
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum)
				const signer = provider.getSigner()
				const connectedContract = new ethers.Contract(
					CONTRACT_ADDRESS,
					myEpicNft.abi,
					signer
				)
				connectedContract.on('NewEpicNFTMinted', (from, tokenId) => {
					console.log(from, tokenId.toNumber())
					alert(
						`NFTへのリンクはこちら https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
					)
				})
			}
		} catch (error) {}
	}

	// renderNotConnectedContainer メソッドを定義します。
	const renderNotConnectedContainer = () => (
		<button
			className="cta-button connect-wallet-button"
			onClick={() => connectWallet()}
		>
			Connect to Wallet
		</button>
	)

	useEffect(() => {
		checkIswalletConnected()
	}, [])

	const askContractToMintNft = async () => {
		try {
			const { ethereum } = window
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum)
				const signer = provider.getSigner()
				const connectedContract = new ethers.Contract(
					CONTRACT_ADDRESS,
					myEpicNft.abi,
					signer
				)
				console.log('Going to pop wallet now to pay gas...')
				let nftTxn = await connectedContract.makeAnEpicNFT()

				await nftTxn.wait()

				console.log(
					`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
				)
			}
		} catch (error) {
			console.log(error)
		}
	}

	return (
		<div className="App">
			<div className="container">
				<div className="header-container">
					<p className="header gradient-text">My NFT Collection</p>
					<p className="sub-text">あなただけの特別な NFT を Mint しよう💫</p>
					{currentAccount ? (
						<button
							className="cta-button connect-wallet-button"
							onClick={() => askContractToMintNft()}
						>
							Mint NFT
						</button>
					) : (
						renderNotConnectedContainer()
					)}
				</div>
				<div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer"
					>{`built on @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	)
}

export default App
