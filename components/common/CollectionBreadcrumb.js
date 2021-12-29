import React from 'react';
import Link from 'next/link';
import { Breadcrumb, Divider } from 'antd';

function CollectionBreadcrumb({ collectionId, isAddImage }) {
  return (
    <>
      <Breadcrumb style={{ marginTop: '.6rem' }}>
        <Breadcrumb.Item>
          <Link href="/collection/all">
            Collection List
          </Link>
        </Breadcrumb.Item>
        {collectionId
          && <Breadcrumb.Item>
              <Link href={`/collection/${collectionId}`}>
                Collection Detail
              </Link>
            </Breadcrumb.Item>
        }
        {isAddImage
          && <Breadcrumb.Item>
                Add Image
            </Breadcrumb.Item>
        }
      </Breadcrumb>
      <Divider />
    </>
  )
}

export default CollectionBreadcrumb;
