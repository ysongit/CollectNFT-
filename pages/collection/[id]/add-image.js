import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Web3Storage } from 'web3.storage';
import { Row, Col, Form, Upload, Input, Button, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

import CollectionBreadcrumb from '../../../components/common/CollectionBreadcrumb';
const client = new Web3Storage({ token: process.env.NEXT_PUBLIC_WEB3STORAGE_APIKEY });

export default function AddImageToColllection({ collectContract }) {
  const router = useRouter();
  const { id } = router.query;
  const [form] = Form.useForm();

  const [uploadImageList, setUploadImageList] = useState([]);
  const [loading, setLoading] = useState(false);

  async function addImageToWeb3Storage() {
    try {
      setLoading(true);
      console.log(uploadImageList[0].file);

      const cid = await client.put([uploadImageList[0].file], {
        onRootCidReady: localCid => {
          console.log(`> 🔑 locally calculated Content ID: ${localCid} `)
          console.log('> 📡 sending files to web3.storage ')
        },
        onStoredChunk: bytes => console.log(`> 🛰 sent ${bytes.toLocaleString()} bytes to web3.storage`)
      })
      console.log(`https://dweb.link/ipfs/${cid}/${uploadImageList[0].fileName}`);

      const transaction = await collectContract.addImageToPool(id, `https://dweb.link/ipfs/${cid}/${uploadImageList.fileName}`);
      const tx = await transaction.wait();
      console.log(tx);

      setLoading(false);
      router.push(`/collection/${id}/`);
    } catch(error){
      console.error(error);
      setLoading(false);
    }
  }

  const getImage = event => {
    const file = event.target.files[0];
    console.log(file);

    setUploadImageList([...uploadImageList, {
      file: file,
      fileName: file.name,
      fileType: file.type
    }]);
    console.log(uploadImageList);
  }

  return (
    <div>
      <CollectionBreadcrumb collectionId={id} isAddImage={true} />

      <h1>Add Image for Collection #{id}</h1>

      <Form form={form} layout="vertical">
        <Row style={{ marginTop: '1rem' }}>
          <Col className="gutter-row" sm={{ span: 24 }} md={{ span: 16 }} lg={{ span: 12 }}>
            <Form.Item
              name="Image"
              label="Upload Image"
            >
              <Input type="file" onChange={getImage} />
            </Form.Item>

            <br />

            <Form.Item>
              <Button type="primary" loading={loading} onClick={addImageToWeb3Storage}>
                Upload
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  )
}
