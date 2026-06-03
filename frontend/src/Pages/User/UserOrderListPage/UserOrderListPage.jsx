import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Empty,
  Input,
  Popconfirm,
  Select,
  Spin,
  Tag,
  Timeline,
  Typography,
  message,
} from "antd";
import {
  EyeOutlined,
  FileTextOutlined,
  ReloadOutlined,
  SearchOutlined,
  ShoppingOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import api from "../../../Apis/apiConfig";
import API_ENDPOINTS from "../../../Apis/apiEndpoints";
import { getAuthUser } from "../../../Utils/Auth";

import {useOutletContext} from "react-router-dom";

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

const canCancelOrder = (order) => {
  return ["PENDING", "CONFIRMED"].includes(order?.status);
};

const UserOrderListPage = () => {
  const navigate = useNavigate();
  const {isDarkMode} = useOutletContext() || {};
  const authUser = getAuthUser();
  const userId = authUser?.id;

  const orderEndpoint = API_ENDPOINTS.orders || API_ENDPOINTS.order;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredOrders = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return orders.filter((order) => {
      const matchStatus =
        statusFilter === "ALL" || String(order.status) === statusFilter;

      const matchKeyword =
        !normalizedKeyword ||
        String(order.id || "").toLowerCase().includes(normalizedKeyword) ||
        String(order.couponCode || "").toLowerCase().includes(normalizedKeyword) ||
        String(order.paymentMethod || "").toLowerCase().includes(normalizedKeyword);

      return matchStatus && matchKeyword;
    });
  }, [orders, keyword, statusFilter]);

  const fetchOrders = async () => {
    if (!userId) {
      setOrders([]);
      return;
    }

    setLoading(true);

    try {
      const response = await api.get(orderEndpoint.list);
      const data = extractData(response);

      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi tải danh sách đơn hàng:", error);
      message.error("Không thể tải danh sách đơn hàng.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleCancelOrder = async (orderId) => {
    if (!orderId) return;

    setCancellingId(String(orderId));

    try {
      const response = await api.put(orderEndpoint.cancel(orderId));
      const updatedOrder = extractData(response);

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          String(order.id) === String(orderId) ? updatedOrder : order
        )
      );

      message.success("Đã hủy đơn hàng.");
    } catch (error) {
      console.error("Lỗi hủy đơn hàng:", error);
      message.error("Không thể hủy đơn hàng.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleGoToDetail = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  if (!userId) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 pb-10 pt-24 md:px-8 md:pt-28">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
          <ShoppingOutlined className="mb-4 text-5xl text-orange-500" />

          <Title level={2}>Bạn chưa đăng nhập</Title>

          <Paragraph className="text-gray-500">
            Vui lòng đăng nhập để xem đơn hàng của bạn.
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

  return (
    <div className={`min-h-[calc(100vh-80px)] ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-orange-50 via-white to-amber-50'} px-4 pb-10 pt-24 md:px-8 md:pt-28`}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-8 text-white shadow-sm md:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <ShoppingOutlined className="text-3xl" />

                <Title level={2} className="!mb-0 !text-white">
                  Đơn hàng của tôi
                </Title>
              </div>

              <Text className="text-white/90">
                Theo dõi trạng thái đơn hàng, thanh toán và lịch sử mua sắm.
              </Text>
            </div>

            <Button
              icon={<ReloadOutlined />}
              loading={loading}
              onClick={fetchOrders}
              className="!rounded-xl"
            >
              Làm mới
            </Button>
          </div>
        </div>

        <Card className="mb-6 rounded-3xl border-0 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              prefix={<SearchOutlined />}
              placeholder="Tìm theo mã đơn, coupon, phương thức thanh toán..."
              className="!rounded-xl"
            />

            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-full"
              options={[
                { value: "ALL", label: "Tất cả trạng thái" },
                { value: "PENDING", label: "Chờ xác nhận" },
                { value: "CONFIRMED", label: "Đã xác nhận" },
                { value: "PROCESSING", label: "Đang xử lý" },
                { value: "SHIPPED", label: "Đang giao" },
                { value: "DELIVERED", label: "Đã giao" },
                { value: "CANCELLED", label: "Đã hủy" },
              ]}
            />
          </div>
        </Card>

        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-3xl bg-white shadow-sm">
            <Spin size="large" tip="Đang tải đơn hàng..." />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm mt-6">
            <Empty description="Chưa có đơn hàng phù hợp." />

            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/supermarket")}
              className="mt-5 !rounded-xl !bg-orange-500 hover:!bg-orange-600"
            >
              Mua sắm ngay
            </Button>
          </div>
        ) : (
          <div className="space-y-5 !mt-6">
            {filteredOrders.map((order) => {
              const items = Array.isArray(order.items) ? order.items : [];
              const firstItems = items.slice(0, 3);
              const remainingCount = Math.max(items.length - firstItems.length, 0);

              return (
                <Card
                  key={order.id}
                  className="rounded-3xl border-0 shadow-sm transition hover:-translate-y-1 hover:shadow-md !mt-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <Tag color="orange" className="rounded-full px-3 py-1">
                          #{getShortId(order.id)}
                        </Tag>

                        <Tag color={getOrderStatusColor(order.status)}>
                          {getOrderStatusText(order.status)}
                        </Tag>

                        <Tag color={getPaymentStatusColor(order.paymentStatus)}>
                          {getPaymentStatusText(order.paymentStatus)}
                        </Tag>

                        <Tag>{order.paymentMethod || "N/A"}</Tag>
                      </div>

                      <div className="mb-3 text-sm text-gray-500">
                        Ngày tạo: {formatDateTime(order.createdAt)}
                      </div>

                      <div className="space-y-2">
                        {firstItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3"
                          >
                            <div className="min-w-0">
                              <Text strong>{item.productName}</Text>

                              <div className="text-xs text-gray-500">
                                SKU: {item.sku || "Không có"} · SL:{" "}
                                {item.quantity}
                              </div>
                            </div>

                            <Text strong className="!text-orange-600">
                              {formatCurrency(item.lineTotal)}
                            </Text>
                          </div>
                        ))}

                        {remainingCount > 0 && (
                          <div className="rounded-2xl bg-orange-50 px-4 py-3 text-sm text-orange-600">
                            +{remainingCount} sản phẩm khác
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-full lg:w-[280px]">
                      <Card className="rounded-2xl bg-orange-50" bordered={false}>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <Text type="secondary">Tạm tính</Text>
                            <Text>{formatCurrency(order.subTotal)}</Text>
                          </div>

                          <div className="flex justify-between">
                            <Text type="secondary">Giảm giá</Text>
                            <Text className="!text-green-600">
                              -{formatCurrency(order.discountAmount)}
                            </Text>
                          </div>

                          <div className="flex justify-between">
                            <Text strong>Tổng tiền</Text>
                            <Text strong className="!text-orange-600">
                              {formatCurrency(order.totalAmount)}
                            </Text>
                          </div>
                        </div>
                      </Card>

                      <div className="mt-3 grid grid-cols-1 gap-2">
                        <Button
                          icon={<EyeOutlined />}
                          onClick={() => handleGoToDetail(order.id)}
                          className="!rounded-xl"
                        >
                          Xem chi tiết
                        </Button>

                        {canCancelOrder(order) && (
                          <Popconfirm
                            title="Hủy đơn hàng?"
                            description="Bạn chỉ nên hủy khi đơn chưa được xử lý/giao hàng."
                            okText="Hủy đơn"
                            cancelText="Không"
                            onConfirm={() => handleCancelOrder(order.id)}
                          >
                            <Button
                              danger
                              icon={<StopOutlined />}
                              loading={cancellingId === String(order.id)}
                              className="!rounded-xl"
                            >
                              Hủy đơn
                            </Button>
                          </Popconfirm>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <Title level={4}>
            <FileTextOutlined className="mr-2 text-orange-500" />
            Quy trình xử lý đơn
          </Title>

          <Timeline
            className="mt-5"
            items={[
              { color: "orange", children: "PENDING: Đơn vừa được tạo" },
              { color: "blue", children: "CONFIRMED: Người bán/admin xác nhận" },
              { color: "purple", children: "PROCESSING: Đang chuẩn bị hàng" },
              { color: "cyan", children: "SHIPPED: Đang giao hàng" },
              { color: "green", children: "DELIVERED: Giao thành công" },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default UserOrderListPage;