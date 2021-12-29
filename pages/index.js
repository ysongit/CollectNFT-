import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import { Row, Col, Card, Button } from 'antd';

import PrizePoolCard from '../components/PrizePoolCard';
import HowItWorks from '../components/HowItWorks';

export default function Home({ collectContract, coinLabel, chainScan }) {
  const router = useRouter();

  const [numberOfCollection, setNumberOfCollection] = useState(0);
  const [poolPrize, setPoolPrize] = useState(0);
  const [amountWon, setAmountWon] = useState(0);
  const [collections, setCollections] = useState([]);
  const [transactionHash, setTransactionHash] = useState('');
  const [lootBoxLoading, setLootBoxLoading] = useState(false);

  useEffect(() => {
    if(collectContract) getCollectionData();
  }, [collectContract])

  async function getCollectionData(){
    const temp = [];
    const num = await collectContract.poolCount();
    setNumberOfCollection(num);

    const prizeAmount = await collectContract.getPrizePool();
    setPoolPrize(prizeAmount);

    const _amountWon = await collectContract.amountWon();
    setAmountWon(_amountWon);

    for(let i = 1; i <= 4; i++) {
      const data = await collectContract.pools(i);
      temp.push(data);
    }

    setCollections(temp);
  }

  async function buyLootBox(){
    try{
      setLootBoxLoading(true);

      const ethToWei = ethers.utils.parseUnits('1', 'ether');
      const transaction = await collectContract.buyLootBox({ value: ethToWei });
      const tx = await transaction.wait();
      console.log(tx);

      setTransactionHash(tx.transactionHash);
      setLootBoxLoading(false);
    } catch(error) {
      console.error(error);
      setLootBoxLoading(false);
    }
  }

  return (
    <div>
      <PrizePoolCard 
        collectionsNum={numberOfCollection}
        poolPrize={poolPrize}
        awardedWon={amountWon}
        label={coinLabel} />

      <HowItWorks />

      <center style={{ margin: '2rem 0'}}>
        <img
          src="https://bafybeihp7nbjque6nbj2airvuhfqzyoxpon7plszajf667zvnndp5lao3i.ipfs.dweb.link/lootbox.png"
          alt="Logo"
          width="100"
          height="100" />
        <br />
        <Button type="primary" size="large" onClick={buyLootBox} loading={lootBoxLoading}>
          Purchase a lootbox
        </Button>
        {transactionHash &&
          <p className="transactionHash">
            Success, see transaction {" "}
            <a href={`${chainScan}${transactionHash}`} target="_blank" rel="noopener noreferrer">
              {transactionHash.substring(0, 10) + '...' + transactionHash.substring(56, 66)}
            </a>
          </p>
        }
      </center>
      
      <Row gutter={[10, 10]} style={{ marginTop: '1rem' }}>
        {collections.map(collection => (
          <Col key={collection.id} className="gutter-row" sm={{ span: 24 }} md={{ span: 12 }} lg={{ span: 6 }}>
            <Card>
              <Card.Meta title={`${collection.collectionName}`}/>
              <Card.Meta description={`Creator: ${collection.creatorName}`} />
              <Card.Meta description={`Prize Pool: ${coinLabel} ${ethers.utils.formatUnits(collection.poolPrize.toString(), 'ether')}`} />
              <br />
              <Button type="primary" onClick={() => router.push(`/collection/${collection.id}`)}>
                View
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      <center style={{ margin: '2rem 0'}}>
        <Button type="primary" size="large" onClick={() => router.push(`/collection/all`)}>
          View All Collections
        </Button>
        <br />
        <br />
        <Button type="primary" size="large" onClick={() => router.push(`/collection/create`)}>
          Create your Collection
        </Button>
      </center>
    </div>
  )
}
