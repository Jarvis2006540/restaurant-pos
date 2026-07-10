import React from 'react';
import { BACKEND_URL } from '../../services/api';

const MenuItem = ({ item, onAddToCart }) => {
  const imageUrl = item.image 
    ? (item.image.startsWith('http') || item.image.startsWith('data:') ? item.image : `${BACKEND_URL}${item.image}`)
    : 'https://placehold.co/400x300/EAEAEA/888888?text=Food';

  return (
    <div className="menu-item" onClick={() => onAddToCart(item.id)}>
      <div className="menu-item-image">
        <img 
          src={imageUrl} 
          alt={item.name}
          onError={(e) => {
            e.target.src = 'https://placehold.co/400x300/EAEAEA/888888?text=' + encodeURIComponent(item.name.substring(0,6));
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
