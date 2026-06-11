import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Divider,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Radio,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  ArrowRightOutlined,
  CreditCardOutlined,
  SyncOutlined,
  HomeOutlined,
  PhoneOutlined,
  WalletOutlined
} from "@ant-design/icons";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";

import api from "../../../Apis/apiConfig";
import API_ENDPOINTS from "../../../Apis/apiEndpoints";
import { getAuthUser } from "../../../Utils/Auth";
import { notifyCartChanged } from "../../../Utils/CartEvents";

const { Title, Text, Paragraph } = Typography;

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value || 0));
};

const unwrapApiData = (response) => {
  if (response?.data !== undefined) return response.data;
  return response;
};

const getAddressText = (address) => {
  return [
    address?.street,
    address?.ward,
    address?.district,
    address?.province,
    address?.country,
  ]
    .filter(Boolean)
    .join(", ");
};

const readCheckoutDraft = (locationState) => {
  if (locationState?.checkoutDraft) {
    return locationState.checkoutDraft;
  }
  try {
    const rawDraft = sessionStorage.getItem("checkoutDraft");
    return rawDraft ? JSON.parse(rawDraft) : null;
  } catch {
    return null;
  }
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();

  const authUser = getAuthUser();
  const { isDarkMode } = useOutletContext() || {};
  const userId = authUser?.id;

  const addressEndpoint = API_ENDPOINTS.addresses || API_ENDPOINTS.address;
  const orderEndpoint = API_ENDPOINTS.orders || API_ENDPOINTS.order;
  const cartEndpoint = API_ENDPOINTS.cart;

  const [checkoutDraft, setCheckoutDraft] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [loading, setLoading] = useState(false);
  const [creatingAddress, setCreatingAddress] = useState(false);
  const [settingDefaultAddressId, setSettingDefaultAddressId] = useState(null);
  const [deletingAddressId, setDeletingAddressId] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  // An toàn hoá các biến phụ thuộc checkoutDraft bằng Optional Chaining
  const selectedItems = useMemo(() => {
    return Array.isArray(checkoutDraft?.selectedItems)
      ? checkoutDraft.selectedItems
      : [];
  }, [checkoutDraft]);

  const subtotal = Number(checkoutDraft?.subtotal || 0);
  const discountAmount = Number(checkoutDraft?.discountAmount || 0);
  const finalAmount = Number(checkoutDraft?.finalAmount || subtotal);

  const selectedAddress = useMemo(() => {
    return addresses.find(
      (address) => String(address.id) === String(selectedAddressId)
    );
  }, [addresses, selectedAddressId]);

  const fetchAddresses = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await api.get(addressEndpoint.my);
      const data = unwrapApiData(response);
      const addressList = Array.isArray(data) ? data : [];

      setAddresses(addressList);
      const defaultAddress = addressList.find((address) => address.isDefault) || addressList[0];
      setSelectedAddressId(defaultAddress?.id || null);
    } catch (error) {
      console.error("Lỗi tải địa chỉ:", error);
      message.error("Không thể tải danh sách địa chỉ.");
      setAddresses([]);
      setSelectedAddressId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const draft = readCheckoutDraft(location.state);
    setCheckoutDraft(draft);
    if (userId) {
      fetchAddresses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleOpenAddressModal = () => {
    form.setFieldsValue({
      recipientName: authUser?.fullName || authUser?.name || "",
      recipientPhone: authUser?.phone || "",
      country: "Việt Nam",
      addressType: "HOME",
      isDefault: addresses.length === 0,
    });
    setAddressModalOpen(true);
  };

  const handleCreateAddress = async () => {
    if (!userId) {
      message.warning("Vui lòng đăng nhập để thêm địa chỉ.");
      return;
    }
    try {
      const values = await form.validateFields();
      setCreatingAddress(true);

      const payload = {
        userId,
        recipientName: values.recipientName,
        recipientPhone: values.recipientPhone,
        street: values.street,
        ward: values.ward,
        district: values.district,
        province: values.province,
        postalCode: values.postalCode || "",
        country: values.country || "Việt Nam",
        isDefault: Boolean(values.isDefault),
        addressType: values.addressType || "HOME",
      };

      const response = await api.post(addressEndpoint.create, payload);
      const createdAddress = unwrapApiData(response);

      setAddresses((prev) => [createdAddress, ...prev]);
      setSelectedAddressId(createdAddress.id);
      setAddressModalOpen(false);
      form.resetFields();
      message.success("Đã thêm địa chỉ nhận hàng.");
    } catch (error) {
      if (error?.errorFields) return;
      message.error("Không thể thêm địa chỉ nhận hàng.");
    } finally {
      setCreatingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!addressId) return;
    try {
      setDeletingAddressId(addressId);
      await api.delete(addressEndpoint.delete(addressId));

      setAddresses((prev) => {
        const nextAddresses = prev.filter((address) => String(address.id) !== String(addressId));
        if (String(selectedAddressId) === String(addressId)) {
          const nextSelectedAddress = nextAddresses.find((address) => address.isDefault) || nextAddresses[0];
          setSelectedAddressId(nextSelectedAddress?.id || null);
        }
        return nextAddresses;
      });
      message.success("Đã xóa địa chỉ nhận hàng.");
    } catch (error) {
      message.error(error?.message || "Không thể xóa địa chỉ nhận hàng.");
    } finally {
      setDeletingAddressId(null);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    if (!addressId) return;
    try {
      setSettingDefaultAddressId(addressId);
      const currentDefaultAddresses = addresses.filter(
        (address) => address.isDefault && String(address.id) !== String(addressId)
      );

      await Promise.all(
        currentDefaultAddresses.map((address) =>
          api.put(addressEndpoint.update(address.id), { isDefault: false })
        )
      );
      await api.put(addressEndpoint.update(addressId), { isDefault: true });

      setAddresses((prev) =>
        prev.map((address) => ({
          ...address,
          isDefault: String(address.id) === String(addressId),
        }))
      );
      setSelectedAddressId(addressId);
      message.success("Đã đặt làm địa chỉ mặc định.");
    } catch (error) {
      message.error(error?.message || "Không thể đặt địa chỉ mặc định.");
    } finally {
      setSettingDefaultAddressId(null);
    }
  };

  const cleanupOrderedCartItems = async () => {
    if (!userId || !cartEndpoint?.item) return;
    const selectedItemIds = Array.isArray(checkoutDraft?.selectedItemIds)
      ? checkoutDraft.selectedItemIds
      : selectedItems.map((item) => item.id).filter(Boolean);

    if (selectedItemIds.length === 0) return;
    try {
      await Promise.all(selectedItemIds.map((itemId) => api.delete(cartEndpoint.item(userId, itemId))));
      notifyCartChanged();
    } catch (error) {
      message.warning("Đơn hàng đã được tạo, nhưng một số sản phẩm có thể vẫn còn trong giỏ hàng.");
    }
  };

  const handleCreateOrder = async () => {
    if (!userId) { message.warning("Vui lòng đăng nhập để đặt hàng."); return; }
    if (!checkoutDraft || selectedItems.length === 0) { message.warning("Không có sản phẩm để đặt hàng."); return; }
    if (!selectedAddressId) { message.warning("Vui lòng chọn hoặc thêm địa chỉ nhận hàng."); return; }

    const orderItems = selectedItems
      .filter((item) => item.productVariantId)
      .map((item) => ({
        productVariantId: item.productVariantId,
        quantity: Number(item.quantity || 1),
      }));

    if (orderItems.length === 0) { message.warning("Không có sản phẩm hợp lệ để tạo đơn hàng."); return; }
    setCreatingOrder(true);

    try {
      const payload = {
        addressId: selectedAddressId,
        items: orderItems,
        paymentMethod,
        couponCode: checkoutDraft?.couponCode || null,
      };

      const response = await api.post(orderEndpoint.create, payload);
      const createdOrder = unwrapApiData(response);

      await cleanupOrderedCartItems();
      sessionStorage.removeItem("checkoutDraft");

      Modal.success({
        title: <span >Tạo đơn hàng thành công</span>,
        className: isDarkMode ? "dark-modal" : "",
        styles: { content: { backgroundColor:'#ffffff' } },
        content: (
          <div className={`space-y-2 mt-3 `}>
            <p>Đơn hàng của bạn đã được tạo thành công trên hệ thống MegaMart.</p>
            <div>Tổng thanh toán: <strong className="text-orange-500">{formatCurrency(createdOrder?.totalAmount || finalAmount)}</strong></div>
            <div>Phương thức: <strong >{createdOrder?.paymentMethod || paymentMethod}</strong></div>
            <div>Trạng thái: <strong className="text-amber-500">{createdOrder?.paymentStatus || "PENDING"}</strong></div>
          </div>
        ),
        okText: paymentMethod === "SEPAY" ? "Đi tới thanh toán" : "Xem đơn hàng",
        onOk: () => {
          if (paymentMethod === "SEPAY") {
            navigate("/seapay", { state: { order: createdOrder } });
            return;
          }
          navigate(`/orders/${createdOrder.id}`, { state: { order: createdOrder } });
        },
      });
    } catch (error) {
      const backendMessage = error?.response?.data?.message || error?.message || "Không rõ nguyên nhân";
      message.error(`Không thể tạo đơn hàng: ${backendMessage}`);
    } finally {
      setCreatingOrder(false);
    }
  };

  // Cấu hình class chung hỗ trợ Dark Mode
  const cardClass = `rounded-2xl border transition-all duration-300 p-5 md:p-6 lg:p-8 ${
    isDarkMode 
      ? 'bg-slate-900 border-slate-800 shadow-[0_4px_25px_rgba(0,0,0,0.4)]' 
      : 'bg-white border-gray-100 shadow-md shadow-gray-200/40'
  }`;

  if (!userId || !checkoutDraft || selectedItems.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-transparent">
        <Spin size="large" tip="Đang khởi tạo dữ liệu thanh toán..." />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] px-2 sm:px-4 py-8 md:px-8 w-full bg-transparent">
      <div className="mx-auto w-full max-w-[1800px]">
        
        {/* COMPONENT: HERO BANNER */}
        <section className={`relative overflow-hidden rounded-3xl mb-8 min-h-[180px] md:min-h-[220px] flex items-center border ${
          isDarkMode ? 'border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.6)]' : 'border-orange-400 shadow-xl shadow-orange-500/10'
        }`}>
          {/* Lớp hình ảnh nền cố định bên dưới */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1563013544-824ae1d704d3?q=80&w=1920&auto=format&fit=crop" 
              alt="Secure Checkout Processing" 
              className="w-full h-full object-cover object-center"
            />
          </div>
          {/* Lớp phủ linear gradient làm nổi text nhưng vẫn lộ hình phía sau */}
          <div className={`absolute inset-0 z-10 bg-gradient-to-r ${
            isDarkMode 
              ? 'from-slate-950 via-slate-950/80 to-transparent' 
              : 'from-orange-600 via-orange-500/90 to-transparent'
          }`}></div>
          
          <div className="relative z-20 p-6 md:p-10 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-white/20 text-white backdrop-blur-md border border-white/20">
                  <CreditCardOutlined className="text-3xl" />
                </div>
                <h1 className="m-0 text-3xl md:text-4xl font-black tracking-tight text-white">Xác nhận thanh toán</h1>
              </div>
              <p className="text-sm md:text-base text-white/90 font-medium">
                Vui lòng cấu hình chính xác thông tin nhận nhận hàng và phương thức giao dịch để hoàn tất tạo đơn.
              </p>
            </div>
            <div className="flex items-center gap-3 font-bold text-sm text-white bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/20 shadow-sm">
              <span className={`material-symbols-outlined text-[18px] align-middle mr-1 ${isDarkMode ? 'text-white' : 'text-black'}`}>lock</span>
              <span className = {` ${isDarkMode ? 'text-white' : 'text-black'}`}>Secure Checkout Section</span>
            </div>
          </div>
        </section>

        {/* BỐ CỤC HAI CỘT GRID */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px] xl:gap-8 w-full">
          
          {/* CỘT TRÁI: KHU VỰC THÔNG TIN LUỒNG */}
          <div className="space-y-6 flex flex-col">
            
            {/* SECTION 1: ĐỊA CHỈ NHẬN HÀNG */}
            <section className={`${cardClass} flex flex-col gap-4`}>
              <div className={`flex justify-between items-center border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
                <h3 className={`font-black text-lg md:text-xl m-0 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <EnvironmentOutlined className="text-orange-500" /> Địa chỉ nhận hàng
                </h3>
                <button 
                  onClick={handleOpenAddressModal}
                  className="text-orange-500 hover:text-orange-600 text-xs font-black uppercase flex items-center gap-1 transition-colors"
                >
                  <PlusOutlined /> Thêm địa chỉ mới
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className={`rounded-xl p-6 text-center border border-dashed ${isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-gray-300 bg-gray-50'}`}>
                  <p className={`mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Bạn chưa cấu hình danh sách địa chỉ giao nhận nào.</p>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAddressModal} className="bg-orange-500 hover:bg-orange-600 border-0 rounded-xl font-bold">Thêm ngay</Button>
                </div>
              ) : (
                <div className="space-y-3 w-full">
                  {addresses.map((address) => {
                    const isSelected = String(selectedAddressId) === String(address.id);
                    return (
                      <div
                        key={address.id}
                        onClick={() => setSelectedAddressId(address.id)}
                        className={`relative rounded-xl p-4 pr-14 transition-all duration-300 cursor-pointer border overflow-hidden ${
                          isSelected
                            ? "border-orange-500 bg-orange-500/5 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                            : isDarkMode ? "border-slate-800 bg-slate-950/40 hover:border-slate-700" : "border-gray-100 bg-white hover:border-orange-300"
                        }`}
                      >
                        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>}
                        
                        <div className="flex items-start gap-3">
                          <Radio checked={isSelected} className={isDarkMode ? '[&_.ant-radio-inner]:border-slate-600' : ''} />
                          <div className="flex flex-col gap-1 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-gray-950'}`}>{address.recipientName}</span>
                              <span className={`text-xs font-mono font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{address.recipientPhone}</span>
                              {address.isDefault && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600 border border-orange-200'}`}>Mặc định</span>
                              )}
                              {!address.isDefault && (
                                <button
                                  disabled={settingDefaultAddressId === address.id}
                                  onClick={(e) => { e.stopPropagation(); handleSetDefaultAddress(address.id); }}
                                  className="text-xs text-blue-500 hover:text-blue-400 font-bold transition-colors"
                                >
                                  [Đặt mặc định]
                                </button>
                              )}
                            </div>
                            <p className={`text-sm m-0 leading-relaxed font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{getAddressText(address)}</p>
                          </div>
                        </div>

                        <Popconfirm
                          title={<span className={isDarkMode ? 'text-white' : ''}>Xóa địa chỉ này?</span>}
                          okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}
                          onConfirm={(e) => { e.stopPropagation(); handleDeleteAddress(address.id); }}
                          onPopupClick={(e) => e.stopPropagation()}
                        >
                          <button 
                            onClick={(e) => e.stopPropagation()}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
                              isDarkMode ? 'text-gray-500 hover:bg-red-500/20 hover:text-red-400' : 'text-gray-400 hover:bg-red-50 hover:text-red-500'
                            }`}
                          >
                            <DeleteOutlined className="text-base" />
                          </button>
                        </Popconfirm>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* SECTION 2: SẢN PHẨM THANH TOÁN */}
            <section className={`${cardClass} flex flex-col gap-4`}>
              <h3 className={`font-bold text-lg md:text-xl m-0 flex items-center gap-2 border-b pb-3 ${isDarkMode ? 'border-slate-800 text-white' : 'border-gray-100 text-gray-900'}`}>
                <ShoppingCartOutlined className="text-orange-500" /> Sản phẩm thanh toán
              </h3>
              <div className="space-y-3 w-full">
                {selectedItems.map((item) => (
                  <div 
                    key={item.id} 
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isDarkMode ? 'bg-slate-950/40 border-slate-800 hover:border-slate-700' : 'bg-gray-50/50 border-gray-100 hover:bg-orange-50/20'
                    }`}
                  >
                    <div className="min-w-0 pr-4">
                      <h4 className={`font-bold text-base m-0 truncate ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{item.productName}</h4>
                      <div className={`text-xs mt-1 font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        SKU: <span className="font-mono">{item.sku || "N/A"}</span> &bull; Số lượng: <strong className="text-orange-500">{item.quantity}</strong>
                      </div>
                    </div>
                    <span className="text-base font-black text-orange-500 tracking-tight whitespace-nowrap">
                      {formatCurrency(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 3: PHƯƠNG THỨC THANH TOÁN */}
            <section className={`${cardClass} flex flex-col gap-4`}>
              <h3 className={`font-bold text-lg md:text-xl m-0 flex items-center gap-2 border-b pb-3 ${isDarkMode ? 'border-slate-800 text-white' : 'border-gray-100 text-gray-900'}`}>
                <WalletOutlined className="text-orange-500" /> Phương thức thanh toán
              </h3>
              
              <div className="grid grid-cols-1 gap-3 w-full">
                {/* Method COD */}
                <label 
                  onClick={() => setPaymentMethod("COD")}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                    paymentMethod === "COD" 
                      ? "border-orange-500 bg-orange-500/5" 
                      : isDarkMode ? "bg-slate-950/40 border-slate-800 hover:border-slate-700" : "bg-white border-gray-100 hover:border-orange-300"
                  }`}
                >
                  <Radio checked={paymentMethod === "COD"} className={isDarkMode ? '[&_.ant-radio-inner]:border-slate-600' : ''} />
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`material-symbols-outlined text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>local_shipping</span>
                    <span className={`text-sm font-black ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Thanh toán khi nhận hàng (COD)</span>
                    <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded tracking-wider border ${
                      isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    }`}>COD</span>
                  </div>
                </label>

                {/* Method SEPAY */}
                <label 
                  onClick={() => setPaymentMethod("SEPAY")}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                    paymentMethod === "SEPAY" 
                      ? "border-orange-500 bg-orange-500/5" 
                      : isDarkMode ? "bg-slate-950/40 border-slate-800 hover:border-slate-700" : "bg-white border-gray-100 hover:border-orange-300"
                  }`}
                >
                  <Radio checked={paymentMethod === "SEPAY"} className={isDarkMode ? '[&_.ant-radio-inner]:border-slate-600' : ''} />
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`material-symbols-outlined text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>account_balance</span>
                    <span className={`text-sm font-black ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Thanh toán qua cổng tự động Sepay</span>
                    <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded tracking-wider border ${
                      isDarkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-600 border-blue-200'
                    }`}>SEPAY</span>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* CỘT PHẢI: BẢNG TÓM TẮT BILL & XÁC NHẬN ĐƠN (STICKY OVERVIEW) */}
          <div className="w-full lg:sticky lg:top-24 h-fit">
            <div className={`${cardClass} !p-6 flex flex-col gap-5 relative overflow-hidden`}>
              {isDarkMode && <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 blur-3xl rounded-full pointer-events-none"></div>}
              
              <h3 className={`font-black text-xl border-b pb-3 m-0 ${isDarkMode ? 'border-slate-800 text-white' : 'border-gray-100 text-gray-900'}`}>
                Tóm tắt thanh toán
              </h3>
              
              <div className="flex flex-col gap-4 text-sm font-medium">
                <div className="flex justify-between items-center">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Số mặt hàng</span>
                  <strong className={isDarkMode ? 'text-white' : 'text-gray-900'}>{selectedItems.length}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Tạm tính</span>
                  <span className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Mã giảm giá</span>
                  <span className={`font-mono text-xs font-black px-2.5 py-0.5 rounded ${isDarkMode ? 'bg-slate-800 text-orange-400' : 'bg-gray-100 text-gray-700'}`}>
                    {checkoutDraft?.couponCode || "Không áp dụng"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Giảm giá</span>
                  <strong className="text-emerald-500">-{formatCurrency(discountAmount)}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Phí vận chuyển</span>
                  <span className="text-emerald-500 font-black">Miễn phí</span>
                </div>
              </div>

              <div className={`border-t pt-4 flex justify-between items-end ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
                <span className={`font-black text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Tổng thanh toán</span>
                <span className="text-2xl font-black text-orange-500 tracking-tight">{formatCurrency(finalAmount)}</span>
              </div>

              {/* KHỐI SNIPPET XÁC THỰC ĐỊA CHỈ NHỎ Ở ĐÁY BILL */}
              {selectedAddress && (
                <div className={`rounded-xl p-3 border ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-gray-50 border-gray-100'}`}>
                  <div className={`flex items-center gap-1.5 text-xs font-bold mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <CheckCircleOutlined className="text-emerald-500 text-sm" /> Địa chỉ giao nhận đã chọn
                  </div>
                  <div className={`text-xs font-black truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedAddress.recipientName} &bull; {selectedAddress.recipientPhone}
                  </div>
                  <div className={`text-[11px] truncate mt-0.5 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {getAddressText(selectedAddress)}
                  </div>
                </div>
              )}

              {/* CÁC NÚT TRIGGER ĐẶT HÀNG */}
              <div className="flex flex-col gap-2.5 mt-2">
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={creatingOrder}
                  disabled={!selectedAddressId}
                  onClick={handleCreateOrder}
                  className="!h-12 !rounded-xl !bg-orange-500 hover:!bg-orange-600 font-black uppercase tracking-wider text-sm border-0 shadow-lg shadow-orange-500/20"
                >
                  Đặt hàng
                </Button>
                <Button
                  size="large"
                  block
                  onClick={() => navigate("/cart")}
                  className={`!h-12 !rounded-xl font-bold ${
                    isDarkMode 
                      ? '!bg-slate-800 !text-gray-300 !border-slate-700 hover:!border-orange-500 hover:!text-orange-400' 
                      : 'text-gray-700 hover:text-orange-600 hover:border-orange-500'
                  }`}
                >
                  Quay lại giỏ hàng
                </Button>
              </div>
              
              <div className={`text-center text-xs font-bold mt-1 flex items-center justify-center gap-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <span className="material-symbols-outlined text-[15px]">security</span> Thông tin thanh toán được mã hóa bảo mật đầu cuối
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL FORM THÊM ĐỊA CHỈ NHẬN HÀNG MỚI */}
      <Modal
        title={<div className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : ''}`}><EnvironmentOutlined className="text-orange-500" /> Thêm địa chỉ nhận hàng</div>}
        open={addressModalOpen}
        onCancel={() => setAddressModalOpen(false)}
        onOk={handleCreateAddress}
        okText="Lưu địa chỉ"
        cancelText="Hủy"
        confirmLoading={creatingAddress}
        width={720}
        popupClassName={isDarkMode ? "dark-modal" : ""}
        styles={{ content: { backgroundColor: isDarkMode ? '#0f172a' : '#ffffff' }, header: { backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #f0f0f0' } }}
      >
        <Form form={form} layout="vertical" className={`mt-4 ${isDarkMode ? 'dark-form [&_.ant-form-item-label_label]:!text-gray-300' : ''}`}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Form.Item
              name="recipientName"
              label="Tên người nhận"
              rules={[{ required: true, message: "Vui lòng nhập tên người nhận" }]}
            >
              <Input placeholder="Nguyễn Văn A" className={isDarkMode ? '!bg-slate-900 !border-slate-800 !text-white' : ''} />
            </Form.Item>

            <Form.Item
              name="recipientPhone"
              label="Số điện thoại"
              rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
            >
              <Input placeholder="09xxxxxxxx" className={isDarkMode ? '!bg-slate-900 !border-slate-800 !text-white' : ''} />
            </Form.Item>
          </div>

          <Form.Item
            name="street"
            label="Địa chỉ cụ thể"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ cụ thể" }]}
          >
            <Input placeholder="Số nhà, tên đường..." className={isDarkMode ? '!bg-slate-900 !border-slate-800 !text-white' : ''} />
          </Form.Item>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Form.Item
              name="ward"
              label="Phường/Xã"
              rules={[{ required: true, message: "Vui lòng nhập phường/xã" }]}
            >
              <Input placeholder="Phường/Xã" className={isDarkMode ? '!bg-slate-900 !border-slate-800 !text-white' : ''} />
            </Form.Item>

            <Form.Item
              name="district"
              label="Quận/Huyện"
              rules={[{ required: true, message: "Vui lòng nhập quận/huyện" }]}
            >
              <Input placeholder="Quận/Huyện" className={isDarkMode ? '!bg-slate-900 !border-slate-800 !text-white' : ''} />
            </Form.Item>

            <Form.Item
              name="province"
              label="Tỉnh/Thành phố"
              rules={[{ required: true, message: "Vui lòng nhập tỉnh/thành phố" }]}
            >
              <Input placeholder="Tỉnh/Thành phố" className={isDarkMode ? '!bg-slate-900 !border-slate-800 !text-white' : ''} />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 items-end">
            <Form.Item name="postalCode" label="Mã bưu chính">
              <Input placeholder="Có thể bỏ trống" className={isDarkMode ? '!bg-slate-900 !border-slate-800 !text-white' : ''} />
            </Form.Item>

            <Form.Item name="country" label="Quốc gia">
              <Input placeholder="Việt Nam" className={isDarkMode ? '!bg-slate-900 !border-slate-800 !text-white' : ''} />
            </Form.Item>

            <Form.Item name="addressType" label="Loại địa chỉ">
              <Radio.Group className={isDarkMode ? '[&_.ant-radio-wrapper]:!text-gray-300 [&_.ant-radio-inner]:!bg-slate-900 [&_.ant-radio-inner]:!border-slate-600' : ''}>
                <Radio value="HOME">Nhà riêng</Radio>
                <Radio value="OFFICE">Công ty</Radio>
              </Radio.Group>
            </Form.Item>
          </div>

          <Form.Item name="isDefault" label="Đặt làm mặc định" className="!mb-0">
            <Radio.Group className={isDarkMode ? '[&_.ant-radio-wrapper]:!text-gray-300 [&_.ant-radio-inner]:!bg-slate-900 [&_.ant-radio-inner]:!border-slate-600' : ''}>
              <Radio value={true}>Có</Radio>
              <Radio value={false}>Không</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CheckoutPage;