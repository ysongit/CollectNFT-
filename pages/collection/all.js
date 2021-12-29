import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import { Row, Col, Card, Typography, Button } from 'antd';

import CollectionBreadcrumb from '../../components/common/CollectionBreadcrumb';

export default function CollectionAll({ collectContract, coinLabel }) {
  const router = useRouter();

  const [numberOfCollection, setNumberOfCollection] = useState(0);
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    if(collectContract) getCollectionData();
  }, [collectContract])

  async function getCollectionData(){
    const temp = [];
    const num = await collectContract.poolCount();
    setNumberOfCollection(num);

    for(let i = 1; i <= num; i++) {
      const data = await collectContract.pools(i);
      temp.push(data);
    }

    setCollections(temp);
  }
  
  return (
    <div>
      <CollectionBreadcrumb />
      <div style={{ display: "flex", justifyContent: 'space-between', alignItems: 'center'}}>
        <Typography.Title>
          Collections
        </Typography.Title>
        <Button type="primary" size="large" onClick={() => router.push(`/collection/create`)}>
          Create your Collection
        </Button>
      </div>
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
        {!collections.length && <p>Connect to your ETH wallet to see collections</p>}
      </Row>
    </div>
  )
}
