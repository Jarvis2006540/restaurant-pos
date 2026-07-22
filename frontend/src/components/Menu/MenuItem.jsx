import React from 'react';
import { getPlaceholderImage } from '../../services/imageUpload';

const MenuItem = ({ item, onAddToCart }) => {
  const placeholder = getPlaceholderImage(item.name);
  const imageUrl = item.image && item.image.length > 5 ? item.image : placeholder;

  return (
    <div className="menu-item" onClick={() => onAddToCart(item.id)}>
      <div className="menu-item-image">
        <img 
          src={imageUrl} 
          alt={item.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = placeholder;
          }}
        />
        {item.category && <span className="menu-item-category">{item.category}</span>}
      </div>
      <div className="menu-item-info">
        <h3 className="menu-item-title">{item.name}</h3>
        <p className="menu-item-price">₹{item.price.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default MenuItem;
