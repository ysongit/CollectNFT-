import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Typography } from 'antd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import CollectionTabs from '../components/CollectionTabs';
import MyCollection from '../components/myaccount/MyCollection';
import MyPublicCollage from '../components/myaccount/MyPublicCollage';
import MintNFT from '../components/myaccount/MintNFT';
import MyProfile from '../components/myaccount/MyProfile';

export default function MyAccount({ walletAddress, collectContract, profileData, setProfileData }) {
  const router = useRouter();
  const { id } = router.query;
  let content;

  const [currentTab, setCurrentTab] = useState("My Collections");
  const [imageList, setImageList] = useState([]);
  const [myPublicCollage, setMyPublicCollage] = useState([]);

  useEffect(() => {
    if(collectContract) getUserCollectionData();
  }, [collectContract])

  async function getUserCollectionData(){
    const num = await collectContract.poolCount();

    let temp = [];
    for(let p = 1; p <= num; p++) {
      let obj = {};
      let list = [];

      const userImages = await collectContract.getUserImages(p);
      console.log(userImages);
      const check = {};

      for(let i = 0; i < userImages.length; i++) {
        const imageId = userImages[i];
        const data = await collectContract.images(imageId);

        if(!check[data.id.toString()]){
          check[data.id.toString()] = true;
          list.push(data);
          console.log(check, data);
        }
      }

      obj.id = p;
      obj.imageList = list;
      temp.push(obj);
    }
    setImageList(temp);
  }

  switch (currentTab) {
    case "My Collections":
      content = <MyCollection imageList={imageList} myPublicCollage={myPublicCollage} setMyPublicCollage={setMyPublicCollage} />;
      break;
    case "My Public Collage":
      content = <MyPublicCollage walletAddress={walletAddress} />
      break;
    case "Mint NFT":
      content = (
        <DndProvider backend={HTML5Backend}>
          <MintNFT myPublicCollage={myPublicCollage} walletAddress={walletAddress} />
        </DndProvider>
      );
      break;
    case "My Profile":
      content = (
        <MyProfile walletAddress={walletAddress} profileData={profileData} setProfileData={setProfileData} />
      );
      break;
    default:
      content = 'Page not found';
  }

  return (
    <div>
      <CollectionTabs
        currentTab={currentTab}
        setCurrentTab={setCurrentTab} />

      <Typography.Title style={{ marginTop: '1rem' }}>
        {currentTab}
      </Typography.Title>
      
      {content}
    </div>
  )
}
