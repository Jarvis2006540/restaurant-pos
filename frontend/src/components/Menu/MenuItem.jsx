import React from 'react';

const MenuItem = ({ item, onAddToCart }) => {
  const imageUrl = item.image 
    ? (item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`)
    : 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(item.name);

  return (
    <div className="menu-item" onClick={() => onAddToCart(item.id)}>
      <div className="menu-item-image">
        <img 
          src={imageUrl} 
          alt={item.name}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(item.name);
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
