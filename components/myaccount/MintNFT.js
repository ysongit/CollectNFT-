import React, { useState } from "react";
import { Row, Col, Card, Button } from 'antd';
import { useDrop } from "react-dnd";
import { Web3Storage } from 'web3.storage';
import * as htmlToImage from 'html-to-image';

import Picture from "../common/Picture";
const client = new Web3Storage({ token: process.env.NEXT_PUBLIC_WEB3STORAGE_APIKEY });

function MintNFT({ myPublicCollage, walletAddress, collectContract, chainScan }) {
  const [board, setBoard] = useState([]);
  const [transactionHash, setTransactionHash] = useState('');
  const [transactionUrl, setTransactionUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "image",
    drop: (collection) => addImageToBoard(collection),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const addImageToBoard = ({ collection }) => {
    console.log(collection, board, "pictureList")
    setBoard((board) => [...board, collection]);
  };

  const mintBoardAsNFT = async () => {
    try {
      setLoading(true);
      const node = document.getElementById('imagesBoard');
      const imageBase64 = await htmlToImage.toPng(node);
      console.log(imageBase64);

      const imageData = convertBase64ToImage(imageBase64);
      console.log(imageData);

      const form = new FormData();
      form.append('file', imageData);

      const cid = await client.put([imageData], {
        onRootCidReady: localCid => {
          console.log(`> 🔑 locally calculated Content ID: ${localCid} `)
          console.log('> 📡 sending files to web3.storage ')
        },
        onStoredChunk: bytes => console.log(`> 🛰 sent ${bytes.toLocaleString()} bytes to web3.storage`)
      })
      console.log(`https://dweb.link/ipfs/${cid}/${imageData.name}`);
      const newURL = `https://dweb.link/ipfs/${cid}/${imageData.name}`;

      const transaction = await collectContract.mintCollectionNFT(newURL);
      const tx = await transaction.wait();
      console.log(tx);

      setTransactionHash(tx.transactionHash);
      setLoading(false);
    } catch(error) {
      console.error(error);
      setLoading(false);
    }
  }

  const convertBase64ToImage = imageBase64 => {
    const filename = "mybroad.png";
    let arr = imageBase64.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), 
        n = bstr.length, 
        u8arr = new Uint8Array(n);

    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, {type:mime});
  }

  return (
    <div>
      <p>Drag and Drop to the broad</p>
      <Row gutter={[10, 10]} style={{ marginTop: '1rem' }}>
        {myPublicCollage.map(collection => (
          <Col key={collection.id.toString()} className="gutter-row" sm={{ span: 12 }} md={{ span: 8 }} lg={{ span: 4 }}>
            <Card cover={<Picture id={collection.id.toString()} collection={collection} />}>
              <Card.Meta title={`Image #${collection.id.toString()}`} />
            </Card>
          </Col>
        ))}
      </Row>
      <br />
      <p>Your board to be minted as NFT</p>
      <div id="imagesBoard" className="Board" ref={drop}>
        <Row gutter={[10, 10]} style={{ marginTop: '1rem' }}>
          {board.map((picture, index) => (
            <Col key={index} className="gutter-row" sm={{ span: 12 }} md={{ span: 8 }} lg={{ span: 4 }}> 
              <Picture id={index} collection={picture} />
            </Col>
          ))}
        </Row>
      </div>
      <center>
        <br />
        <Button type="primary" size="large" onClick={mintBoardAsNFT} loading={loading}>
          Mint as NFT
        </Button>

        {transactionUrl &&
          <p className="transactionHash">
            Success, see transaction {" "}
            <a href={transactionUrl} target="_blank" rel="noopener noreferrer">
              {transactionUrl}
            </a>
          </p>
        }
        {transactionHash &&
          <p className="transactionHash">
            Success, see transaction {" "}
            <a href={`${chainScan}${transactionHash}`} target="_blank" rel="noopener noreferrer">
              {transactionHash.substring(0, 10) + '...' + transactionHash.substring(56, 66)}
            </a>
          </p>
        }
      </center>
    </div>
  )
}

export default MintNFT;
