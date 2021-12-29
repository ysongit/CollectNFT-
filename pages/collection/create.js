import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Web3Storage } from 'web3.storage';
import { Row, Col, Form, Input, Button } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const client = new Web3Storage({ token: process.env.NEXT_PUBLIC_WEB3STORAGE_APIKEY });

export default function CreateCollection({ collectContract }) {
  const router = useRouter();
  const { id } = router.query;
  const [form] = Form.useForm();

	const [collectionName, setCollectionName] = useState("");
	const [creatorName, setCreatorName] = useState("");
	const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadImageList, setUploadImageList] = useState([]);

  async function createCollection() {
    try {
      setLoading(true);
      console.log(uploadImageList, collectionName, creatorName, description);

			const prepareImageList = uploadImageList.map(i => i.file);
			console.log(prepareImageList);

      const cid = await client.put([...prepareImageList], {
        onRootCidReady: localCid => {
          console.log(`> 🔑 locally calculated Content ID: ${localCid} `)
          console.log('> 📡 sending files to web3.storage ')
        },
        onStoredChunk: bytes => console.log(`> 🛰 sent ${bytes.toLocaleString()} bytes to web3.storage`)
      })
      console.log(`https://dweb.link/ipfs/${cid}`);

			const prepareImageURLs = uploadImageList.map(i => `https://dweb.link/ipfs/${cid}/${i.fileName}`);
			console.log(prepareImageURLs);

      const transaction = await collectContract.createPool(
				collectionName,
				creatorName,
				description,
				prepareImageURLs,
				prepareImageURLs.length
			);
      const tx = await transaction.wait();
      console.log(tx);
			
      setLoading(false);
      router.push(`/collection/all`);
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
      <h1>Create your collection</h1>

      <Form form={form} layout="vertical">
        <Row style={{ marginTop: '1rem' }}>
          <Col className="gutter-row" sm={{ span: 24 }} md={{ span: 16 }} lg={{ span: 12 }}>
            <Form.Item
              name="Image"
              label="Upload Images"
            >
              <Input type="file" onChange={getImage} />
            </Form.Item>

            {uploadImageList.map((image, index) => (
              <div key={index}>
                <p>{image.fileName}</p>
              </div>
            ))}

            <br />

            <Form.Item
              name="collectionName"
              label="Collection Name"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input onChange={(e) => setCollectionName(e.target.value)} />
            </Form.Item>

						<Form.Item
              name="creatorName"
              label="Creator Name"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input onChange={(e) => setCreatorName(e.target.value)} />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input.TextArea rows={5} onChange={(e) => setDescription(e.target.value)}/>
            </Form.Item>

            <Form.Item>
              <Button type="primary" loading={loading} onClick={createCollection}>
                Create
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  )
}