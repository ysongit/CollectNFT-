import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import { Row, Col, Card, Form, Input, Divider, Tag, Button } from 'antd';

import CollectionBreadcrumb from '../../../components/common/CollectionBreadcrumb';
import AddFundModal from '../../../components/AddFundModal';
import CollectionComment from '../../../components/CollectionComment';

export default function CollectionDetail({ walletAddress, collectContract, profileData, coinLabel, chainScan }) {
  const router = useRouter();
  const { id } = router.query;

  const [collection, setCollection] = useState({});
  const [imageList, setImageList] = useState([]);
  const [code, setCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [redeemStatus, setRedeemStatus] = useState("");
  const [pieceWon, setPieceWon] = useState("");
  const [image, setImage] = useState("");
  const [isWinnerText, setIsWinnerText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fundTransactionHash, setFundTransactionHash] = useState("");
  const [claimTransactionHash, setClaimTransactionHash] = useState("");
  const [createCodeLoading, setCreateCodeLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState(false);

  useEffect(() => {
    async function getCollectionData(){
      const data = await collectContract.pools(id);
      console.log(data)
      setCollection(data);
  
      const poolImages = await collectContract.getPoolImages(id);
      console.log(poolImages);
  
      let temp = [];
      for(let i = 0; i < poolImages.length; i++) {
        const imageId = poolImages[i];
        const data = await collectContract.images(imageId);
        temp.push(data);
      }
  
      setImageList(temp);
    }

    if(collectContract) getCollectionData();
  }, [collectContract])

  useEffect(() => {
    if(pieceWon) getImageFromContract();
  }, [pieceWon])

  async function getImageFromContract(){
    const imageURL = await collectContract.images(pieceWon);

    console.log(imageURL);
    setImage(imageURL.url);
  }

  async function claimPrize() {
    try{
      setClaimLoading(true);
      const transaction = await collectContract.claimPrize(id);
      const tx = await transaction.wait();
      console.log(tx);

      setClaimTransactionHash(tx.transactionHash);
      setIsWinnerText("You Won!");
      setClaimLoading(false);
    } catch(error){
      console.error(error);
      setClaimLoading(false);

      if(error.data){
        setIsWinnerText(error.data.message);
      }
      else{
        setIsWinnerText("Please connnect to a wallet");
      }
      
    }
  }

  async function addFund(amount) {
    const ethToWei = ethers.utils.parseUnits(amount.toString(), 'ether');
    const transaction = await collectContract.fundACollection(id, { value: ethToWei });
    const tx = await transaction.wait();
    console.log(tx);
    setFundTransactionHash(tx.transactionHash);
  }

  async function createCode() {
    try{
      setCreateCodeLoading(true);
      const transaction = await collectContract.createCode();
      await transaction.wait();

      const code = await collectContract.callStatic.createCode();
      setCode(code.toString());
      setCreateCodeLoading(false);
    } catch(error) {
      console.error(error);
      setCreateCodeLoading(false);
    }
  }

  async function redeemCode() {
    try{
      setRedeemLoading(true);

      const transaction = await collectContract.redeemToken(codeInput, id);
      const tx = await transaction.wait();
      console.log(tx);

      setPieceWon(tx?.events[0]?.args?.imageId.toString() || '');

      const isSuccess = await collectContract.callStatic.createCode();

      if(isSuccess) setRedeemStatus("Success");
      else setRedeemStatus("Invalid");

      setRedeemLoading(false);
    } catch(error) {
      console.error(error);
      setRedeemLoading(false);
    }
  }

  return (
    <div>
      <CollectionBreadcrumb collectionId={id} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1>Collection:{collection.collectionName && collection.collectionName.toString()}</h1>
          <p>Owner {collection.creatorName && collection.creatorName.toString()} ({collection.owner && collection.owner.toString()})</p>
        </div>
        
        {collection.owner && collection.owner.toString() === walletAddress && (
          <Button type="primary" size="large"  onClick={() => router.push(`/collection/${id}/add-image`)}>
            Add Image to Collection
          </Button>
        )}
      </div>
      
      <p>{collection.description && collection.description.toString()}</p>

      <Row gutter={[10, 10]} style={{ marginTop: '1rem' }}>
        {imageList.map(image => (
          <Col key={image.id.toString()} className="gutter-row" sm={{ span: 12 }} md={{ span: 8 }} lg={{ span: 6 }}>
            <Card cover={<img src={image.url} alt="Collection Image" />}>
              <Card.Meta title={`Image #${image.id.toString()}`} />
            </Card>
          </Col>
        ))}
      </Row>

      <center style={{ margin: '2rem 0'}}>
        <h2>Prize Pool: {coinLabel} {collection.poolPrize ? ethers.utils.formatUnits(collection.poolPrize.toString(), 'ether') : 0}</h2>
        <Button type="primary" size="large" onClick={() => setIsModalVisible(true)}>
          Add Fund to the Collection
        </Button>
        <br />
        <br />
        <Button type="primary" size="large" onClick={claimPrize} loading={claimLoading}>
          Claim Prize
        </Button>
        <br />
        {claimTransactionHash &&
          <p className="transactionHash">
            Success, see transaction {" "}
            <a href={`${chainScan}${claimTransactionHash}`} target="_blank" rel="noopener noreferrer">
              {claimTransactionHash.substring(0, 10) + '...' + claimTransactionHash.substring(56, 66)}
            </a>
          </p>
        }
        <br />
        <h4>{isWinnerText}</h4>
        <br />
        <p>
          To claim prize, you must have all the images in the collection
        </p>
        <p>
          Winners receive 50% of the prize pool.
        </p>
      </center>

      {collection.owner && collection.owner.toString() === walletAddress && (
        <center>
          <Divider>Redeem Code</Divider>

          <h3>Create Redeem Code</h3>
          <Button type="primary" onClick={createCode} loading={createCodeLoading}>
            Create
          </Button>
          <br />
          <br />
          {code && (
            <>
              <Tag color="blue">Redeem Code</Tag>
              <p>{code}</p>
            </>
          )}
        </center>
      )}

      <Divider>Earn a Piece</Divider>

      <center>
        <Form.Item
          name="code"
          style={{ maxWidth: '500px'}}
        >
          <h3>Enter Code</h3>
          <Input onChange={(e) => setCodeInput(e.target.value)} />
        </Form.Item>
        <Button type="primary" size="large" onClick={redeemCode} loading={redeemLoading}>
          Submit
        </Button>

        <br />
        <br />

        {redeemStatus && <p>{redeemStatus}</p>}
        {image && <img src={image} alt="Piece" width={300}/>}
      </center>

      <Divider>Comments</Divider>

      <CollectionComment
        collectionId={id}
        walletAddress={walletAddress}
        profileData={profileData} />

      <AddFundModal
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        fundTransactionHash={fundTransactionHash}
        addFund={addFund}
        coinLabel={coinLabel}
        chainScan={chainScan} />
    </div>
  )
}
