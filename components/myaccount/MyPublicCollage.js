import React, { useEffect, useState } from "react";
import { Row, Col, Card, Spin } from 'antd';

function MyPublicCollage({ walletAddress }) {
  const [userNFTs, setUserNFTs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMyCollection = async () => {
      try{
        setLoading(true);
        const nft = await fetch(`https://deep-index.moralis.io/api/v2/${walletAddress}/nft?chain=polygon&format=decimal`, {
          method: 'GET',
          headers: {
            "X-API-Key": process.env.NEXT_PUBLIC_MORALIS_APIKEY
          }});
        
        const data = await nft.json();
        console.log(data);
        const nftDataList = data.result;

        for (let i = 0; i < nftDataList.length; i++) {
          let cid = nftDataList[i].token_uri.split("/");
          console.log(cid);

          let data = await fetch('https://ipfs.io/ipfs/' + cid[4]);
          data = await data.json();
          console.log(data);

          nftDataList[i].token_uri = data.image;
        }

        setUserNFTs(nftDataList || []);
        setLoading(false);
      } catch(error) {
        console.error(error);
        setLoading(false);
      }
    }
    
    if(walletAddress) loadMyCollection();
  }, [walletAddress])

  return (
    <Row gutter={[10, 10]} style={{ marginTop: '1rem' }}>
      {loading
        ? <Spin size="large" style={{ margin: '5rem auto'}}/>
        : userNFTs.map(nft => (
          <Col key={nft.token_id} className="gutter-row" sm={{ span: 24 }} md={{ span: 12 }} lg={{ span: 6 }}>
            <Card cover={<img src={nft.token_uri} alt="Collection NFT" />}>
            </Card>
          </Col>
        ))
      }
      {!walletAddress && <p>Connect to your ETH wallet to see collections</p>}
    </Row>
  )
}

export default MyPublicCollage;
