import React from 'react';
import { useDrag } from "react-dnd";

function Picture({ id, collection }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "image",
    item: {collection: collection },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <img
      id={id}
      ref={drag}
      src={collection.url}
      alt="Collection Image"
      style={{ border: isDragging ? "5px solid blue" : "0px", width: "100%" }} />
  )
}

export default Picture
