import React from 'react';
import { Menu } from 'antd';
import { BookOutlined, AppstoreOutlined, AppstoreAddOutlined, UserOutlined } from '@ant-design/icons';

function CollectionTabs({ currentTab, setCurrentTab }) {
  const handleClick = e => {
    console.log('click ', e);
    setCurrentTab(e.key);
  };

  return (
    <Menu onClick={handleClick} selectedKeys={[currentTab]} mode="horizontal">
      <Menu.Item key="My Collections" icon={<AppstoreOutlined />}>
        My Collections
      </Menu.Item>
      <Menu.Item key="My Public Collage" icon={<BookOutlined />}>
        My Public Collage
      </Menu.Item>
      <Menu.Item key="Mint NFT" icon={<AppstoreAddOutlined />}>
        Mint NFT
      </Menu.Item>
      <Menu.Item key="My Profile" icon={<UserOutlined />}>
        My Profile
      </Menu.Item>
    </Menu>
  );
}

export default CollectionTabs;
