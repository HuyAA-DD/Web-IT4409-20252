import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import cartApi from "../api/cartApi";
import productApi from "../api/productApi";
import reviewApi from "../api/reviewApi";
import wishlistApi from "../api/wishlistApi";
import { formatCurrency } from "../utils/formatCurrency";

const mockProduct = {
  id: 1,
  name: "Sản phẩm mẫu",
  description:
    "Đây là dữ liệu mẫu dùng để test giao diện ProductDetailPage khi backend chưa chạy hoặc API chưa đúng format.",
  price: 120000,
  stock: 20,
  active: true,
  status: "ACTIVE",
  imageUrl: "https://via.placeholder.com/600x400?text=Product+Detail",
  categoryName: "Danh mục mẫu",
  sellerName: "Người bán mẫu",
};

function normalizeProductResponse(response) {
  if (!response) return null;

  if (response.id || response.name) {
    return response;
  }

  if (response.data?.id || response.data?.name) {
    return response.data;
  }

  if (response.product?.id || response.product?.name) {
    return response.product;
  }

  if (response.data?.product?.id || response.data?.product?.name) {
    return response.data.product;
  }

  return null;
}

function normalizeReviewResponse(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.reviews)) {
    return response.reviews;
  }

  if (Array.isArray(response?.data?.reviews)) {
    return response.data.reviews;
  }

  return [];
}

function normalizeSingleReview(response) {
  if (!response) return null;

  if (response.id) {
    return response;
  }

  if (response.data?.id) {
    return response.data;
  }

  if (response.review?.id) {
    return response.review;
  }

  if (response.data?.review?.id) {
    return response.data.review;
  }

  return null;
}

function getProductImage(product) {
  return (
    product.imageUrl ||
    product.thumbnail ||
    product.images?.[0]?.imageUrl ||
    product.productImages?.[0]?.imageUrl ||
    "https://via.placeholder.com/600x400?text=No+Image"
  );
}

function getProductPrice(product) {
  return (
    product.price ||
    product.minPrice ||
    product.variants?.[0]?.price ||
    product.productVariants?.[0]?.price ||
    0
  );
}

function getProductStock(product) {
  return (
    product.stock ||
    product.totalStock ||
    product.variants?.[0]?.stock ||
    product.productVariants?.[0]?.stock ||
    0
  );
}

function formatDateTime(value) {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN");
}

function renderStars(rating) {
  const safeRating = Math.max(0, Math.min(5, Number(rating || 0)));
  return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
}

