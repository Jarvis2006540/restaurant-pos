import React from 'react';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) {
      onRemove();
    } else {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  return (
    <div className="cart-item">
      <div className="cart-item-info">
        <h4>{item.name}</h4>
        <p className="cart-item-price">₹{item.price.toFixed(2)} each</p>
      </div>
      <div className="cart-item-controls">
        <button onClick={() => handleQuantityChange(item.quantity - 1)}>-</button>
        <span className="cart-item-quantity">{item.quantity}</span>
        <button onClick={() => handleQuantityChange(item.quantity + 1)}>+</button>
        <button className="remove-btn" onClick={onRemove}>Remove</button>
      </div>
      <div className="cart-item-subtotal">
        ₹{item.subtotal.toFixed(2)}
      </div>
    </div>
  );
};

export default CartItem;
