import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Empty,
  Image,
  Popconfirm,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  HeartFilled,
  ReloadOutlined,
  ShoppingCartOutlined,
  CloseOutlined,
  PlusOutlined
} from "@ant-design/icons";
import { useNavigate, useOutletContext } from "react-router-dom";

import api from "../../../Apis/apiConfig";
import API_ENDPOINTS from "../../../Apis/apiEndpoints";
import { getAuthUser } from "../../../Utils/Auth";
import { notifyCartChanged } from "../../../Utils/CartEvents";

const { Title, Text, Paragraph } = Typography;

const PLACEHOLDER_IMAGE =
  "https://via.placeholder.com/500x500?text=MEGAMART+PRODUCT";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value || 0));
};

const unwrapApiData = (response) => {
  if (Array.isArray(response)) return response;
  if (response?.data !== undefined) return response.data;
  return response;
};

const getProductImage = (product) => {
  const imageUrls = Array.isArray(product?.imageUrls) ? product.imageUrls : [];
  return imageUrls[0] || PLACEHOLDER_IMAGE;
};

const getMainVariant = (product) => {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  return (
    variants[0] || {
      id: null,
      price: 0,
      stock: 0,
      sku: "",
      attributes: {},
    }
  );
};

const getVariantLabel = (variant) => {
  const attributes = variant?.attributes || {};
  const entries = Object.entries(attributes);

  if (entries.length === 0) {
    return variant?.sku || "Phiên bản mặc định";
  }

  return entries.map(([key, value]) => `${key}: ${value}`).join(" / ");
};

const normalizeWishlistItem = (wishlistItem, productDetail = null) => {
  return {
    wishlistId: wishlistItem?.id,
    userId: wishlistItem?.userId,
    productId: wishlistItem?.productId,
    productName:
      productDetail?.name || wishlistItem?.productName || "Sản phẩm yêu thích",
    createdAt: wishlistItem?.createdAt,
    product: productDetail,
  };
};

const WishListPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useOutletContext() || {};
  const authUser = getAuthUser();
  const userId = authUser?.id;

  const wishlistEndpoint = API_ENDPOINTS.wishlists || API_ENDPOINTS.wishlist;
  const productEndpoint = API_ENDPOINTS.products || API_ENDPOINTS.product;

  const [items, setItems] = useState([]);
  const [selectedWishlistIds, setSelectedWishlistIds] = useState([]);

  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [addingCartId, setAddingCartId] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkAddingCart, setBulkAddingCart] = useState(false);

  const selectedItems = useMemo(() => {
    return items.filter((item) =>
      selectedWishlistIds.includes(String(item.wishlistId))
    );
  }, [items, selectedWishlistIds]);

  const isAllSelected =
    items.length > 0 && selectedWishlistIds.length === items.length;

  const fetchWishlistItems = async () => {
    if (!userId) {
      setItems([]);
      setSelectedWishlistIds([]);
      return;
    }

    setLoading(true);

    try {
      const wishlistResponse = await api.get(wishlistEndpoint.my());
      const wishlistData = unwrapApiData(wishlistResponse);
      const wishlistList = Array.isArray(wishlistData) ? wishlistData : [];

      const mergedItems = await Promise.all(
        wishlistList.map(async (wishlistItem) => {
          try {
            const productResponse = await api.get(
              productEndpoint.byId(wishlistItem.productId)
            );

            const productData = unwrapApiData(productResponse);
            return normalizeWishlistItem(wishlistItem, productData);
          } catch (error) {
            console.error(
              "Không tải được chi tiết sản phẩm trong wishlist:",
              wishlistItem.productId,
              error
            );

            return normalizeWishlistItem(wishlistItem, null);
          }
        })
      );

      setItems(mergedItems);
      setSelectedWishlistIds([]);
    } catch (error) {
      console.error("Lỗi khi tải wishlist:", error);
      message.error("Không thể tải danh sách yêu thích.");
      setItems([]);
      setSelectedWishlistIds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedWishlistIds(items.map((item) => String(item.wishlistId)));
    } else {
      setSelectedWishlistIds([]);
    }
  };

  const handleSelectItem = (wishlistId) => {
    const normalizedId = String(wishlistId);

    setSelectedWishlistIds((prevIds) => {
      if (prevIds.includes(normalizedId)) {
        return prevIds.filter((id) => id !== normalizedId);
      }

      return [...prevIds, normalizedId];
    });
  };

  const removeItemFromState = (productId) => {
    setItems((prevItems) =>
      prevItems.filter((item) => String(item.productId) !== String(productId))
    );

    setSelectedWishlistIds((prevIds) =>
      prevIds.filter((id) => {
        const item = items.find(
          (wishlistItem) => String(wishlistItem.wishlistId) === String(id)
        );

        return String(item?.productId) !== String(productId);
      })
    );
  };

  const handleRemoveItem = async (item) => {
    if (!userId) {
      message.warning("Vui lòng đăng nhập để sử dụng danh sách yêu thích.");
      return;
    }

    if (!item?.productId) {
      message.warning("Không xác định được sản phẩm cần xóa.");
      return;
    }

    setDeletingId(String(item.wishlistId));

    try {
      await api.delete(
        wishlistEndpoint.deleteByUserProduct(item.productId)
      );

      removeItemFromState(item.productId);
      message.success("Đã xóa sản phẩm khỏi danh sách yêu thích.");
    } catch (error) {
      console.error("Lỗi khi xóa wishlist:", error);
      message.error("Không thể xóa sản phẩm khỏi danh sách yêu thích.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRemoveSelected = async () => {
    if (!userId) {
      message.warning("Vui lòng đăng nhập để sử dụng danh sách yêu thích.");
      return;
    }

    if (selectedItems.length === 0) {
      message.warning("Vui lòng chọn sản phẩm cần xóa.");
      return;
    }

    setBulkDeleting(true);

    try {
      await Promise.all(
        selectedItems.map((item) =>
          api.delete(wishlistEndpoint.deleteByUserProduct(item.productId))
        )
      );

      const selectedProductIds = selectedItems.map((item) =>
        String(item.productId)
      );

      setItems((prevItems) =>
        prevItems.filter(
          (item) => !selectedProductIds.includes(String(item.productId))
        )
      );

      setSelectedWishlistIds([]);
      message.success("Đã xóa các sản phẩm đã chọn khỏi yêu thích.");
    } catch (error) {
      console.error("Lỗi khi xóa nhiều wishlist:", error);
      message.error("Không thể xóa một số sản phẩm đã chọn.");
      fetchWishlistItems();
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleAddToCart = async (item) => {
    if (!userId) {
      message.warning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      return;
    }

    const mainVariant = getMainVariant(item.product);

    if (!mainVariant?.id) {
      message.warning("Sản phẩm chưa có phiên bản để thêm vào giỏ hàng.");
      return;
    }

    if (Number(mainVariant.stock || 0) <= 0) {
      message.warning("Sản phẩm hiện đã hết hàng.");
      return;
    }

    setAddingCartId(String(item.wishlistId));

    try {
      const response = await api.post(API_ENDPOINTS.cart.items(userId), {
        productVariantId: mainVariant.id,
        quantity: 1,
      });
      notifyCartChanged(response);

      message.success("Đã thêm sản phẩm vào giỏ hàng.");
    } catch (error) {
      console.error("Lỗi thêm sản phẩm vào giỏ hàng:", error);
      message.error("Không thể thêm sản phẩm vào giỏ hàng.");
    } finally {
      setAddingCartId(null);
    }
  };

  const handleAddSelectedToCart = async () => {
    if (!userId) {
      message.warning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      return;
    }

    if (selectedItems.length === 0) {
      message.warning("Vui lòng chọn sản phẩm cần thêm vào giỏ.");
      return;
    }

    const validItems = selectedItems.filter((item) => {
      const mainVariant = getMainVariant(item.product);
      return mainVariant?.id && Number(mainVariant.stock || 0) > 0;
    });

    if (validItems.length === 0) {
      message.warning("Không có sản phẩm hợp lệ để thêm vào giỏ hàng.");
      return;
    }

    setBulkAddingCart(true);

    try {
      await Promise.all(
        validItems.map((item) => {
          const mainVariant = getMainVariant(item.product);

          return api.post(API_ENDPOINTS.cart.items(userId), {
            productVariantId: mainVariant.id,
            quantity: 1,
          });
        })
      );
      notifyCartChanged();

      message.success(`Đã thêm ${validItems.length} sản phẩm vào giỏ hàng.`);
    } catch (error) {
      console.error("Lỗi thêm nhiều sản phẩm vào giỏ:", error);
      message.error("Không thể thêm một số sản phẩm vào giỏ hàng.");
    } finally {
      setBulkAddingCart(false);
    }
  };

  const handleGoToProductDetail = (productId) => {
    if (!productId) return;
    navigate(`/products/${productId}`);
  };

  if (!userId) {
    return (
      <div className={`min-h-[calc(100vh-80px)] px-4 pb-10 pt-24 md:px-8 md:pt-28 ${isDarkMode ? 'bg-slate-950' : 'bg-gradient-to-br from-orange-50 via-white to-amber-50'}`}>
        <div className={`mx-auto max-w-5xl rounded-3xl px-6 py-16 text-center shadow-sm border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
          <HeartFilled className="mb-4 text-5xl text-orange-500" />
          <Title level={2} className={isDarkMode ? '!text-white' : ''}>Bạn chưa đăng nhập</Title>
          <Paragraph className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            Vui lòng đăng nhập để xem và quản lý danh sách sản phẩm yêu thích.
          </Paragraph>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/auth/login-register")}
            className="mt-4 !rounded-xl !bg-orange-500 hover:!bg-orange-600 border-0"
          >
            Đăng nhập ngay
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-[calc(100vh-80px)] px-2 sm:px-4 py-8 md:px-8 w-full bg-transparent`}>
      <div className="mx-auto w-full max-w-[1800px]">
        
        {/* COMPONENT: HERO BANNER - IMAGE VỚI GRADIENT OVERLAY */}
        <section className={`relative overflow-hidden rounded-3xl mb-8 min-h-[200px] md:min-h-[260px] flex items-center border ${
          isDarkMode ? 'border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.6)]' : 'border-gray-200 shadow-xl shadow-orange-500/10'
        }`}>
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1920&auto=format&fit=crop" 
              alt="Wishlist Background" 
              className="w-full h-full object-cover object-center"
            />
          </div>
          {/* Gradient Overlay L to R */}
          <div className={`absolute inset-0 bg-gradient-to-r ${
            isDarkMode 
              ? 'from-slate-950 via-slate-950/90 to-transparent' 
              : 'from-orange-600 via-orange-500/90 to-transparent'
          }`}></div>
          
          <div className="relative z-10 p-6 md:p-10 lg:p-12 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-xl backdrop-blur-md ${isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-white/20 text-white'}`}>
                  <HeartFilled className="text-2xl" />
                </div>
                <h1 className="m-0 text-3xl md:text-4xl font-black tracking-tight text-white">
                  Yêu thích của tôi
                </h1>
              </div>
              <p className="text-base md:text-lg text-white/90">
                Lưu lại các sản phẩm bạn quan tâm và dễ dàng thêm vào giỏ hàng khi cần.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shadow-sm">
                <span className="font-bold text-white text-sm">{items.length} sản phẩm</span>
              </div>
              <Button 
                icon={<ReloadOutlined />} 
                loading={loading}
                onClick={fetchWishlistItems} 
                className="!h-10 !px-5 !rounded-xl !font-bold border-0 shadow-lg !bg-white !text-orange-600 hover:!bg-gray-100 transition-all"
              >
                Làm mới
              </Button>
            </div>
          </div>
        </section>

        {/* COMPONENT: ACTION BAR (STICKY GLASSMORPHISM) */}
        <div className={`sticky top-20 z-40 mb-8 p-4 md:p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 backdrop-blur-xl border transition-all duration-300 ${
          isDarkMode 
            ? 'bg-slate-900/80 border-slate-700 shadow-lg shadow-black/20' 
            : 'bg-white/80 border-gray-200 shadow-md shadow-gray-200/50'
        }`}>
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isAllSelected}
              indeterminate={selectedWishlistIds.length > 0 && selectedWishlistIds.length < items.length}
              disabled={items.length === 0}
              onChange={handleSelectAll}
              className={isDarkMode ? '[&_.ant-checkbox-inner]:bg-slate-700 [&_.ant-checkbox-inner]:border-slate-500 [&_.ant-checkbox-checked_.ant-checkbox-inner]:!bg-orange-500 [&_.ant-checkbox-checked_.ant-checkbox-inner]:!border-orange-500' : ''}
            >
              <span className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Chọn tất cả ({items.length} sản phẩm)
              </span>
            </Checkbox>
          </div>
          
          <div className="flex w-full md:w-auto items-center gap-3">
            <Popconfirm
              title={<span className={isDarkMode ? 'text-white' : ''}>Xóa các sản phẩm đã chọn?</span>}
              description={<span className={isDarkMode ? 'text-gray-400' : ''}>Các sản phẩm này sẽ bị xóa khỏi danh sách yêu thích.</span>}
              okText="Xóa"
              cancelText="Hủy"
              onConfirm={handleRemoveSelected}
              disabled={selectedWishlistIds.length === 0}
              okButtonProps={{ danger: true }}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={selectedWishlistIds.length === 0}
                loading={bulkDeleting}
                className={`flex-1 md:flex-none !rounded-xl !h-10 ${isDarkMode ? 'hover:!bg-red-500/20' : ''}`}
              >
                Xóa mục chọn
              </Button>
            </Popconfirm>

            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              disabled={selectedWishlistIds.length === 0}
              loading={bulkAddingCart}
              onClick={handleAddSelectedToCart}
              className="flex-1 md:flex-none !rounded-xl !h-10 !bg-orange-500 hover:!bg-orange-600 border-0 shadow-md shadow-orange-500/20 font-bold"
            >
              Thêm mục chọn vào giỏ
            </Button>
          </div>
        </div>

        {/* LƯỚI SẢN PHẨM YÊU THÍCH */}
        {loading ? (
          <div className={`flex min-h-[360px] items-center justify-center rounded-3xl shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-white'}`}>
            <Spin size="large" tip="Đang tải danh sách yêu thích..." />
          </div>
        ) : items.length === 0 ? (
          <div className={`rounded-3xl px-6 py-20 text-center shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-white'}`}>
            <Empty
              description={<span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Danh sách yêu thích của bạn đang trống.</span>}
            />
            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/supermarket")}
              className="mt-6 !rounded-xl !bg-orange-500 hover:!bg-orange-600 border-0 font-bold px-8"
            >
              Bắt đầu mua sắm ngay
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {items.map((item) => {
              const product = item.product;
              const mainVariant = getMainVariant(product);
              const isOutOfStock = Number(mainVariant.stock || 0) <= 0;
              const isSelected = selectedWishlistIds.includes(String(item.wishlistId));

              return (
                /* WISHLIST CARD - PREMIUM STYLE */
                <div
                  key={item.wishlistId || item.productId}
                  className={`relative flex flex-col rounded-3xl border transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 hover:border-orange-500 shadow-black/30' 
                      : 'bg-white border-gray-100 hover:border-orange-300 shadow-lg shadow-gray-200/40'
                  }`}
                >
                  {/* Khung Ảnh */}
                  <div 
                    className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-slate-900 rounded-t-3xl cursor-pointer"
                    onClick={() => handleGoToProductDetail(item.productId)}
                  >
                    <img
                      src={getProductImage(product)}
                      alt={item.productName}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(event) => { event.currentTarget.src = PLACEHOLDER_IMAGE; }}
                    />
                    
                    {/* Checkbox và Status Badge */}
                    <div className="absolute top-4 left-4 flex flex-col items-start gap-2">
                      <div className={`p-1 rounded bg-black/30 backdrop-blur-md border border-white/20`} onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleSelectItem(item.wishlistId)}
                          className="[&_.ant-checkbox-inner]:border-transparent [&_.ant-checkbox-checked_.ant-checkbox-inner]:!bg-orange-500"
                        />
                      </div>
                      <span className={`backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm border ${
                        isOutOfStock 
                          ? isDarkMode ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-100 text-red-600 border-red-200'
                          : isDarkMode ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-100 text-emerald-600 border-emerald-200'
                      }`}>
                        {isOutOfStock ? "Hết hàng" : "Còn hàng"}
                      </span>
                    </div>

                    {/* Nút X (Xóa) */}
                    <Popconfirm
                      title={<span className={isDarkMode ? 'text-white' : ''}>Xóa khỏi yêu thích?</span>}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => handleRemoveItem(item)}
                      onPopupClick={(e) => e.stopPropagation()}
                    >
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-all border border-white/20"
                      >
                        <CloseOutlined className="text-xs" />
                      </button>
                    </Popconfirm>
                  </div>

                  {/* Nội dung Card */}
                  <div className="p-5 flex flex-col flex-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit mb-2 uppercase tracking-widest ${
                      isDarkMode ? 'bg-slate-700 text-orange-400' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {product?.categoryName || "Sản phẩm"}
                    </span>
                    
                    <h3 
                      className={`text-lg font-bold line-clamp-1 mb-1 cursor-pointer transition-colors group-hover:text-orange-500 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                      onClick={() => handleGoToProductDetail(item.productId)}
                    >
                      {item.productName}
                    </h3>
                    
                    <p className={`text-xs line-clamp-2 mb-4 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {product?.description || "Chưa có mô tả sản phẩm."}
                    </p>
                    
                    <div className="mt-auto">
                      <div className="flex justify-between items-end mb-4">
                        <div className={`flex flex-col text-xs font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          <span className="truncate max-w-[120px]" title={getVariantLabel(mainVariant)}>
                            Phân loại: {getVariantLabel(mainVariant)}
                          </span>
                          <span>Tồn kho: {mainVariant.stock || 0}</span>
                        </div>
                        <span className="text-xl md:text-2xl font-black text-orange-500 tracking-tight">
                          {formatCurrency(mainVariant.price)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          icon={<EyeOutlined />}
                          onClick={() => handleGoToProductDetail(item.productId)}
                          className={`!rounded-xl !h-10 ${isDarkMode ? '!bg-slate-700 !text-white !border-slate-600 hover:!border-orange-500 hover:!text-orange-400' : ''}`}
                        >
                          Chi tiết
                        </Button>
                        <Button
                          type="primary"
                          icon={<ShoppingCartOutlined />}
                          disabled={isOutOfStock || !mainVariant?.id}
                          loading={addingCartId === String(item.wishlistId)}
                          onClick={() => handleAddToCart(item)}
                          className="!rounded-xl !h-10 !bg-orange-500 hover:!bg-orange-600 border-0 shadow-md font-bold"
                        >
                          Thêm
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* THẺ RỖNG - KHÁM PHÁ THÊM */}
            <div 
              onClick={() => navigate("/supermarket")}
              className={`flex flex-col items-center justify-center p-8 group cursor-pointer rounded-3xl transition-all border-dashed border-2 min-h-[380px] ${
                isDarkMode 
                  ? 'border-slate-700 hover:border-orange-500 bg-slate-800/30 hover:bg-slate-800' 
                  : 'border-gray-300 hover:border-orange-400 bg-gray-50/50 hover:bg-orange-50/30'
              }`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                isDarkMode ? 'bg-slate-700 text-gray-400 group-hover:text-orange-500' : 'bg-white shadow-sm text-gray-400 group-hover:text-orange-500'
              }`}>
                <PlusOutlined className="text-2xl" />
              </div>
              <div className="text-center">
                <p className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Khám phá thêm</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Tiếp tục mua sắm để lấp đầy wishlist của bạn</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishListPage;