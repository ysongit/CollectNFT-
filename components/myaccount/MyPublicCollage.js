import React, { useEffect, useState } from "react";
import { Row, Col, Card, Spin } from 'antd';

function MyPublicCollage({ walletAddress, collectContract }) {
  const [userNFTs, setUserNFTs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if(collectContract) loadNFTs();
  }, [walletAddress, collectContract])

  const loadNFTs = async () => {
    const totalSupply = await collectContract.totalSupply();

    let temp = [];

    for(let i = 1; i <= totalSupply; i++){
      const tokenOwner = await collectContract.ownerOf(i);
      
      if(tokenOwner === walletAddress){
        let url = await collectContract.tokenURI(i);
        console.log(url);
        temp.push(url);
      }
    }

    setUserNFTs(temp);
  }
    
  return (
    <Row gutter={[10, 10]} style={{ marginTop: '1rem' }}>
      {loading
        ? <Spin size="large" style={{ margin: '5rem auto'}}/>
        : userNFTs.map((nft, index) => (
          <Col key={index} className="gutter-row" sm={{ span: 24 }} md={{ span: 12 }} lg={{ span: 6 }}>
            <Card cover={<img src={nft} alt="Collection NFT" />}>
            </Card>
          </Col>
        ))
      }
      {!walletAddress && <p>Connect to your ETH wallet to see collections</p>}
    </Row>
  )
}

export default MyPublicCollage;