function ProductDetailPage() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editReviewForm, setEditReviewForm] = useState({
    rating: 5,
    comment: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isUpdatingReview, setIsUpdatingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [reviewErrorMessage, setReviewErrorMessage] = useState("");

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return 0;
    }

    const totalRating = reviews.reduce((sum, review) => {
      return sum + Number(review.rating || 0);
    }, 0);

    return totalRating / reviews.length;
  }, [reviews]);

  useEffect(() => {
    async function fetchProductDetail() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await productApi.getProductById(id);
        const productData = normalizeProductResponse(response);

        if (productData) {
          setProduct(productData);
        } else {
          setProduct({
            ...mockProduct,
            id: Number(id),
          });

          setErrorMessage(
            "Backend trả về dữ liệu chưa đúng format. Đang hiển thị sản phẩm mẫu."
          );
        }
      } catch (error) {
        setProduct({
          ...mockProduct,
          id: Number(id),
        });

        setErrorMessage(
          "Chưa gọi được API chi tiết sản phẩm. Đang hiển thị dữ liệu mẫu."
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchProductDetail();
  }, [id]);

  useEffect(() => {
    async function fetchReviews() {
      const productId = Number(id);

      if (!productId || Number.isNaN(productId)) {
        setReviews([]);
        setIsLoadingReviews(false);
        return;
      }

      try {
        setIsLoadingReviews(true);
        setReviewErrorMessage("");

        const response = await reviewApi.getReviewsByProduct(productId);
        const reviewList = normalizeReviewResponse(response);

        setReviews(reviewList);
      } catch (error) {
        setReviewErrorMessage(
          "Không tải được đánh giá sản phẩm. Hãy kiểm tra backend review API."
        );
      } finally {
        setIsLoadingReviews(false);
      }
    }

    fetchReviews();
  }, [id]);

  const handleDecreaseQuantity = () => {
    setSelectedQuantity((current) => Math.max(1, current - 1));
  };

  const handleIncreaseQuantity = () => {
    const stock = getProductStock(product);

    setSelectedQuantity((current) => {
      if (stock > 0) {
        return Math.min(stock, current + 1);
      }

      return current + 1;
    });
  };

  const handleAddToCart = async () => {
    const productId = Number(product?.id);

    if (!productId || Number.isNaN(productId)) {
      toast.error("Không tìm thấy productId hợp lệ để thêm vào giỏ hàng");
      return;
    }

    if (selectedQuantity < 1) {
      toast.error("Số lượng phải lớn hơn hoặc bằng 1");
      return;
    }

    try {
      setIsAddingToCart(true);

      await cartApi.addToCart({
        productId,
        quantity: selectedQuantity,
      });

      toast.success("Đã thêm sản phẩm vào giỏ hàng");
    } catch (error) {
      const status = error.response?.status;

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.errors?.productId ||
        error.response?.data?.errors?.quantity ||
        "Thêm vào giỏ hàng thất bại";

      if (status === 401 || status === 403) {
        toast.error("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng");
      } else {
        toast.error(message);
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    const productId = Number(product?.id);

    if (!productId || Number.isNaN(productId)) {
      toast.error("Không tìm thấy productId hợp lệ để thêm vào yêu thích");
      return;
    }

    try {
      setIsAddingToWishlist(true);

      await wishlistApi.addToWishlist(productId);

      toast.success("Đã thêm vào danh sách yêu thích");
    } catch (error) {
      const status = error.response?.status;

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.errors?.productId ||
        "Thêm vào yêu thích thất bại";

      if (status === 401 || status === 403) {
        toast.error("Bạn cần đăng nhập để thêm sản phẩm vào yêu thích");
      } else {
        toast.error(message);
      }
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleReviewChange = (event) => {
    const { name, value } = event.target;

    setReviewForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    const productId = Number(product?.id);
    const rating = Number(reviewForm.rating);

    if (!productId || Number.isNaN(productId)) {
      toast.error("Không tìm thấy productId hợp lệ để đánh giá");
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      toast.error("Số sao đánh giá phải từ 1 đến 5");
      return;
    }

    try {
      setIsSubmittingReview(true);

      const response = await reviewApi.createReview({
        productId,
        rating,
        comment: reviewForm.comment.trim(),
      });

      const createdReview = normalizeSingleReview(response);

      if (createdReview) {
        setReviews((currentReviews) => [createdReview, ...currentReviews]);
      } else {
        const refreshedResponse = await reviewApi.getReviewsByProduct(productId);
        setReviews(normalizeReviewResponse(refreshedResponse));
      }

      setReviewForm({
        rating: 5,
        comment: "",
      });

      toast.success("Đã gửi đánh giá sản phẩm");
    } catch (error) {
      const status = error.response?.status;

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.errors?.rating ||
        error.response?.data?.errors?.productId ||
        "Gửi đánh giá thất bại";

      if (status === 401 || status === 403) {
        toast.error("Bạn cần đăng nhập để đánh giá sản phẩm");
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleStartEditReview = (review) => {
    setEditingReviewId(review.id);
    setEditReviewForm({
      rating: review.rating || 5,
      comment: review.comment || "",
    });
  };

  const handleCancelEditReview = () => {
    setEditingReviewId(null);
    setEditReviewForm({
      rating: 5,
      comment: "",
    });
  };

  const handleEditReviewChange = (event) => {
    const { name, value } = event.target;

    setEditReviewForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleUpdateReview = async (event, reviewId) => {
    event.preventDefault();

    const rating = Number(editReviewForm.rating);

    if (!rating || rating < 1 || rating > 5) {
      toast.error("Số sao đánh giá phải từ 1 đến 5");
      return;
    }

    try {
      setIsUpdatingReview(true);

      const response = await reviewApi.updateReview(reviewId, {
        rating,
        comment: editReviewForm.comment.trim(),
      });

      const updatedReview = normalizeSingleReview(response);

      setReviews((currentReviews) =>
        currentReviews.map((review) => {
          if (review.id !== reviewId) {
            return review;
          }

          if (updatedReview) {
            return updatedReview;
          }

          return {
            ...review,
            rating,
            comment: editReviewForm.comment.trim(),
          };
        })
      );

      setEditingReviewId(null);
      setEditReviewForm({
        rating: 5,
        comment: "",
      });

      toast.success("Đã cập nhật đánh giá");
    } catch (error) {
      const status = error.response?.status;

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.errors?.rating ||
        "Cập nhật đánh giá thất bại";

      if (status === 401 || status === 403) {
        toast.error("Bạn chỉ có thể sửa đánh giá của chính mình");
      } else {
        toast.error(message);
      }
    } finally {
      setIsUpdatingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa đánh giá này?");

    if (!confirmed) {
      return;
    }

    try {
      setDeletingReviewId(reviewId);

      await reviewApi.deleteReview(reviewId);

      setReviews((currentReviews) =>
        currentReviews.filter((review) => review.id !== reviewId)
      );

      toast.success("Đã xóa đánh giá");
    } catch (error) {
      const status = error.response?.status;

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Xóa đánh giá thất bại";

      if (status === 401 || status === 403) {
        toast.error("Bạn chỉ có thể xóa đánh giá của chính mình");
      } else {
        toast.error(message);
      }
    } finally {
      setDeletingReviewId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container page">
        <div className="placeholder-box">Đang tải chi tiết sản phẩm...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container page">
        <div className="placeholder-box">Không tìm thấy sản phẩm.</div>

        <Link
          to="/products"
          className="btn btn-primary"
          style={{ marginTop: 16 }}
        >
          Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  const imageUrl = getProductImage(product);
  const price = getProductPrice(product);
  const stock = getProductStock(product);

  return (
    <div className="container page">
      <Link to="/products" className="btn btn-outline">
        ← Quay lại danh sách
      </Link>

      {errorMessage && (
        <div
          className="placeholder-box"
          style={{
            marginTop: "24px",
            marginBottom: "24px",
            color: "#92400e",
            background: "#fffbeb",
            borderColor: "#fbbf24",
          }}
        >
          {errorMessage}
        </div>
      )}

      <section className="product-detail-card">
        <div>
          <img
            src={imageUrl}
            alt={product.name || "Product image"}
            className="product-detail-image"
          />
        </div>

        <div>
          <p className="product-category">
            {product.categoryName ||
              product.category?.name ||
              "Chưa có danh mục"}
          </p>

          <h1 className="product-detail-title">
            {product.name || "Không có tên sản phẩm"}
          </h1>

          <div className="review-summary-inline">
            <span className="review-stars">
              {renderStars(Math.round(averageRating))}
            </span>

            <span>
              {reviews.length > 0
                ? `${averageRating.toFixed(1)} / 5 (${reviews.length} đánh giá)`
                : "Chưa có đánh giá"}
            </span>
          </div>

          <p className="product-detail-price">{formatCurrency(price)}</p>

          <p className="product-detail-description">
            {product.description || "Sản phẩm chưa có mô tả."}
          </p>

          <div className="product-meta">
            <div>
              <strong>ID sản phẩm:</strong> {product.id}
            </div>

            <div>
              <strong>Trạng thái:</strong>{" "}
              {product.active === false
                ? "Không hoạt động"
                : product.status || "Đang hoạt động"}
            </div>

            <div>
              <strong>Tồn kho:</strong> {stock}
            </div>

            <div>
              <strong>Người bán:</strong>{" "}
              {product.sellerName ||
                product.seller?.fullName ||
                product.seller?.email ||
                "Chưa cập nhật"}
            </div>
          </div>

          <div className="quantity-section">
            <p>Số lượng</p>

            <div className="quantity-control">
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleDecreaseQuantity}
                disabled={selectedQuantity <= 1}
              >
                -
              </button>

              <span>{selectedQuantity}</span>

              <button
                type="button"
                className="btn btn-outline"
                onClick={handleIncreaseQuantity}
                disabled={stock > 0 && selectedQuantity >= stock}
              >
                +
              </button>
            </div>
          </div>

          <div className="product-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? "Đang thêm..." : "Thêm vào giỏ hàng"}
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={handleAddToWishlist}
              disabled={isAddingToWishlist}
            >
              {isAddingToWishlist ? "Đang thêm..." : "Thêm vào yêu thích"}
            </button>
          </div>
        </div>
      </section>

      <section className="review-section">
        <div className="review-header">
          <div>
            <p className="home-badge">Product Reviews</p>
            <h2>Đánh giá sản phẩm</h2>
            <p>
              Xem phản hồi từ người dùng và gửi đánh giá của bạn cho sản phẩm
              này.
            </p>
          </div>

          <div className="review-score-box">
            <strong>{averageRating.toFixed(1)}</strong>
            <span>{renderStars(Math.round(averageRating))}</span>
            <p>{reviews.length} đánh giá</p>
          </div>
        </div>

        <div className="review-layout">
          <form className="review-form" onSubmit={handleSubmitReview}>
            <h3>Viết đánh giá</h3>

            <label>
              Số sao
              <select
                name="rating"
                value={reviewForm.rating}
                onChange={handleReviewChange}
              >
                <option value="5">5 sao - Rất tốt</option>
                <option value="4">4 sao - Tốt</option>
                <option value="3">3 sao - Bình thường</option>
                <option value="2">2 sao - Chưa tốt</option>
                <option value="1">1 sao - Tệ</option>
              </select>
            </label>

            <label>
              Bình luận
              <textarea
                name="comment"
                placeholder="Nhập cảm nhận của bạn về sản phẩm..."
                value={reviewForm.comment}
                onChange={handleReviewChange}
                rows={5}
              />
            </label>

            <button
              type="submit"
              className="btn btn-primary full-width"
              disabled={isSubmittingReview}
            >
              {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </form>

          <div className="review-list">
            {isLoadingReviews && (
              <div className="placeholder-box">Đang tải đánh giá...</div>
            )}

            {!isLoadingReviews && reviewErrorMessage && (
              <div
                className="placeholder-box"
                style={{
                  color: "#92400e",
                  background: "#fffbeb",
                  borderColor: "#fbbf24",
                }}
              >
                {reviewErrorMessage}
              </div>
            )}

            {!isLoadingReviews && reviews.length === 0 && !reviewErrorMessage && (
              <div className="placeholder-box">
                Sản phẩm này chưa có đánh giá nào.
              </div>
            )}

            {!isLoadingReviews &&
              reviews.length > 0 &&
              reviews.map((review) => (
                <article key={review.id} className="review-item">
                  {editingReviewId === review.id ? (
                    <form
                      className="review-edit-form"
                      onSubmit={(event) => handleUpdateReview(event, review.id)}
                    >
                      <h3>Sửa đánh giá</h3>

                      <label>
                        Số sao
                        <select
                          name="rating"
                          value={editReviewForm.rating}
                          onChange={handleEditReviewChange}
                        >
                          <option value="5">5 sao - Rất tốt</option>
                          <option value="4">4 sao - Tốt</option>
                          <option value="3">3 sao - Bình thường</option>
                          <option value="2">2 sao - Chưa tốt</option>
                          <option value="1">1 sao - Tệ</option>
                        </select>
                      </label>

                      <label>
                        Bình luận
                        <textarea
                          name="comment"
                          value={editReviewForm.comment}
                          onChange={handleEditReviewChange}
                          rows={4}
                        />
                      </label>

                      <div className="review-actions">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isUpdatingReview}
                        >
                          {isUpdatingReview ? "Đang lưu..." : "Lưu"}
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={handleCancelEditReview}
                          disabled={isUpdatingReview}
                        >
                          Hủy
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="review-item-header">
                        <div>
                          <h3>{review.userFullName || "Người dùng"}</h3>
                          <p>{formatDateTime(review.createdAt)}</p>
                        </div>

                        <span className="review-stars">
                          {renderStars(review.rating)}
                        </span>
                      </div>

                      <p className="review-comment">
                        {review.comment || "Người dùng không để lại bình luận."}
                      </p>

                      <div className="review-actions">
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => handleStartEditReview(review)}
                        >
                          Sửa
                        </button>

                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={deletingReviewId === review.id}
                        >
                          {deletingReviewId === review.id
                            ? "Đang xóa..."
                            : "Xóa"}
                        </button>
                      </div>
                    </>
                  )}
                </article>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProductDetailPage;