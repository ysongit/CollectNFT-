import React, { useState }  from 'react';
import Link from 'next/link';
import { Layout, Menu, Button } from 'antd';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';

import CeramicClient from '@ceramicnetwork/http-client';
import { IDX } from '@ceramicstudio/idx';

import CollectNFT from '../../artifacts/contracts/CollectNFT.sol/CollectNFT.json';
import CollectNFTV2 from '../../artifacts/contracts/CollectNFTV2.sol/CollectNFTV2.json';

function Navbar({ walletAddress, setWalletAddress, setCollectContract, setProfileData, setCoinLabel, setChainScan }) {
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    try {
      setLoading(true);

      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);  
      console.log("Navbar", provider);

      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);

      const { chainId } = await provider.getNetwork();
      console.log("Navbar", chainId);

      let contract = null;
      let _coinLabel = "";
      let _chainScan = "";
      if(chainId === 97){
        console.log("Navbar", "Binance Smart Chain");
        contract = new ethers.Contract(process.env.NEXT_PUBLIC_COLLECTNFTADDRESS_BSC, CollectNFT.abi, signer);
        _coinLabel = "BNB";
        _chainScan = "https://testnet.bscscan.com/tx/";
      }
      else if(chainId === 4){
        console.log("Navbar", "Rinkeby");
        contract = new ethers.Contract(process.env.NEXT_PUBLIC_COLLECTNFTADDRESS_RINKEY, CollectNFT.abi, signer);
        _coinLabel = "ETH";
        _chainScan = "https://rinkeby.etherscan.io/tx/";
      }
      else if(chainId === 80001){
        console.log("Navbar", "Mumbai");
        contract = new ethers.Contract(process.env.NEXT_PUBLIC_COLLECTNFTADDRESS_MUMBAI, CollectNFT.abi, signer);
        _coinLabel = "MATIC";
        _chainScan = "https://mumbai.polygonscan.com/tx/";
      }
      else if(chainId === 588){
        console.log("Navbar", "Metis");
        contract = new ethers.Contract(process.env.NEXT_PUBLIC_COLLECTNFTADDRESS_METIS, CollectNFTV2.abi, signer);
        _coinLabel = "METIS";
        _chainScan = "https://stardust-explorer.metis.io/";
      }
      else{
        alert("No contract for this network, try Rinkeby, Polygon (Matic) Mumbai, Metis, and Binance Smart Chain Testnet");
        setLoading(false);
        return;
      }

      setCollectContract(contract);
      setCoinLabel(_coinLabel);
      setChainScan(_chainScan);

      await getProfile(address);
      setLoading(false);
    }catch(error) {
      console.error("Navbar", error);
      setLoading(false);
    }
  }

  async function getProfile(address) {
    const ceramic = new CeramicClient(process.env.NEXT_PUBLIC_CERAMIC_ENDPOINT);
    const idx = new IDX({ ceramic });

    try {
      const data = await idx.get(
        'basicProfile',
        `${address}@eip155:1`
      );

      console.log('Navbar', data);
      setProfileData(data);
    } catch (error) {
      console.error('Navbar', error);
    }
  }

  return (
    <Layout.Header style={{ display: 'flex', alignItems: 'center' }}>
      <img src="https://bafybeihp7nbjque6nbj2airvuhfqzyoxpon7plszajf667zvnndp5lao3i.ipfs.dweb.link/logo.jpg" alt="logo" width="110" height="50" />
      <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']} style={{ flex: 2 }}>
        <Menu.Item key="1">
          <Link href="/">
            Home
          </Link>
        </Menu.Item>
        <Menu.Item key="2">
          <Link href="/lootbox">
            Lootbox
          </Link>
        </Menu.Item>
        <Menu.Item key="3">
          <Link href="/collection/all">
            Collections
          </Link>
        </Menu.Item>
        <Menu.Item key="4">
          <Link href="/my-account">
            My Account
          </Link>
        </Menu.Item>
      </Menu>
      <Button
        style={{ margin: '0 1rem'}}
        type="primary"
        onClick={connectWallet}
        loading={loading}
      >
        {walletAddress ? walletAddress.substring(0,8) + "..." + walletAddress.substring(34,42) : "Connect to Wallet"}
      </Button>
    </Layout.Header>
  )
}

export default Navbar;