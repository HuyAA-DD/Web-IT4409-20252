import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
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
  HeartFilled,
  HeartOutlined,
  CalendarOutlined,
  ShopOutlined,
  StarFilled,
  ArrowLeftOutlined,
  ContainerTwoTone
} from "@ant-design/icons";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";

import api from "../../../Apis/apiConfig";
import API_ENDPOINTS from "../../../Apis/apiEndpoints";
import { getAuthUser } from "../../../Utils/Auth";
import { notifyCartChanged } from "../../../Utils/CartEvents";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

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
  const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
  return total / reviews.length;
};

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/700x700?text=MEGAMART+PRODUCT";

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
  const { isDarkMode } = useOutletContext();
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
      variants.find((variant) => String(variant.id) === String(selectedVariantId)) || variants[0]
    );
  }, [variants, selectedVariantId]);

  const isOutOfStock = Number(selectedVariant?.stock || 0) <= 0;

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + Number(review?.rating || 0), 0);
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
      setProductLoadingState();
    }
  };

  const setProductLoadingState = () => {
    setLoadingProduct(false);
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
      const existed = wishlistItems.some((item) => String(item.productId) === String(productId));
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
      message.error(getApiErrorMessage(error, "Không thể gửi đánh giá. Vui lòng thử lại."));
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
          if (String(item.id) !== String(review.id)) return item;
          return updatedReview?.id ? updatedReview : {
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
      message.error(getApiErrorMessage(error, "Không thể cập nhật đánh giá."));
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
      okButtonProps: { danger: true },
      onOk: async () => {
        setDeletingReviewId(review.id);
        try {
          await api.delete(reviewEndpoint.delete(review.id));
          setReviews((prevReviews) => prevReviews.filter((item) => String(item.id) !== String(review.id)));
          message.success("Đã xóa đánh giá.");
        } catch (error) {
          console.error("Lỗi khi xóa đánh giá:", error);
          message.error(getApiErrorMessage(error, "Không thể xóa đánh giá."));
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
        await api.delete(API_ENDPOINTS.wishlists.deleteByUserProduct(product.id));
        setIsWishlisted(false);
        message.success("Đã xóa khỏi danh sách yêu thích.");
      } else {
        await api.post(API_ENDPOINTS.wishlists.create, { userId, productId: product.id });
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
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-transparent">
        <Spin size="large" tip="Đang tải chi tiết sản phẩm..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[calc(100vh-80px)] px-4 py-10 bg-transparent">
        <div className={`mx-auto max-w-6xl rounded-3xl py-20 text-center border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100 shadow-sm'}`}>
          <Empty description={<span className={isDarkMode ? 'text-gray-400' : ''}>Không tìm thấy sản phẩm.</span>} />
          <div className="mt-6 text-center">
            <Button type="primary" onClick={() => navigate("/supermarket")} className="!rounded-xl !bg-orange-500 border-0 font-bold px-6">
              Quay lại siêu thị
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] px-2 sm:px-4 py-8 md:px-8 w-full bg-transparent">
      <div className="mx-auto w-full max-w-[1800px]">
        
        {/* BREADCRUMB / CATEGORY TRAIL */}
        <div className={`mb-6 text-sm font-medium flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          <ShopOutlined className="text-orange-500" />
          <span>MegaMart</span> / <span>{product.categoryName || "Sản phẩm"}</span> / <span className={`font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>{product.name}</span>
        </div>

        {/* TOP LAYOUT GRID: IMAGE GALLERY + SELECTION CONTROL */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.1fr]">
          
          {/* LEFT AREA: IMAGE PRESENTATION */}
          <div className={`rounded-3xl p-5 border flex flex-col justify-between ${
            isDarkMode ? 'bg-slate-900 border-slate-800 shadow-black/30 shadow-xl' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/40'
          }`}>
            <div className="overflow-hidden rounded-2xl relative bg-gray-50 dark:bg-slate-950 flex items-center justify-center group aspect-square">
              <Image
                src={productImages[selectedImageIndex] || PLACEHOLDER_IMAGE}
                alt={product.name}
                fallback={PLACEHOLDER_IMAGE}
                preview={false}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4">
                <span className={`backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm border ${
                  isDarkMode ? 'bg-black/50 border-gray-600 text-gray-200' : 'bg-white/85 border-white/50 text-gray-800'
                }`}>
                  <span className={`w-2 h-2 rounded-full animate-pulse ${isOutOfStock ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                  {isOutOfStock ? "Hết hàng" : "Còn hàng"}
                </span>
              </div>
            </div>

            {/* THUMBNAILS LIST */}
            <div className="mt-5 grid grid-cols-5 gap-3">
              {productImages.map((imageUrl, index) => (
                <button
                  key={`${imageUrl}-${index}`}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  className={`overflow-hidden rounded-xl border-2 bg-gray-50 dark:bg-slate-950 aspect-square transition duration-300 ${
                    selectedImageIndex === index
                      ? "border-orange-500 shadow-md shadow-orange-500/20"
                      : isDarkMode ? "border-slate-800 hover:border-slate-600" : "border-transparent hover:border-orange-300"
                  }`}
                >
                  <img src={imageUrl} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT AREA: SPECIFICATIONS & CONTROLS */}
          <div className={`rounded-3xl p-6 lg:p-8 border flex flex-col relative overflow-hidden ${
            isDarkMode ? 'bg-slate-900 border-slate-700 shadow-black/30 shadow-xl' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/40'
          }`}>
            
            {/* BADGES HEADER LINE */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider ${isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                  {product.categoryName || "Chưu phân loại"}
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider ${
                  product.status === "ACTIVE" ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {product.status || "UNKNOWN"}
                </span>
              </div>

              {/* WISHLIST TRIGGER BUTTON */}
              <button 
                onClick={handleToggleWishlist}
                disabled={wishlistLoading}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold border rounded-xl transition-all duration-300 ${
                  isWishlisted 
                    ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20' 
                    : isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-gray-300 hover:border-red-500 hover:text-red-400' 
                      : 'bg-white border-gray-200 text-gray-600 hover:border-red-500 hover:text-red-500 shadow-sm'
                }`}
              >
                {isWishlisted ? <HeartFilled className="animate-bounce" /> : <HeartOutlined />}
                {isWishlisted ? "Đã yêu thích" : "Yêu thích"}
              </button>
            </div>

            {/* PRODUCT NAME TEXT */}
            <h2 className={`font-black text-2xl md:text-3xl leading-tight mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>
              {product.name}
            </h2>

            {/* RATINGS AND REVIEW TRACK TRACKERS */}
            <div className={`mb-6 flex flex-wrap items-center gap-6 text-sm font-medium border-b pb-4 ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
              <div className="flex items-center gap-1">
                <StarFilled className="text-amber-500 text-lg" />
                <span className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{averageRating || "Chưa có"}</span>
                <span className="opacity-60">({reviews.length} đánh giá)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="opacity-50">Nhà cung cấp:</span>
                <span className={`font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>{product.sellerName || "MEGAMART"}</span>
              </div>
            </div>

            {/* MAIN VARIANT PRICE PRESENTATION GRID */}
            <div className={`mb-6 p-5 rounded-2xl ${isDarkMode ? 'bg-slate-950 border border-slate-800' : 'bg-orange-50/70'}`}>
              <div className="text-3xl font-black text-orange-500 tracking-tight">
                {formatCurrency(selectedVariant?.price)}
              </div>
              <div className={`mt-2 text-xs font-mono tracking-wide ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                MÃ SKU: {selectedVariant?.sku || "Chưa cấu hình"}
              </div>
            </div>

            {/* INTERACTIVE VARIANTS SELECTOR AREA */}
            <div className="mb-6">
              <span className={`block font-bold text-sm uppercase tracking-wide mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Phiên bản sản phẩm</span>
              {variants.length === 0 ? (
                <div className={`rounded-xl p-4 text-center text-sm font-medium ${isDarkMode ? 'bg-slate-950 text-gray-500' : 'bg-gray-50 text-gray-500'}`}>
                  Sản phẩm chưa có cấu hình phiên bản.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {variants.map((variant) => {
                    const selected = String(variant.id) === String(selectedVariant?.id);
                    const variantOutOfStock = Number(variant.stock || 0) <= 0;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => handleSelectVariant(variant.id)}
                        className={`rounded-xl p-4 text-left border-2 transition-all duration-300 flex flex-col justify-between h-24 ${
                          selected
                            ? "border-orange-500 bg-orange-500/5 shadow-md shadow-orange-500/10"
                            : isDarkMode 
                              ? "border-slate-800 bg-slate-950/40 hover:border-slate-600" 
                              : "border-gray-200 bg-white hover:border-orange-300"
                        }`}
                      >
                        <div className="w-full flex items-start justify-between gap-2">
                          <span className={`font-bold text-sm line-clamp-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{getVariantLabel(variant)}</span>
                          {selected && <CheckCircleFilled className="text-orange-500 flex-shrink-0 mt-0.5" />}
                        </div>
                        <div className="w-full flex items-end justify-between mt-auto">
                          <span className={`text-xs font-mono font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{formatCurrency(variant.price)}</span>
                          <span className={`text-[11px] font-bold ${variantOutOfStock ? "text-red-500" : "text-emerald-500"}`}>
                            {variantOutOfStock ? "Hết hàng" : `Kho: ${variant.stock}`}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* QUANTITY PICKER ELEMENT */}
            <div className="mb-6">
              <span className={`block font-bold text-sm uppercase tracking-wide mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Số lượng mua</span>
              <div className="flex items-center gap-4">
                <InputNumber
                  min={1}
                  max={Math.max(Number(selectedVariant?.stock || 1), 1)}
                  value={quantity}
                  onChange={(value) => setQuantity(value || 1)}
                  disabled={isOutOfStock || !selectedVariant}
                  className={`!rounded-xl !h-10 flex items-center ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : ''}`}
                />
                <span className={`text-sm font-medium ${isOutOfStock ? "text-red-500" : isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {isOutOfStock ? "Phiên bản này đã hết hàng" : `Có sẵn ${selectedVariant?.stock || 0} sản phẩm trong kho`}
                </span>
              </div>
            </div>

            {/* PRIMARY PURCHASE ACTIONS SECTION */}
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 mt-auto">
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined className="text-lg" />}
                disabled={isOutOfStock || !selectedVariant}
                loading={addingCart}
                onClick={handleAddToCart}
                className="!h-12 !rounded-xl !bg-orange-500 hover:!bg-orange-600 border-0 font-bold shadow-lg shadow-orange-500/20"
              >
                Thêm vào giỏ hàng
              </Button>
              <Button
                size="large"
                disabled={isOutOfStock || !selectedVariant}
                onClick={handleBuyNow}
                className={`!h-12 !rounded-xl !font-bold ${isDarkMode ? '!bg-slate-800 !text-white !border-slate-600 hover:!border-orange-500 hover:!text-orange-400' : 'hover:!border-orange-500 hover:!text-orange-600'}`}
              >
                Mua ngay
              </Button>
            </div>

            {/* QUALITY INFO STATS CHIPS */}
            <div className={`grid grid-cols-1 gap-3 text-xs font-semibold rounded-2xl p-4 sm:grid-cols-2 ${isDarkMode ? 'bg-slate-950 border border-slate-800 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
              <div className="flex items-center gap-2">
                <CarOutlined className="text-orange-500 text-sm" /> Giao hàng toàn quốc an toàn nhanh chóng
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleFilled className="text-emerald-500 text-sm" /> Cam kết hàng chính hãng 100% đạt chuẩn chất lượng
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM LAYOUT GRID: DESCRIPTION + COMMENTS TIMELINE */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          
          {/* DESCRIPTION CARD ACCORDION BLOCK */}
          <div className={`rounded-3xl p-6 lg:p-8 border h-fit ${
            isDarkMode ? 'bg-slate-900 border-slate-700 shadow-black/30 shadow-xl' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/40'
          }`}>
            <h2 className={`text-xl font-black mb-5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Mô tả sản phẩm</h2>
            <Paragraph className={`whitespace-pre-line text-base leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {product.description || "Sản phẩm chưa có nội dung mô tả chi tiết từ nhà cung cấp."}
            </Paragraph>

            <div className={`mt-8 pt-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
              <h4 className={`text-base font-black mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Thông tin cơ bản</h4>
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-gray-50 border-gray-100'}`}>
                  <span className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Danh mục</span>
                  <div className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{product.categoryName || "Chưa phân loại"}</div>
                </div>
                <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-gray-50 border-gray-100'}`}>
                  <span className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Đối tác phân phối</span>
                  <div className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{product.sellerName || "MEGAMART"}</div>
                </div>
                <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-gray-50 border-gray-100'}`}>
                  <span className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Số lượng phiên bản</span>
                  <div className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{variants.length} phiên bản phân phối</div>
                </div>
                <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-gray-50 border-gray-100'}`}>
                  <span className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Trạng thái hệ thống</span>
                  <div className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{product.status || "UNKNOWN"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC COMPREHENSIVE REVIEWS SECTION BLOCK */}
          <div className={`rounded-3xl p-6 lg:p-8 border h-fit flex flex-col ${
            isDarkMode ? 'bg-slate-900 border-slate-700 shadow-black/30 shadow-xl' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/40'
          }`}>
            <div className="mb-6 flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                <MessageOutlined className="text-xl" />
              </div>
              <h2 className={`text-xl font-black m-0 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Đánh giá từ khách hàng</h2>
            </div>

            {/* REVIEW COMMENT INPUT FORM */}
            <form onSubmit={handleSubmitReview} className={`mb-6 p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
              <div className="mb-4">
                <span className={`block font-bold text-xs uppercase tracking-wide mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Đánh giá chất lượng</span>
                <Rate value={newRating} onChange={setNewRating} />
              </div>
              
              <div className="mb-3">
                <TextArea
                  rows={4}
                  value={newComment}
                  onChange={(event) => setNewComment(event.target.value)}
                  placeholder="Nhập nội dung chia sẻ trải nghiệm thực tế của bạn về sản phẩm này..."
                  maxLength={2000}
                  showCount
                  className={isDarkMode ? '!bg-slate-900 !border-slate-800 !text-white placeholder:!text-gray-600' : ''}
                />
              </div>

              <Button
                htmlType="submit"
                type="primary"
                loading={submittingReview}
                className="!rounded-xl !bg-orange-500 hover:!bg-orange-600 border-0 font-bold shadow-md shadow-orange-500/20"
              >
                Gửi đánh giá
              </Button>
            </form>

            {/* RENDER COMPLETED USER REVIEWS FEED TIMELINE */}
            {loadingReviews ? (
              <div className="py-12 text-center"><Spin tip="Đang tải danh sách..." /></div>
            ) : reviews.length === 0 ? (
              <div className="py-8"><Empty description={<span className={isDarkMode ? 'text-gray-500' : ''}>Chưa có phản hồi đánh giá nào cho sản phẩm này.</span>} /></div>
            ) : (
              <div className="space-y-4 max-h-[580px] overflow-y-auto pr-2 custom-scrollbar">
                {reviews.map((review) => {
                  const isEditing = String(editingReviewId) === String(review.id);
                  const isOwner = canManageReview(review);

                  return (
                    <div key={review.id} className={`rounded-xl p-4 border transition-all ${
                      isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-gray-50 border-gray-100'
                    }`}>
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div>
                          <div className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            {review.userName || "Khách hàng hệ thống"}
                          </div>
                          <div className={`mt-1 flex items-center gap-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            <CalendarOutlined /> {getReviewDate(review.createdAt)}
                            {review.updatedAt && <span className="text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded font-bold">Đã sửa</span>}
                          </div>
                        </div>

                        {/* ROW CONTROLS IF OWNER */}
                        {isOwner && !isEditing && (
                          <div className="flex gap-2">
                            <Button
                              size="small"
                              icon={<EditOutlined className="text-xs" />}
                              onClick={() => handleStartEditReview(review)}
                              className={`!rounded-md text-xs ${isDarkMode ? '!bg-slate-800 !text-gray-300 !border-slate-700' : ''}`}
                            >
                              Sửa
                            </Button>
                            <Button
                              size="small"
                              danger
                              icon={<DeleteOutlined className="text-xs" />}
                              loading={String(deletingReviewId) === String(review.id)}
                              onClick={() => handleDeleteReview(review)}
                              className="!rounded-md text-xs"
                            >
                              Xóa
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* CONDITIONAL RENDER EDIT STATE VS PRESENTATION STATE */}
                      {isEditing ? (
                        <div className={`mt-3 p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
                          <div className="mb-3">
                            <span className="block font-bold text-xs uppercase text-gray-500 mb-1">Cập nhật số sao</span>
                            <Rate value={editRating} onChange={setEditRating} />
                          </div>
                          <TextArea
                            rows={3}
                            value={editComment}
                            onChange={(event) => setEditComment(event.target.value)}
                            maxLength={2000}
                            showCount
                            className={isDarkMode ? '!bg-slate-950 !border-slate-800 !text-white' : ''}
                          />
                          <div className="mt-3 flex gap-2">
                            <Button
                              type="primary"
                              icon={<SaveOutlined />}
                              loading={updatingReview}
                              onClick={() => handleUpdateReview(review)}
                              className="!rounded-lg text-xs !bg-orange-500 hover:!bg-orange-600 border-0 font-bold"
                            >
                              Cập nhật
                            </Button>
                            <Button size="small" icon={<CloseOutlined />} onClick={handleCancelEditReview} className="!rounded-lg text-xs">
                              Hủy
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <Rate disabled value={Number(review.rating || 0)} className="text-sm [&_.ant-rate-star-full]:text-amber-500" />
                          <p className={`mt-2 mb-0 text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {review.comment || "Đánh giá không kèm nội dung văn bản."}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetailPage;