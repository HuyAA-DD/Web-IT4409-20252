import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Empty,
  Popconfirm,
  Spin,
  Steps,
  Tag,
  Timeline,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  HomeOutlined,
  ReloadOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../../Apis/apiConfig";
import API_ENDPOINTS from "../../../Apis/apiEndpoints";
import { getAuthUser } from "../../../Utils/Auth";

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

const UserOrderDetailPage = () => {
  const navigate = useNavigate();
  const { id: orderId } = useParams();

  const authUser = getAuthUser();
  const userId = authUser?.id;

  const orderEndpoint = API_ENDPOINTS.orders || API_ENDPOINTS.order;

  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const items = useMemo(() => {
    return Array.isArray(order?.items) ? order.items : [];
  }, [order]);

  const fetchOrderDetail = async () => {
    if (!userId || !orderId) return;

    setLoading(true);

    try {
      const response = await api.get(orderEndpoint.byId(orderId));
      const data = extractData(response);

      setOrder(data);
    } catch (error) {
      console.error("Lỗi tải chi tiết đơn hàng:", error);
      message.error("Không thể tải chi tiết đơn hàng.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchTracking = async () => {
    if (!userId || !orderId) return;

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
      message.error("Không thể hủy đơn hàng.");
    } finally {
      setCancelling(false);
    }
  };

  const handleGetInvoice = async () => {
    if (!orderId) return;

    try {
      const response = await api.get(orderEndpoint.invoice(orderId));
      console.log("Invoice:", response);
      message.success("Đã lấy thông tin hóa đơn. Kiểm tra console để xem dữ liệu.");
    } catch (error) {
      console.error("Lỗi lấy hóa đơn:", error);
      message.error("Không thể lấy hóa đơn.");
    }
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
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-orange-50 pt-24">
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
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 pb-10 pt-24 md:px-8 md:pt-28">
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
              onClick={handleGetInvoice}
              className="!rounded-xl"
            >
              Xem hóa đơn
            </Button>

            {canCancelOrder(order) && (
              <Popconfirm
                title="Hủy đơn hàng?"
                description="Bạn chỉ nên hủy đơn khi đơn chưa được giao."
                okText="Hủy đơn"
                cancelText="Không"
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
            <Card className="rounded-3xl border-0 shadow-sm">
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

            <Card className="rounded-3xl border-0 shadow-sm">
              <Title level={3}>Sản phẩm trong đơn</Title>

              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-gray-100 bg-white p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <Text strong>{item.productName}</Text>

                        <div className="mt-1 text-sm text-gray-500">
                          SKU: {item.sku || "Không có"} · Số lượng:{" "}
                          {item.quantity}
                        </div>

                        <div className="mt-1 text-sm text-gray-500">
                          Đơn giá: {formatCurrency(item.price)}
                        </div>
                      </div>

                      <Text className="text-lg font-bold !text-orange-600">
                        {formatCurrency(item.lineTotal)}
                      </Text>
                    </div>
                  </div>
                ))}
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

          <div className="xl:sticky xl:top-28 xl:h-fit">
            <Card className="rounded-3xl border-0 shadow-sm">
              <Title level={3}>Tóm tắt thanh toán</Title>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <Text type="secondary">Tạm tính</Text>
                  <Text>{formatCurrency(order.subTotal)}</Text>
                </div>

                <div className="flex justify-between">
                  <Text type="secondary">Mã giảm giá</Text>
                  <Text>{order.couponCode || "Không áp dụng"}</Text>
                </div>

                <div className="flex justify-between">
                  <Text type="secondary">Giảm giá</Text>
                  <Text className="!text-green-600">
                    -{formatCurrency(order.discountAmount)}
                  </Text>
                </div>

                <div className="flex justify-between">
                  <Text type="secondary">Phương thức</Text>
                  <Text>{order.paymentMethod || "N/A"}</Text>
                </div>

                <div className="flex justify-between">
                  <Text type="secondary">Thanh toán</Text>
                  <Tag color={getPaymentStatusColor(order.paymentStatus)}>
                    {getPaymentStatusText(order.paymentStatus)}
                  </Tag>
                </div>
              </div>

              <Divider />

              <div className="mb-5 flex items-center justify-between">
                <Text strong>Tổng thanh toán</Text>

                <Text className="text-2xl font-bold !text-orange-600">
                  {formatCurrency(order.totalAmount)}
                </Text>
              </div>

              {order.paymentMethod === "SEPAY" &&
                order.paymentStatus === "PENDING" && (
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={() =>
                      navigate("/seapay", {
                        state: {
                          order,
                        },
                      })
                    }
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

            <Card className="mt-6 rounded-3xl border-0 shadow-sm">
              <Title level={4}>Theo dõi đơn hàng</Title>

              {loadingTracking ? (
                <div className="py-8 text-center">
                  <Spin />
                </div>
              ) : (
                <Timeline
                  className="mt-5"
                  items={[
                    {
                      color: getOrderStatusColor(order.status),
                      children: `Trạng thái hiện tại: ${getOrderStatusText(
                        tracking?.status || order.status
                      )}`,
                    },
                    {
                      color: "gray",
                      children: `Cập nhật lúc: ${formatDateTime(
                        tracking?.createdAt || order.createdAt
                      )}`,
                    },
                  ]}
                />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOrderDetailPage;