import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { providers, Contract, utils } from "ethers";
import web3Modal from "web3modal";
import styles from '../styles/Home.module.css';
import { NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI } from "../constants";

export default function Home() {
  const [isOwner, setIsOwner] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setpresaleEnded] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [numTokensMinted, setNumTokensMinted] = useState("");
  const [loading, setloading] = useState(false);
  const web3ModalRef = useRef();

  const getNumMintedTokens = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS,NFT_CONTRACT_ABI,provider);
      const numTokenIds = await nftContract.tokenIds()
      setNumTokensMinted(numTokenIds.toString());
    } catch (error) {
      console.error(error);
    }
  };

  const presaleMint = async () => {
    setloading(true)
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);
      const txn = await nftContract.presaleMint({
        value: utils.parseEther("0.01"),
      });
      await txn.wait();
      window.alert("you successfully minted a cryptoDevs!");
    } catch (error) {
      console.error("====>",error);
    }
    setloading(false)
  };
  
  const publicMint = async () => {
    setloading(true);
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);
      const txn = await nftContract.presaleMint({
        value: utils.parseEther("0.01"),
      });
      // console.log("#####",txn);
      await txn.wait();
      window.alert("you successfully minted a cryptoDevs!");
    } catch (error) {
      console.error(error);
    }
    setloading(false);
  };
  const getOwner = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);
      const owner = await nftContract.owner();
      const userAddress = await signer.getAddress();

      if (owner === userAddress) {
        setIsOwner(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const StartPresale = async () => {
    setloading(true);
    try {
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);
      const txn = await whitelistContract.StartPresale();
      await txn.wait();
      setPresaleStarted(true);
    } catch (error) {
      console.error("%%%%%%", error);
    }
    setloading(false);
  };

  const checkIfPresaleEnded = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider);
      //  this will return a BigNnumber because presaleEnded is a UINT256;
      //  This will return a timeStamp in seconds
      const presaleEndedTime = await nftContract.presaleEnded();
      const currentTimeInSeconds = Date.now() / 1000;
      // Date.now return time in milisecond, whereas presaleEndedTime return time in seconds.
      const hasPresaleEnded = presaleEndedTime.lt(Math.floor(currentTimeInSeconds));
      setpresaleEnded(hasPresaleEnded);
    } catch (error) {
      console.error(error);
    }
  };

  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider);
      const ispresaleStarted = await nftContract.presaleStarted();
      setPresaleStarted(ispresaleStarted);

    } catch (error) {
      console.error(error);
    }

  };


  const connectWallet = async () => {
    await getProviderOrSigner();
    setWalletConnected(true);

  };


  const getProviderOrSigner = async (needSigner = false) => {

    try {
      // console.log("==>",web3ModalRef.current);
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);
      const { chainId } = await web3Provider.getNetwork();
      // console.log("<<<<",chainId)

      if (chainId != 4) {
        window.alert("Change the network to rinkeby");
        throw new Error("Change the network to rinkeby");
      }
      if (needSigner) {
        const signer = web3Provider.getSigner();
        return signer;
      }
      return web3Provider;
    } catch (error) {
      console.log("$$$$$$$$$$$$$$$$", error);
    }
  };

  useEffect(() => {
    if (!walletConnected) {

      web3ModalRef.current = new web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      getOwner();
      connectWallet();
      getNumMintedTokens();
      const presaleStarted = checkIfPresaleStarted();
      if (presaleStarted) {
        checkIfPresaleEnded();
      }
      setInterval(async() => {
        await getNumMintedTokens ();
      }, 5*1000);

      setInterval(async() => {
        const presaleStarted = await checkIfPresaleStarted();
        if (presaleStarted) {
          await checkIfPresaleEnded();
        }
      }, 5*1000);

    }
  }, [walletConnected]);

  function renderBody() {
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}> connect your Wallet</button>
      );
    }

    if (loading) {
      return <span className={styles.description}>Loading.....</span>
    }
    if (isOwner && !presaleStarted) {
      // render a button to start the presale
      return (
        <button onClick={StartPresale} className={styles.button}> Start Presale</button>
      )
    }

    if (!presaleStarted) {
      // just say that presale hasnt started yet, come back letter
      return (
        <div>
          <span className={styles.description}>Presale is not started yet. Come back later! </span>
        </div>
      )
    }
    if (presaleStarted && !presaleEnded) {
      // allow user to mint in presale
      // they need to be in whitelist for this to 
      return (
        <div>
          <span className={styles.description}>Presale has started! if your address is whitelisted, you can mint a Crypto Devs! </span>
          <button className={styles.button} onClick={presaleMint}> Presale Mint</button>
        </div>
      )
    }
    if (presaleEnded) {
      // allow user to take part in public sale
      return (
        <div>
          <span className={styles.description}>Presale has ended. You can mint a CryptoDevs in public sale, if any remain. </span>
          <button className={styles.button} onClick={publicMint}> Public Mint</button>
        </div>
      )
    }
  };

  return (
    <div>
      <Head>
        <title>Crypto dev NFT</title>
      </Head>
      <div className={styles.main} >
        <h1 className={styles.title}>Welcome to NITESH 1st  NFT WebSite</h1>
        <div className={styles.description}>CryptoDevs NFT is a Collection for developpers in web3 </div>
        <div className={styles.description}> {numTokensMinted}/20 have been minted already</div>
        {renderBody()}
      </div>
      <Image className={styles.image} src="/cryptoDevs/crypto-devs.png" alt="Picture of the NFT" width={500} height={500}
></Image>
      <footer className={styles.footer}>
        Made by Nitesh Tiwari &#9829;

      </footer>
    </div>
  )
}
