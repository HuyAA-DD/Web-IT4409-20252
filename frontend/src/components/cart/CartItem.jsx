import { formatCurrency } from "../../utils/formatCurrency";

function getItemName(item) {
  return (
    item.productName ||
    item.product?.name ||
    item.productVariant?.product?.name ||
    "Sản phẩm không tên"
  );
}

function getItemImage(item) {
  return (
    item.imageUrl ||
    item.product?.imageUrl ||
    item.product?.images?.[0]?.imageUrl ||
    item.product?.productImages?.[0]?.imageUrl ||
    item.productVariant?.product?.imageUrl ||
    "https://via.placeholder.com/120x120?text=No+Image"
  );
}

function getItemPrice(item) {
  return (
    item.price ||
    item.product?.price ||
    item.productVariant?.price ||
    item.variant?.price ||
    0
  );
}

function CartItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  isUpdating = false,
}) {
  const name = getItemName(item);
  const imageUrl = getItemImage(item);
  const price = getItemPrice(item);
  const quantity = item.quantity || 1;
  const total = price * quantity;

  return (
    <div className="cart-item">
      <img src={imageUrl} alt={name} className="cart-item-image" />

      <div className="cart-item-info">
        <h3>{name}</h3>

        <p className="cart-item-price">{formatCurrency(price)}</p>

        <p className="cart-item-total">
          Thành tiền: <strong>{formatCurrency(total)}</strong>
        </p>
      </div>

      <div className="cart-item-actions">
        <div className="quantity-control">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onDecrease}
            disabled={isUpdating || quantity <= 1}
          >
            -
          </button>

          <span>{quantity}</span>

          <button
            type="button"
            className="btn btn-outline"
            onClick={onIncrease}
            disabled={isUpdating}
          >
            +
          </button>
        </div>

        <button
          type="button"
          className="btn btn-danger"
          onClick={onRemove}
          disabled={isUpdating}
        >
          Xóa
        </button>
      </div>
    </div>
  );
}

export default CartItem;