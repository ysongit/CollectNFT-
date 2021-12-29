import React, { useState } from 'react';
import { Layout, Alert } from 'antd';

import Header from '../components/layout/Header';
import Navbar from '../components/layout/Navbar'

import "antd/dist/antd.css";
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const [walletAddress, setWalletAddress] = useState('');
  const [collectContract, setCollectContract] = useState(null);
  const [profileData, setProfileData] = useState({});
  const [coinLabel, setCoinLabel] = useState("");
  const [chainScan, setChainScan] = useState("");

  return (
    <div>
      <Header />
      <Navbar
        walletAddress={walletAddress}
        setWalletAddress={setWalletAddress}
        setCollectContract={setCollectContract}
        setProfileData={setProfileData}
        setCoinLabel={setCoinLabel}
        setChainScan={setChainScan} />
      <Layout.Content style={{ padding: '10px 50px 20px 50px', minHeight: '82vh' }}>
        <Alert
          message="Contact is deployed on Metis (Stardust) Testnet"
          type="info"
          closable
          style={{ marginBottom: '.5rem'}}
        />
        <Component
          {...pageProps}
          walletAddress={walletAddress}
          collectContract={collectContract}
          profileData={profileData}
          setProfileData={setProfileData}
          coinLabel={coinLabel}
          chainScan={chainScan} />
      </Layout.Content>
    </div>
  )
}

export default MyApp;
