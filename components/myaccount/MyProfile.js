import React, { useState } from 'react';
import { Row, Col, Form, Input, Card, Button } from 'antd';
import { Web3Storage } from 'web3.storage';
import CeramicClient from '@ceramicnetwork/http-client';
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver';
import { EthereumAuthProvider, ThreeIdConnect } from '@3id/connect';
import { DID } from 'dids';
import { IDX } from '@ceramicstudio/idx';

const client = new Web3Storage({ token: process.env.NEXT_PUBLIC_WEB3STORAGE_APIKEY });

function MyProfile({ walletAddress, profileData, setProfileData }) {
  const [name, setName] = useState(profileData.name || '');
  const [image, setImage] = useState(profileData.avatar || '');
  const [uploadLoading, setUploadLoading] = useState(false);

  async function addImageToWeb3Storage(event) {
    try {
      setUploadLoading(true);

      const file = event.target.files[0];
      console.log(file);

      const cid = await client.put([file], {
        onRootCidReady: localCid => {
          console.log(`> 🔑 locally calculated Content ID: ${localCid} `)
          console.log('> 📡 sending files to web3.storage ')
        },
        onStoredChunk: bytes => console.log(`> 🛰 sent ${bytes.toLocaleString()} bytes to web3.storage`)
      })
      console.log(`https://dweb.link/ipfs/${cid}/${file.name}`);
      setImage(`https://dweb.link/ipfs/${cid}/${file.name}`);
      setUploadLoading(false);
    } catch(error){
      console.error(error);
      setUploadLoading(false);
    }
  }

  async function updateProfile() {
    const ceramic = new CeramicClient(process.env.NEXT_PUBLIC_CERAMIC_ENDPOINT);
    const threeIdConnect = new ThreeIdConnect();
    const provider = new EthereumAuthProvider(window.ethereum, walletAddress);

    await threeIdConnect.connect(provider);

    const did = new DID({
      provider: threeIdConnect.getDidProvider(),
      resolver: {
        ...ThreeIdResolver.getResolver(ceramic)
      }
    });

    ceramic.setDID(did);
    await ceramic.did.authenticate();

    const idx = new IDX({ ceramic });

    await idx.set('basicProfile', {
      name,
      avatar: image
    });

    console.log("Profile updated!");

    const data = await idx.get(
      'basicProfile',
      `${walletAddress}@eip155:1`
    );

    console.log('MyProfile', data);
    setProfileData(data);
  }

  console.log("My Profile", profileData);

  return (
    <Row gutter={[30, 30]} style={{ marginTop: '1rem' }}>
      <Col className="gutter-row" sm={{ span: 24 }} md={{ span: 12 }}>
        {(!image && !name )
          ? <h4>No profile, please create one...</h4>
          :  <Card
                hoverable
                style={{ width: 240 }}
                cover={<img alt="User" src={image} />}
              >
                <Card.Meta title={name} />
              </Card>
        }
      </Col>
      <Col className="gutter-row" sm={{ span: 24 }} md={{ span: 12 }}>
        <Card>
          <h2>Update Profile</h2>
          <Form.Item
            name="Image"
            label="Upload Image"
          >
            <Input type="file" onChange={addImageToWeb3Storage} />
          </Form.Item>

          <Form.Item
            name="Name"
            label="Name"
          >
            <Input onChange={(e) => setName(e.target.value)} />
          </Form.Item>

          <Button onClick={updateProfile} type="primary">
            Update
          </Button>
        </Card>
      </Col>
    </Row>
  )
}

export default MyProfile;
