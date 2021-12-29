import React, { useState } from "react";
import { Row, Col, Card, Button } from 'antd';
import { useDrop } from "react-dnd";
import * as htmlToImage from 'html-to-image';

import Picture from "../common/Picture";

function MintNFT({ myPublicCollage, walletAddress }) {
  const [board, setBoard] = useState([]);
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

      const options = {
        method: 'POST',
        body: form,
        headers: {
          "Authorization": process.env.NEXT_PUBLIC_NFTPORT_APIKEY,
        },
      };

      const response = await fetch("https://api.nftport.xyz/easy_mint?" + new URLSearchParams({
        chain: 'polygon',
        name: "My Public Collage",
        description: "It is my public collage",
        mint_to_address: walletAddress,
      }), options);

      const json = await response.json();
      console.log(json);
      setTransactionUrl(json.transaction_external_url);
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
      </center>
    </div>
  )
}

export default MintNFT;
