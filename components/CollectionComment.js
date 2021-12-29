import React, { useEffect, useState } from 'react';
import { Row, Col, Comment, Divider, Form, Avatar, Button, Input } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import firebase from 'firebase';

import fire from '../config/fire-config';

function CollectionComment({ collectionId, walletAddress, profileData }) {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if(collectionId){
      fire.firestore()
        .collection(collectionId)
        .orderBy('timestamp', 'desc')
        .onSnapshot(snap => {
          const commentData = snap.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            text: doc.data().text,
            image: doc.data().image,
            data: doc.data()
          }));
          console.log(commentData);
          setComments(commentData);
        });
    }
  }, [collectionId]);


  const sendMessage = () => {
    try {
      console.log(profileData)
      setLoading(true);

      fire.firestore()
        .collection(collectionId)
        .add({
          text: comment,
          name: profileData.name || "Guest",
          image: profileData.avatar || null,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });

      setComment('');
      setLoading(false);
    } catch (err){
      console.error(err);
      setLoading(false);
    }
  }

  const handleChange = e => {
    setComment(e.target.value);
  };

  return (
    <Row gutter={[30, 30]} style={{ marginTop: '1rem' }}>
      <Col className="gutter-row" sm={{ span: 24 }} md={{ span: 12 }}>
        <Comment
          avatar={profileData.avatar ? <Avatar src={profileData.avatar} alt="User" /> : <UserOutlined />}
          content={
            <>
              <Form.Item>
                <Input.TextArea rows={4} onChange={handleChange} value={comment} placeholder="Add comment about this collection" />
              </Form.Item>
              <Form.Item>
                <Button htmlType="submit" loading={loading} onClick={sendMessage} type="primary">
                  Add Comment
                </Button>
              </Form.Item>
            </>
          }
        />
      </Col>
      <Col className="gutter-row" sm={{ span: 24 }} md={{ span: 12 }}>
        {comments.map(comment => (
          <>
            <Comment
              avatar={comment.image ? <Avatar src={comment.image} alt="User" /> : <UserOutlined />}
              author={<a>{comment.name}</a>}
              content={<p>{comment.text}</p>}
              datetime={new Date(comment.data.timestamp?.toDate()).toUTCString()} />
            <Divider />
          </>
        ))}
      </Col>
    </Row>
  )
}

export default CollectionComment;
