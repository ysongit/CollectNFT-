import React from 'react';
import { Row, Col, Card, Button, notification } from 'antd';

function MyCollection({ imageList, myPublicCollage, setMyPublicCollage }) {
  const openNotification = collection => {
    setMyPublicCollage([...myPublicCollage, collection]);
    
    notification.open({
      message: 'Added',
      description:
        `Image#${collection.id.toString()} added to your public collage`,
      onClick: () => {
        console.log('Notification Clicked!');
      },
      duration: 2,
    });
  };

  return (
    <div>
      {imageList.map((image, index) => (
        <div key={index} style={{ marginBottom: '1rem'}}>
          <h2>Collection #{image.id.toString()}</h2>

          <Row key={image.id.toString()}gutter={[10, 10]} style={{ marginTop: '1rem' }}>
            {image.imageList.map(collection => (
              <Col key={collection.id.toString()} className="gutter-row" sm={{ span: 12 }} md={{ span: 8 }} lg={{ span: 4 }}>
                <Card cover={<img src={collection.url} alt="Collection Image" />}>
                  <Card.Meta title={`Image #${collection.id.toString()}`} />
                  <br />
                  <Button type="primary" onClick={() => openNotification(collection)}>
                    Add to Mint
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </div>
  )
}

export default MyCollection;
