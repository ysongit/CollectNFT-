import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';

function HowItWorks() {
  return (
    <div>
      <Typography.Title align="center" style={{ marginTop: '1rem' }}>
        How it Works
      </Typography.Title>
      <Card>
      <Row gutter={20} align="middle">
        <Col className="gutter-col" sm={{ span: 24 }} md={{ span: 7 }}>
          <center>
            <img
              src="https://bafybeihp7nbjque6nbj2airvuhfqzyoxpon7plszajf667zvnndp5lao3i.ipfs.dweb.link/earn.png"
              alt="Logo"
              width="80"
              height="80" />
            <Typography.Paragraph>Purchase Lootboxes</Typography.Paragraph>
            <Typography.Paragraph>Or</Typography.Paragraph>
            <img
              src="https://bafybeihp7nbjque6nbj2airvuhfqzyoxpon7plszajf667zvnndp5lao3i.ipfs.dweb.link/lootbox.png"
              alt="Logo"
              width="80"
              height="80" />
            <Typography.Paragraph>Earn a Piece</Typography.Paragraph>
          </center>
        </Col>
        
        <Col className="gutter-col" sm={{ span: 24 }} md={{ span: 9 }} style={{ display: "flex", alignItems: 'center', justifyContent: 'space-between' }}>
        <ArrowRightOutlined style={{ fontSize: "2rem", marginLeft: '-1.5rem' }} />
          <center>
            <img
              src="https://bafybeihp7nbjque6nbj2airvuhfqzyoxpon7plszajf667zvnndp5lao3i.ipfs.dweb.link/collection.png"
              alt="Logo"
              width="150"
              height="150" />
            <Typography.Paragraph className="howitworks_p">Complete a Collection</Typography.Paragraph>
          </center>
          <ArrowRightOutlined style={{ fontSize: "2rem", marginRight: '-1.5rem' }} />
        </Col>
        
        <Col className="gutter-col" sm={{ span: 24 }} md={{ span: 7 }}>
          <center>
            <img
              src="https://bafybeihp7nbjque6nbj2airvuhfqzyoxpon7plszajf667zvnndp5lao3i.ipfs.dweb.link/coin.png"
              alt="Logo"
              width="150"
              height="150" />
            <Typography.Paragraph className="howitworks_p">Claim Prize</Typography.Paragraph>
          </center>
        </Col>
    	</Row>
    </Card>
    </div>
  )
}

export default HowItWorks;
