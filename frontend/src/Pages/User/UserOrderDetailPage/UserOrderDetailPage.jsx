import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Empty,
  Popconfirm,
  Spin,
  Tag,
  Timeline,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  HomeOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  StarOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../../Apis/apiConfig";
import API_ENDPOINTS from "../../../Apis/apiEndpoints";
import { getAuthUser } from "../../../Utils/Auth";

import { useOutletContext } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value || 0));
};

const formatDateTime = (value) => {
  if (!value) return "Không xác định";

  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return "Không xác định";
  }
};

const extractData = (payload) => {
  if (payload?.data !== undefined) return payload.data;
  return payload;
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

const getShortId = (id) => {
  if (!id) return "N/A";
  return String(id).slice(0, 8).toUpperCase();
};

const getAddressText = (address) => {
  if (!address) return "Không có địa chỉ";

  return [
    address.street,
    address.ward,
    address.district,
    address.province,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
};

const getOrderStatusText = (status) => {
  const statusMap = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    PROCESSING: "Đang xử lý",
    SHIPPED: "Đang giao",
    DELIVERED: "Đã giao",
    CANCELLED: "Đã hủy",
  };

  return statusMap[status] || status || "Không xác định";
};

const getOrderStatusColor = (status) => {
  const colorMap = {
    PENDING: "gold",
    CONFIRMED: "blue",
    PROCESSING: "purple",
    SHIPPED: "cyan",
    DELIVERED: "green",
    CANCELLED: "red",
  };

  return colorMap[status] || "default";
};

const getPaymentStatusText = (status) => {
  const statusMap = {
    PENDING: "Chờ thanh toán",
    PAID: "Đã thanh toán",
    FAILED: "Thanh toán thất bại",
    REFUNDED: "Đã hoàn tiền",
    CANCELLED: "Đã hủy",
  };

  return statusMap[status] || status || "Không xác định";
};

const getPaymentStatusColor = (status) => {
  const colorMap = {
    PENDING: "gold",
    PAID: "green",
    FAILED: "red",
    REFUNDED: "blue",
    CANCELLED: "red",
  };

  return colorMap[status] || "default";
};

const getCurrentStep = (status) => {
  const stepMap = {
    PENDING: 0,
    CONFIRMED: 1,
    PROCESSING: 2,
    SHIPPED: 3,
    DELIVERED: 4,
    CANCELLED: 0,
  };

  return stepMap[status] ?? 0;
};

const canCancelOrder = (order) => {
  return ["PENDING", "CONFIRMED"].includes(order?.status);
};

const canReviewOrder = (order) => {
  return order?.status === "DELIVERED";
};

const canPaySepayOrder = (order) => {
  return order?.paymentMethod === "SEPAY" && order?.paymentStatus !== "PAID";
};

const getItemProductId = (item) => {
  return (
    item?.productId ||
    item?.product?.id ||
    item?.product?.productId ||
    item?.productVariant?.productId ||
    null
  );
};

const buildTrackingItems = (order, tracking) => {
  const status = order?.status;

  if (tracking?.timeline && Array.isArray(tracking.timeline)) {
    return tracking.timeline.map((item) => ({
      children: (
        <div>
          <Text strong>{item.title || getOrderStatusText(item.status)}</Text>
          <div className="text-sm text-gray-500">
            {item.description || "Đơn hàng đã được cập nhật trạng thái."}
          </div>
          {item.createdAt && (
            <div className="text-xs text-gray-400">
              {formatDateTime(item.createdAt)}
            </div>
          )}
        </div>
      ),
    }));
  }

  const baseItems = [
    {
      key: "PENDING",
      title: "Đơn hàng đã được tạo",
      description: "Hệ thống đã ghi nhận đơn hàng của bạn.",
    },
    {
      key: "CONFIRMED",
      title: "Đơn hàng đã được xác nhận",
      description: "Người bán hoặc quản trị viên đã xác nhận đơn hàng.",
    },
    {
      key: "PROCESSING",
      title: "Đơn hàng đang được xử lý",
      description: "Sản phẩm đang được chuẩn bị.",
    },
    {
      key: "SHIPPED",
      title: "Đơn hàng đang giao",
      description: "Đơn hàng đã được bàn giao cho đơn vị vận chuyển.",
    },
    {
      key: "DELIVERED",
      title: "Đơn hàng đã giao",
      description: "Bạn đã nhận được đơn hàng.",
    },
  ];

  const currentIndex = getCurrentStep(status);

  return baseItems.slice(0, currentIndex + 1).map((item) => ({
    children: (
      <div>
        <Text strong>{item.title}</Text>
        <div className="text-sm text-gray-500">{item.description}</div>
      </div>
    ),
  }));
};

const UserOrderDetailPage = () => {
  const navigate = useNavigate();
  const { id: orderId } = useParams();

  const {isDarkMode} = useOutletContext();

  const authUser = getAuthUser();
  const userId = authUser?.id;

  const orderEndpoint = API_ENDPOINTS.orders || API_ENDPOINTS.order;

  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  const items = useMemo(() => {
    return Array.isArray(order?.items) ? order.items : [];
  }, [order]);

  const trackingItems = useMemo(() => {
    return buildTrackingItems(order, tracking);
  }, [order, tracking]);

  const fetchOrderDetail = async () => {
    if (!userId || !orderId) return;

    setLoading(true);

    try {
      const response = await api.get(orderEndpoint.byId(orderId));
      const data = extractData(response);

      setOrder(data);
    } catch (error) {
      console.error("Lỗi tải chi tiết đơn hàng:", error);
      message.error(getApiErrorMessage(error, "Không thể tải chi tiết đơn hàng."));
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchTracking = async () => {
    if (!userId || !orderId || !orderEndpoint?.tracking) return;

    setLoadingTracking(true);

    try {
      const response = await api.get(orderEndpoint.tracking(orderId));
      const data = extractData(response);

      setTracking(data);
    } catch (error) {
      console.error("Lỗi tải tracking đơn hàng:", error);
      setTracking(null);
    } finally {
      setLoadingTracking(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
    fetchTracking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, userId]);

  const handleCancelOrder = async () => {
    if (!orderId) return;

    setCancelling(true);

    try {
      const response = await api.put(orderEndpoint.cancel(orderId));
      const updatedOrder = extractData(response);

      setOrder(updatedOrder);
      message.success("Đã hủy đơn hàng.");
    } catch (error) {
      console.error("Lỗi hủy đơn hàng:", error);
      message.error(getApiErrorMessage(error, "Không thể hủy đơn hàng."));
    } finally {
      setCancelling(false);
    }
  };

  const handleGetInvoice = async () => {
    if (!orderId || !orderEndpoint?.invoice) {
      message.warning("Chưa cấu hình API hóa đơn.");
      return;
    }

    setLoadingInvoice(true);

    try {
      const response = await api.get(orderEndpoint.invoice(orderId));
      const invoice = extractData(response);

      console.log("Invoice:", invoice);
      message.success("Đã lấy thông tin hóa đơn. Kiểm tra console để xem dữ liệu.");
    } catch (error) {
      console.error("Lỗi lấy hóa đơn:", error);
      message.error(getApiErrorMessage(error, "Không thể lấy hóa đơn."));
    } finally {
      setLoadingInvoice(false);
    }
  };

  const handlePaySepay = () => {
    if (!order) return;

    navigate("/seapay", {
      state: {
        order,
      },
    });
  };

  const handleReviewProduct = (item) => {
    const productId = getItemProductId(item);

    if (!productId) {
      message.warning(
        "Không tìm thấy productId của sản phẩm này. Cần kiểm tra OrderItemResponse backend."
      );
      return;
    }

    navigate(`/products/${productId}`, {
      state: {
        focusReview: true,
        orderId: order?.id,
        orderItemId: item?.id,
      },
    });
  };

  if (!userId) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 pb-10 pt-24 md:px-8 md:pt-28">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
          <Title level={2}>Bạn chưa đăng nhập</Title>

          <Paragraph className="text-gray-500">
            Vui lòng đăng nhập để xem chi tiết đơn hàng.
          </Paragraph>

          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/auth/login-register")}
            className="!rounded-xl !bg-orange-500 hover:!bg-orange-600"
          >
            Đăng nhập ngay
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <Spin size="large" tip="Đang tải chi tiết đơn hàng..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 pb-10 pt-24 md:px-8 md:pt-28">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
          <Empty description="Không tìm thấy đơn hàng." />

          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/orders")}
            className="mt-5 !rounded-xl !bg-orange-500 hover:!bg-orange-600"
          >
            Quay lại đơn hàng của tôi
          </Button>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === "CANCELLED";

  const orderStepItems = [
    {
      key: "PENDING",
      title: "Chờ xác nhận",
    },
    {
      key: "CONFIRMED",
      title: "Đã xác nhận",
    },
    {
      key: "PROCESSING",
      title: "Đang xử lý",
    },
    {
      key: "SHIPPED",
      title: "Đang giao",
    },
    {
      key: "DELIVERED",
      title: "Đã giao",
    },
  ];

  const currentStepIndex = getCurrentStep(order.status);

  return (
    <div className={`min-h-[calc(100vh-80px)] ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-orange-50 via-white to-amber-50'} px-4 pb-10 pt-24 md:px-8 md:pt-28`}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/orders")}
            className="!rounded-xl"
          >
            Quay lại
          </Button>

          <div className="flex flex-wrap gap-2">
            <Button
              icon={<ReloadOutlined />}
              loading={loading}
              onClick={fetchOrderDetail}
              className="!rounded-xl"
            >
              Làm mới
            </Button>

            <Button
              icon={<FileTextOutlined />}
              loading={loadingInvoice}
              onClick={handleGetInvoice}
              className="!rounded-xl"
            >
              Xem hóa đơn
            </Button>

            {canPaySepayOrder(order) && (
              <Button
                type="primary"
                icon={<CreditCardOutlined />}
                onClick={handlePaySepay}
                className="!rounded-xl !bg-orange-500 hover:!bg-orange-600"
              >
                Thanh toán ngay
              </Button>
            )}

            {canCancelOrder(order) && (
              <Popconfirm
                title="Hủy đơn hàng"
                description="Bạn có chắc chắn muốn hủy đơn hàng này không?"
                okText="Hủy đơn"
                cancelText="Không"
                okButtonProps={{ danger: true }}
                onConfirm={handleCancelOrder}
              >
                <Button
                  danger
                  icon={<StopOutlined />}
                  loading={cancelling}
                  className="!rounded-xl"
                >
                  Hủy đơn
                </Button>
              </Popconfirm>
            )}
          </div>
        </div>

        <div className="mb-6 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-8 text-white shadow-sm md:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Title level={2} className="!mb-2 !text-white">
                Đơn hàng #{getShortId(order.id)}
              </Title>

              <Text className="!text-white/90">
                Ngày tạo: {formatDateTime(order.createdAt)}
              </Text>
            </div>

            <div className="flex flex-wrap gap-2">
              <Tag color={getOrderStatusColor(order.status)} className="px-3 py-1">
                {getOrderStatusText(order.status)}
              </Tag>

              <Tag
                color={getPaymentStatusColor(order.paymentStatus)}
                className="px-3 py-1"
              >
                {getPaymentStatusText(order.paymentStatus)}
              </Tag>

              <Tag className="px-3 py-1">{order.paymentMethod || "N/A"}</Tag>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-6">
            <Card className="rounded-3xl border-0 shadow-sm !mb-6">
              <Title level={3}>Trạng thái đơn hàng</Title>

              {isCancelled ? (
                <div className="rounded-2xl bg-red-50 p-5 font-medium text-red-600">
                  Đơn hàng này đã được hủy.
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {orderStepItems.map((step, index) => {
                    const isDone = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                      <div
                        key={step.key}
                        className={`rounded-2xl border p-4 text-center transition ${
                          isCurrent
                            ? "border-orange-500 bg-orange-50 text-orange-600"
                            : isDone
                            ? "border-green-200 bg-green-50 text-green-600"
                            : "border-gray-100 bg-gray-50 text-gray-400"
                        }`}
                      >
                        <div
                          className={`mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                            isCurrent
                              ? "bg-orange-500 text-white"
                              : isDone
                              ? "bg-green-500 text-white"
                              : "bg-white text-gray-400"
                          }`}
                        >
                          {index + 1}
                        </div>

                        <div className="text-sm font-semibold leading-5">
                          {step.title}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card className="rounded-3xl border-0 shadow-sm !mb-6">
              <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <Title level={3} className="!mb-1">
                    Sản phẩm trong đơn
                  </Title>

                  {canReviewOrder(order) && (
                    <Text type="secondary">
                      Đơn hàng đã giao. Bạn có thể đánh giá từng sản phẩm.
                    </Text>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {items.map((item) => {
                  const productId = getItemProductId(item);
                  const canReviewThisItem = canReviewOrder(order) && Boolean(productId);

                  return (
                    <div
                      key={item.id || `${item.productName}-${item.sku}`}
                      className="rounded-2xl border border-gray-100 bg-white p-4"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <ShoppingOutlined className="text-orange-500" />
                            <Text strong className="text-base">
                              {item.productName}
                            </Text>
                          </div>

                          <div className="text-sm text-gray-500">
                            SKU: {item.sku || "Không có"} · Số lượng:{" "}
                            {item.quantity}
                          </div>

                          <div className="mt-1 text-sm text-gray-500">
                            Đơn giá: {formatCurrency(item.price)}
                          </div>

                          {!productId && canReviewOrder(order) && (
                            <div className="mt-2 text-xs text-red-500">
                              Chưa có productId trong order item nên chưa thể mở
                              trang đánh giá.
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-start gap-3 lg:items-end">
                          <Text className="text-lg font-bold !text-orange-600">
                            {formatCurrency(
                              item.lineTotal ||
                                Number(item.price || 0) * Number(item.quantity || 0)
                            )}
                          </Text>

                          <div className="flex flex-wrap gap-2">
                            {productId && (
                              <Button
                                onClick={() => navigate(`/products/${productId}`)}
                                className="!rounded-xl"
                              >
                                Xem sản phẩm
                              </Button>
                            )}

                            {canReviewOrder(order) && (
                              <Button
                                type="primary"
                                icon={<StarOutlined />}
                                disabled={!canReviewThisItem}
                                onClick={() => handleReviewProduct(item)}
                                className="!rounded-xl !bg-orange-500 hover:!bg-orange-600"
                              >
                                Đánh giá
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="rounded-3xl border-0 shadow-sm">
              <Title level={3}>
                <HomeOutlined className="mr-2 text-orange-500" />
                Địa chỉ nhận hàng
              </Title>

              <Descriptions column={1} bordered>
                <Descriptions.Item label="Người nhận">
                  {order.address?.recipientName || "Không có"}
                </Descriptions.Item>

                <Descriptions.Item label="Số điện thoại">
                  {order.address?.recipientPhone || "Không có"}
                </Descriptions.Item>

                <Descriptions.Item label="Địa chỉ">
                  {getAddressText(order.address)}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>

          <div className="space-y-6 xl:sticky xl:top-28 xl:h-fit">
            <Card className="rounded-3xl border-0 shadow-sm">
              <Title level={3}>Tóm tắt thanh toán</Title>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <Text type="secondary">Tạm tính</Text>
                  <Text>{formatCurrency(order.subTotal)}</Text>
                </div>

                <div className="flex justify-between gap-4">
                  <Text type="secondary">Mã giảm giá</Text>
                  <Text>{order.couponCode || "Không áp dụng"}</Text>
                </div>

                <div className="flex justify-between gap-4">
                  <Text type="secondary">Giảm giá</Text>
                  <Text className="!text-green-600">
                    -{formatCurrency(order.discountAmount)}
                  </Text>
                </div>

                <div className="flex justify-between gap-4">
                  <Text type="secondary">Phương thức</Text>
                  <Text>{order.paymentMethod || "N/A"}</Text>
                </div>

                <div className="flex justify-between gap-4">
                  <Text type="secondary">Thanh toán</Text>
                  <Tag color={getPaymentStatusColor(order.paymentStatus)}>
                    {getPaymentStatusText(order.paymentStatus)}
                  </Tag>
                </div>
              </div>

              <Divider />

              <div className="mb-5 flex items-center justify-between gap-4">
                <Text strong>Tổng thanh toán</Text>

                <Text className="text-2xl font-bold !text-orange-600">
                  {formatCurrency(order.totalAmount)}
                </Text>
              </div>

              {canPaySepayOrder(order) && (
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<CreditCardOutlined />}
                  onClick={handlePaySepay}
                  className="!h-12 !rounded-xl !bg-orange-500 hover:!bg-orange-600"
                >
                  Thanh toán Sepay
                </Button>
              )}

              <Button
                block
                size="large"
                onClick={() => navigate("/supermarket")}
                className="mt-3 !h-12 !rounded-xl"
              >
                Tiếp tục mua sắm
              </Button>
            </Card>

            <Card className="rounded-3xl border-0 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <Title level={3} className="!mb-0">
                  Theo dõi đơn hàng
                </Title>

                <Button
                  size="small"
                  icon={<ReloadOutlined />}
                  loading={loadingTracking}
                  onClick={fetchTracking}
                  className="!rounded-lg"
                >
                  Tải lại
                </Button>
              </div>

              {loadingTracking ? (
                <div className="py-10 text-center">
                  <Spin />
                </div>
              ) : (
                <Timeline items={trackingItems} />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOrderDetailPage;