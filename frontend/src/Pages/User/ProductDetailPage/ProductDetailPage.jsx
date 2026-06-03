import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Empty,
  Image,
  Input,
  InputNumber,
  Modal,
  Rate,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CarOutlined,
  CheckCircleFilled,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  MessageOutlined,
  SaveOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";

import { HeartFilled, HeartOutlined } from "@ant-design/icons";

import api from "../../../Apis/apiConfig";
import API_ENDPOINTS from "../../../Apis/apiEndpoints";
import { getAuthUser } from "../../../Utils/Auth";
import { notifyCartChanged } from "../../../Utils/CartEvents";

import {useOutletContext} from "react-router-dom";
const unwrapApiData = (response) => {
  if (response?.data !== undefined) return response.data;
  return response;
};

const getApiErrorMessage = (error, fallback = "Có lỗi xảy ra.") => {
  const responseData = error?.response?.data;

  return (
    responseData?.message ||
    responseData?.error ||
    responseData?.detail ||
    responseData?.data?.message ||
    error?.message ||
    fallback
  );
};

const calculateAverageRating = (reviews = []) => {
  if (!Array.isArray(reviews) || reviews.length === 0) return 0;

  const total = reviews.reduce((sum, review) => {
    return sum + Number(review.rating || 0);
  }, 0);

  return total / reviews.length;
};

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const PLACEHOLDER_IMAGE =
  "https://via.placeholder.com/700x700?text=MEGAMART+PRODUCT";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value || 0));
};

const getProductImages = (product) => {
  const images = Array.isArray(product?.imageUrls) ? product.imageUrls : [];
  return images.length > 0 ? images : [PLACEHOLDER_IMAGE];
};

const getProductVariants = (product) => {
  return Array.isArray(product?.variants) ? product.variants : [];
};

const getVariantLabel = (variant) => {
  const attributes = variant?.attributes || {};
  const entries = Object.entries(attributes);

  if (entries.length === 0) {
    return variant?.sku || "Phiên bản mặc định";
  }

  return entries.map(([key, value]) => `${key}: ${value}`).join(" / ");
};

const getReviewDate = (dateValue) => {
  if (!dateValue) return "";

  try {
    return new Date(dateValue).toLocaleDateString("vi-VN");
  } catch {
    return "";
  }
};

const ProductDetailPage = () => {
  const {isDarkMode} = useOutletContext();
  const navigate = useNavigate();
  const { id: productId } = useParams();

  const authUser = getAuthUser();
  const userId = authUser?.id;

  const productEndpoint = API_ENDPOINTS.products || API_ENDPOINTS.product;
  const reviewEndpoint = API_ENDPOINTS.reviews || API_ENDPOINTS.review;

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [loadingProduct, setLoadingProduct] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [updatingReview, setUpdatingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const productImages = useMemo(() => getProductImages(product), [product]);
  const variants = useMemo(() => getProductVariants(product), [product]);

  const selectedVariant = useMemo(() => {
    if (variants.length === 0) return null;

    return (
      variants.find(
        (variant) => String(variant.id) === String(selectedVariantId)
      ) || variants[0]
    );
  }, [variants, selectedVariantId]);

  const isOutOfStock = Number(selectedVariant?.stock || 0) <= 0;

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;

    const total = reviews.reduce((sum, review) => {
      return sum + Number(review?.rating || 0);
    }, 0);

    return Number((total / reviews.length).toFixed(1));
  }, [reviews]);

  const fetchProductDetail = async () => {
    if (!productId) return;

    setLoadingProduct(true);

    try {
      const response = await api.get(productEndpoint.byId(productId));
      const productData = unwrapApiData(response);

      setProduct(productData);

      const firstVariant = productData?.variants?.[0];
      setSelectedVariantId(firstVariant?.id || null);
      setSelectedImageIndex(0);
      setQuantity(1);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết sản phẩm:", error);
      message.error("Không thể tải chi tiết sản phẩm.");
    } finally {
      setLoadingProduct(false);
    }
  };

  const fetchReviews = async () => {
    if (!productId || !reviewEndpoint?.byProduct) return;

    setLoadingReviews(true);

    try {
      const response = await api.get(reviewEndpoint.byProduct(productId));
      const reviewData = unwrapApiData(response);

      setReviews(Array.isArray(reviewData) ? reviewData : []);
    } catch (error) {
      console.error("Lỗi khi tải đánh giá sản phẩm:", error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchWishlistStatus = async () => {
    if (!userId || !productId) return;

    try {
      const response = await api.get(API_ENDPOINTS.wishlists.my());
      const wishlistItems = response?.data || response || [];

      const existed = wishlistItems.some((item) => {
        return String(item.productId) === String(productId);
      });

      setIsWishlisted(existed);
    } catch (error) {
      console.error("Lỗi kiểm tra wishlist:", error);
    }
  };

  useEffect(() => {
    fetchProductDetail();
    fetchReviews();
    fetchWishlistStatus();
  }, [productId]);

  const handleSelectVariant = (variantId) => {
    setSelectedVariantId(variantId);
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    if (!userId) {
      message.warning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      return;
    }

    if (!selectedVariant?.id) {
      message.warning("Sản phẩm chưa có phiên bản để thêm vào giỏ hàng.");
      return;
    }

    if (isOutOfStock) {
      message.warning("Phiên bản sản phẩm này hiện đã hết hàng.");
      return;
    }

    setAddingCart(true);

    try {
      const response = await api.post(API_ENDPOINTS.cart.items(userId), {
        productVariantId: selectedVariant.id,
        quantity,
      });
      notifyCartChanged(response);

      message.success("Đã thêm sản phẩm vào giỏ hàng.");
    } catch (error) {
      console.error("Lỗi thêm sản phẩm vào giỏ hàng:", error);
      message.error("Không thể thêm sản phẩm vào giỏ hàng.");
    } finally {
      setAddingCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();

    if (userId && selectedVariant?.id && !isOutOfStock) {
      navigate("/cart");
    }
  };

  const getReviewOwnerId = (review) => {
    return review?.userId || review?.user?.id || review?.user?.userId || null;
  };

  const canManageReview = (review) => {
    const reviewOwnerId = getReviewOwnerId(review);

    if (!userId || !reviewOwnerId) return false;

    return String(reviewOwnerId) === String(userId);
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!userId) {
      message.warning("Vui lòng đăng nhập để đánh giá sản phẩm.");
      return;
    }

    if (!product?.id) {
      message.warning("Không xác định được sản phẩm cần đánh giá.");
      return;
    }

    if (!newComment.trim()) {
      message.warning("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    if (newComment.trim().length > 2000) {
      message.warning("Nội dung đánh giá không được vượt quá 2000 ký tự.");
      return;
    }

    if (!reviewEndpoint?.create) {
      message.error("Chưa cấu hình endpoint đánh giá.");
      return;
    }

    setSubmittingReview(true);

    try {
      const payload = {
        userId,
        productId: product.id,
        rating: Number(newRating),
        comment: newComment.trim(),
      };

      const response = await api.post(reviewEndpoint.create, payload);
      const createdReview = unwrapApiData(response);

      setReviews((prevReviews) => [createdReview, ...prevReviews]);
      setNewComment("");
      setNewRating(5);

      message.success("Đã gửi đánh giá sản phẩm.");
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);

      const backendMessage = getApiErrorMessage(
        error,
        "Không thể gửi đánh giá. Vui lòng thử lại."
      );

      message.error(backendMessage);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleStartEditReview = (review) => {
    setEditingReviewId(review.id);
    setEditRating(Number(review.rating || 5));
    setEditComment(review.comment || "");
  };

  const handleCancelEditReview = () => {
    setEditingReviewId(null);
    setEditRating(5);
    setEditComment("");
  };

  const handleUpdateReview = async (review) => {
    if (!userId) {
      message.warning("Vui lòng đăng nhập để sửa đánh giá.");
      return;
    }

    if (!review?.id) {
      message.warning("Không xác định được đánh giá cần sửa.");
      return;
    }

    if (!editComment.trim()) {
      message.warning("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    if (editComment.trim().length > 2000) {
      message.warning("Nội dung đánh giá không được vượt quá 2000 ký tự.");
      return;
    }

    if (!reviewEndpoint?.update) {
      message.error("Chưa cấu hình endpoint cập nhật đánh giá.");
      return;
    }

    setUpdatingReview(true);

    try {
      const payload = {
        userId,
        productId: product.id,
        rating: Number(editRating),
        comment: editComment.trim(),
      };

      const response = await api.put(reviewEndpoint.update(review.id), payload);
      const updatedReview = unwrapApiData(response);

      setReviews((prevReviews) =>
        prevReviews.map((item) => {
          if (String(item.id) !== String(review.id)) {
            return item;
          }

          return updatedReview?.id
            ? updatedReview
            : {
                ...item,
                rating: Number(editRating),
                comment: editComment.trim(),
              };
        })
      );

      handleCancelEditReview();
      message.success("Đã cập nhật đánh giá.");
    } catch (error) {
      console.error("Lỗi khi cập nhật đánh giá:", error);

      const backendMessage = getApiErrorMessage(
        error,
        "Không thể cập nhật đánh giá."
      );

      message.error(backendMessage);
    } finally {
      setUpdatingReview(false);
    }
  };

  const handleDeleteReview = (review) => {
    if (!userId) {
      message.warning("Vui lòng đăng nhập để xóa đánh giá.");
      return;
    }

    if (!review?.id) {
      message.warning("Không xác định được đánh giá cần xóa.");
      return;
    }

    if (!reviewEndpoint?.delete) {
      message.error("Chưa cấu hình endpoint xóa đánh giá.");
      return;
    }

    Modal.confirm({
      title: "Xóa đánh giá",
      content: "Bạn có chắc chắn muốn xóa đánh giá này không?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: {
        danger: true,
      },
      onOk: async () => {
        setDeletingReviewId(review.id);

        try {
          await api.delete(reviewEndpoint.delete(review.id));

          setReviews((prevReviews) =>
            prevReviews.filter((item) => String(item.id) !== String(review.id))
          );

          message.success("Đã xóa đánh giá.");
        } catch (error) {
          console.error("Lỗi khi xóa đánh giá:", error);

          const backendMessage = getApiErrorMessage(
            error,
            "Không thể xóa đánh giá."
          );

          message.error(backendMessage);
        } finally {
          setDeletingReviewId(null);
        }
      },
    });
  };

  const handleToggleWishlist = async () => {
    if (!userId) {
      message.warning("Vui lòng đăng nhập để sử dụng yêu thích.");
      return;
    }

    if (!product?.id) {
      message.warning("Không xác định được sản phẩm.");
      return;
    }

    setWishlistLoading(true);

    try {
      if (isWishlisted) {
        await api.delete(
          API_ENDPOINTS.wishlists.deleteByUserProduct(product.id)
        );

        setIsWishlisted(false);
        message.success("Đã xóa khỏi danh sách yêu thích.");
      } else {
        await api.post(API_ENDPOINTS.wishlists.create, {
          userId,
          productId: product.id,
        });

        setIsWishlisted(true);
        message.success("Đã thêm vào danh sách yêu thích.");
      }
    } catch (error) {
      console.error("Lỗi cập nhật wishlist:", error);
      message.error("Không thể cập nhật danh sách yêu thích.");
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-orange-50">
        <Spin size="large" tip="Đang tải chi tiết sản phẩm..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-orange-50 px-4 py-10">
        <div className="mx-auto max-w-6xl rounded-3xl bg-white py-20 shadow-sm">
          <Empty description="Không tìm thấy sản phẩm." />

          <div className="mt-6 text-center">
            <Button onClick={() => navigate("/supermarket")}>
              Quay lại siêu thị
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={` min-h-[calc(100vh-80px)]  px-4 pb-8 pt-24 md:px-8 md:pt-28 ${isDarkMode ? "bg-transparent" : "bg-gradient-to-br from-orange-50 via-white to-amber-50"}`}>
      <div className="mx-auto max-w-7xl">
        <div className={`mb-5 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
          MegaMart / {product.categoryName || "Sản phẩm"} /{" "}
          <span className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
            {product.name}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.1fr]">
          <Card className="rounded-3xl border-0 shadow-sm">
            <div className="overflow-hidden rounded-2xl bg-orange-50">
              <Image
                src={productImages[selectedImageIndex] || PLACEHOLDER_IMAGE}
                alt={product.name}
                fallback={PLACEHOLDER_IMAGE}
                preview={false}
                className="!h-[420px] !w-full !object-cover"
              />
            </div>

            <div className="mt-4 grid grid-cols-5 gap-3">
              {productImages.map((imageUrl, index) => (
                <button
                  key={`${imageUrl}-${index}`}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  className={`overflow-hidden rounded-xl border-2 bg-orange-50 transition ${
                    selectedImageIndex === index
                      ? "border-orange-500"
                      : "border-transparent hover:border-orange-300"
                  }`}
                >
                  <img
                    src={imageUrl}
                    alt={`${product.name} ${index + 1}`}
                    className="h-20 w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </Card>

          <Card className="rounded-3xl border-0 shadow-sm">
            <div className="mb-4 flex flex-wrap gap-2">
              <Tag color="orange">{product.categoryName || "Chưa phân loại"}</Tag>

              <Tag color={product.status === "ACTIVE" ? "green" : "red"}>
                {product.status || "UNKNOWN"}
              </Tag>
            </div>

            <Button
              size="large"
              loading={wishlistLoading}
              icon={isWishlisted ? <HeartFilled /> : <HeartOutlined />}
              onClick={handleToggleWishlist}
              className={`!h-12 !rounded-xl ${
                isWishlisted ? "!text-red-500 !border-red-300" : ""
              }`}
            >
              {isWishlisted ? "Đã yêu thích" : "Yêu thích"}
            </Button>

            <Title level={2} className="!mb-3">
              {product.name}
            </Title>

            <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Rate disabled allowHalf value={averageRating || 0} />
                <Text strong>{averageRating || "Chưa có đánh giá"}</Text>
              </div>

              <Text type="secondary">{reviews.length} đánh giá</Text>

              <Text type="secondary">
                Người bán: {product.sellerName || "MEGAMART"}
              </Text>
            </div>

            <div className="mb-6 rounded-2xl bg-orange-50 px-5 py-4">
              <Text className="text-3xl font-bold !text-orange-600">
                {formatCurrency(selectedVariant?.price)}
              </Text>

              <div className="mt-2 text-sm text-gray-500">
                SKU: {selectedVariant?.sku || "Chưa có SKU"}
              </div>
            </div>

            <div className="mb-6">
              <Text strong>Phiên bản sản phẩm</Text>

              {variants.length === 0 ? (
                <div className="mt-3 rounded-xl bg-gray-50 p-4 text-gray-500">
                  Sản phẩm chưa có phiên bản.
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {variants.map((variant) => {
                    const selected =
                      String(variant.id) === String(selectedVariant?.id);
                    const variantOutOfStock = Number(variant.stock || 0) <= 0;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => handleSelectVariant(variant.id)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 bg-white hover:border-orange-300"
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <Text strong>{getVariantLabel(variant)}</Text>

                          {selected && (
                            <CheckCircleFilled className="text-orange-500" />
                          )}
                        </div>

                        <div className="text-sm text-gray-500">
                          {formatCurrency(variant.price)}
                        </div>

                        <div
                          className={`mt-1 text-sm ${
                            variantOutOfStock
                              ? "text-red-500"
                              : "text-green-600"
                          }`}
                        >
                          {variantOutOfStock
                            ? "Hết hàng"
                            : `Còn ${variant.stock} sản phẩm`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mb-6">
              <Text strong>Số lượng</Text>

              <div className="mt-3 flex items-center gap-4">
                <InputNumber
                  min={1}
                  max={Math.max(Number(selectedVariant?.stock || 1), 1)}
                  value={quantity}
                  onChange={(value) => setQuantity(value || 1)}
                  disabled={isOutOfStock || !selectedVariant}
                />

                <Text type="secondary">
                  {isOutOfStock
                    ? "Phiên bản này đã hết hàng"
                    : `Còn ${selectedVariant?.stock || 0} sản phẩm`}
                </Text>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                disabled={isOutOfStock || !selectedVariant}
                loading={addingCart}
                onClick={handleAddToCart}
                className="!h-12 !rounded-xl !bg-orange-500 hover:!bg-orange-600"
              >
                Thêm vào giỏ
              </Button>

              <Button
                size="large"
                disabled={isOutOfStock || !selectedVariant}
                onClick={handleBuyNow}
                className="!h-12 !rounded-xl"
              >
                Mua ngay
              </Button>

            </div>

            <div className="grid grid-cols-1 gap-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <CarOutlined className="text-orange-500" />
                Giao hàng theo địa chỉ
              </div>

              <div className="flex items-center gap-2">
                <CheckCircleFilled className="text-green-500" />
                Kiểm tra tồn kho theo phiên bản
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-3xl border-0 shadow-sm">
            <Title level={3}>Mô tả sản phẩm</Title>

            <Paragraph className="whitespace-pre-line text-base leading-7 text-gray-600">
              {product.description || "Sản phẩm chưa có mô tả chi tiết."}
            </Paragraph>

            <div className="mt-6">
              <Title level={4}>Thông tin cơ bản</Title>

              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-4">
                  <Text type="secondary">Danh mục</Text>
                  <div className="mt-1 font-medium">
                    {product.categoryName || "Chưa phân loại"}
                  </div>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <Text type="secondary">Người bán</Text>
                  <div className="mt-1 font-medium">
                    {product.sellerName || "MEGAMART"}
                  </div>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <Text type="secondary">Số phiên bản</Text>
                  <div className="mt-1 font-medium">{variants.length}</div>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <Text type="secondary">Trạng thái</Text>
                  <div className="mt-1 font-medium">
                    {product.status || "UNKNOWN"}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl border-0 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <MessageOutlined className="text-orange-500" />
              <Title level={3} className="!mb-0">
                Đánh giá
              </Title>
            </div>

            <form onSubmit={handleSubmitReview} className="mb-6">
              <div className="mb-3">
                <Text strong>Chất lượng sản phẩm</Text>

                <div className="mt-2">
                  <Rate value={newRating} onChange={setNewRating} />
                </div>
              </div>

              <TextArea
                rows={4}
                value={newComment}
                onChange={(event) => setNewComment(event.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                maxLength={2000}
                showCount
              />

              <Button
                htmlType="submit"
                type="primary"
                loading={submittingReview}
                className="mt-3 !rounded-xl !bg-orange-500 hover:!bg-orange-600"
              >
                Gửi đánh giá
              </Button>
            </form>

            {loadingReviews ? (
              <div className="py-8 text-center">
                <Spin />
              </div>
            ) : reviews.length === 0 ? (
              <Empty description="Chưa có đánh giá nào." />
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => {
                  const isEditing = String(editingReviewId) === String(review.id);
                  const isOwner = canManageReview(review);

                  return (
                    <div
                      key={review.id}
                      className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                    >
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div>
                          <Text strong>{review.userName || "Người dùng"}</Text>

                          <div className="mt-1">
                            <Text type="secondary" className="text-xs">
                              {getReviewDate(review.createdAt)}
                            </Text>

                            {review.updatedAt && (
                              <Text type="secondary" className="ml-2 text-xs">
                                Đã chỉnh sửa
                              </Text>
                            )}
                          </div>
                        </div>

                        {isOwner && !isEditing && (
                          <div className="flex gap-2">
                            <Button
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => handleStartEditReview(review)}
                              className="!rounded-lg"
                            >
                              Sửa
                            </Button>

                            <Button
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              loading={String(deletingReviewId) === String(review.id)}
                              onClick={() => handleDeleteReview(review)}
                              className="!rounded-lg"
                            >
                              Xóa
                            </Button>
                          </div>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="mt-3 rounded-2xl bg-white p-4">
                          <div className="mb-3">
                            <Text strong>Chỉnh sửa đánh giá</Text>

                            <div className="mt-2">
                              <Rate value={editRating} onChange={setEditRating} />
                            </div>
                          </div>

                          <TextArea
                            rows={4}
                            value={editComment}
                            onChange={(event) => setEditComment(event.target.value)}
                            maxLength={2000}
                            showCount
                            placeholder="Cập nhật nội dung đánh giá..."
                          />

                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                              type="primary"
                              icon={<SaveOutlined />}
                              loading={updatingReview}
                              onClick={() => handleUpdateReview(review)}
                              className="!rounded-xl !bg-orange-500 hover:!bg-orange-600"
                            >
                              Lưu thay đổi
                            </Button>

                            <Button
                              icon={<CloseOutlined />}
                              onClick={handleCancelEditReview}
                              className="!rounded-xl"
                            >
                              Hủy
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Rate disabled value={Number(review.rating || 0)} />

                          <Paragraph className="!mt-2 !mb-0 text-gray-600">
                            {review.comment || "Không có nội dung đánh giá."}
                          </Paragraph>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
