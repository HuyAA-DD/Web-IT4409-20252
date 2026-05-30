import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Descriptions,
  Empty,
  Modal,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  EyeOutlined,
  LinkOutlined,
  ReloadOutlined,
  SyncOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";

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

const unwrapApiData = (response) => {
  if (response?.data?.data !== undefined) return response.data.data;
  if (response?.data !== undefined) return response.data;
  return response;
};

const getApiMessage = (error, fallback = "Có lỗi xảy ra.") => {
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

const paymentStatusMap = {
  PENDING: {
    color: "gold",
    label: "Chờ thanh toán",
  },
  PAID: {
    color: "green",
    label: "Đã thanh toán",
  },
  FAILED: {
    color: "red",
    label: "Thanh toán thất bại",
  },
  REFUNDED: {
    color: "blue",
    label: "Đã hoàn tiền",
  },
  CANCELLED: {
    color: "default",
    label: "Đã hủy",
  },
};

const orderStatusMap = {
  PENDING: {
    color: "gold",
    label: "Chờ xác nhận",
  },
  CONFIRMED: {
    color: "blue",
    label: "Đã xác nhận",
  },
  PROCESSING: {
    color: "purple",
    label: "Đang xử lý",
  },
  SHIPPED: {
    color: "cyan",
    label: "Đang giao",
  },
  DELIVERED: {
    color: "green",
    label: "Đã giao",
  },
  CANCELLED: {
    color: "red",
    label: "Đã hủy",
  },
};

const getPaymentStatusTag = (status) => {
  const data = paymentStatusMap[status] || {
    color: "default",
    label: status || "Không xác định",
  };

  return <Tag color={data.color}>{data.label}</Tag>;
};

const getOrderStatusTag = (status) => {
  const data = orderStatusMap[status] || {
    color: "default",
    label: status || "Không xác định",
  };

  return <Tag color={data.color}>{data.label}</Tag>;
};

const isPayableSepayOrder = (order) => {
  return order?.paymentMethod === "SEPAY" && order?.paymentStatus !== "PAID";
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const authUser = getAuthUser();
  const userId = authUser?.id;

  const orderEndpoint = API_ENDPOINTS.orders || API_ENDPOINTS.order;
  const paymentEndpoint = API_ENDPOINTS.payments || API_ENDPOINTS.payment;

  const orderFromState = location.state?.order || null;

  const [orders, setOrders] = useState([]);
  const [focusedOrder, setFocusedOrder] = useState(orderFromState);
  const [paymentResult, setPaymentResult] = useState(null);
  const [transactionResult, setTransactionResult] = useState(null);

  const [loadingOrders, setLoadingOrders] = useState(false);
  const [creatingCheckoutId, setCreatingCheckoutId] = useState(null);
  const [refreshingStatusId, setRefreshingStatusId] = useState(null);
  const [queryingTransactionId, setQueryingTransactionId] = useState(null);

  const sepayOrders = useMemo(() => {
    return orders.filter((order) => order.paymentMethod === "SEPAY");
  }, [orders]);

  const pendingSepayOrders = useMemo(() => {
    return sepayOrders.filter((order) => order.paymentStatus !== "PAID");
  }, [sepayOrders]);

  const paidSepayOrders = useMemo(() => {
    return sepayOrders.filter((order) => order.paymentStatus === "PAID");
  }, [sepayOrders]);

  const totalPendingAmount = useMemo(() => {
    return pendingSepayOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount || 0),
      0
    );
  }, [pendingSepayOrders]);

  const fetchOrders = async () => {
    if (!userId) {
      setOrders([]);
      return;
    }

    setLoadingOrders(true);

    try {
      const response = await api.get(orderEndpoint.list);
      const data = unwrapApiData(response);
      const orderList = Array.isArray(data) ? data : [];

      setOrders(orderList);

      if (focusedOrder?.id) {
        const freshFocusedOrder = orderList.find(
          (order) => String(order.id) === String(focusedOrder.id)
        );

        if (freshFocusedOrder) {
          setFocusedOrder(freshFocusedOrder);
        }
      }
    } catch (error) {
      console.error("Lỗi tải danh sách đơn hàng:", error);
      message.error("Không thể tải danh sách đơn hàng.");
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const updateOrderPaymentStatus = (paymentData) => {
    if (!paymentData?.orderId) return;

    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (String(order.id) !== String(paymentData.orderId)) {
          return order;
        }

        return {
          ...order,
          paymentStatus: paymentData.paymentStatus || order.paymentStatus,
          paymentMethod: paymentData.paymentMethod || order.paymentMethod,
        };
      })
    );

    setFocusedOrder((prevOrder) => {
      if (!prevOrder || String(prevOrder.id) !== String(paymentData.orderId)) {
        return prevOrder;
      }

      return {
        ...prevOrder,
        paymentStatus: paymentData.paymentStatus || prevOrder.paymentStatus,
        paymentMethod: paymentData.paymentMethod || prevOrder.paymentMethod,
      };
    });
  };

  const handleCreateSepayCheckout = async (order) => {
    if (!order?.id) return;

    if (order.paymentMethod !== "SEPAY") {
      message.warning("Chỉ đơn hàng có phương thức SEPAY mới thanh toán tại đây.");
      return;
    }

    if (order.paymentStatus === "PAID") {
      message.success("Đơn hàng này đã được thanh toán.");
      return;
    }

    setFocusedOrder(order);
    setCreatingCheckoutId(String(order.id));

    try {
      const response = await api.post(paymentEndpoint.sepayCheckout, {
        orderId: order.id,
        returnUrl: `${window.location.origin}/orders/${order.id}`,
      });

      const data = unwrapApiData(response);

      setPaymentResult(data);
      updateOrderPaymentStatus(data);

      if (data?.paymentUrl) {
        window.open(data.paymentUrl, "_blank", "noopener,noreferrer");

        Modal.success({
          title: "Đã tạo liên kết thanh toán Sepay",
          content: (
            <div>
              <p>Hệ thống đã mở trang thanh toán Sepay trong tab mới.</p>
              <p>
                Mã giao dịch: <strong>{data.transactionId || "Không có"}</strong>
              </p>
              <p>
                Số tiền: <strong>{formatCurrency(data.amount)}</strong>
              </p>
            </div>
          ),
          okText: "Đã hiểu",
        });
      } else {
        Modal.info({
          title: "Đã tạo giao dịch Sepay",
          content: (
            <div>
              <p>Backend đã tạo giao dịch nhưng chưa trả về paymentUrl.</p>
              <p>
                Mã giao dịch: <strong>{data?.transactionId || "Không có"}</strong>
              </p>
              <p>
                Số tiền: <strong>{formatCurrency(data?.amount)}</strong>
              </p>
              <p>
                Trạng thái:{" "}
                <strong>{data?.paymentStatus || "Không xác định"}</strong>
              </p>
            </div>
          ),
          okText: "Đã hiểu",
        });
      }

      message.success("Tạo thanh toán Sepay thành công.");
    } catch (error) {
      console.error("Lỗi tạo Sepay checkout:", error);
      message.error(getApiMessage(error, "Không thể tạo thanh toán Sepay."));
    } finally {
      setCreatingCheckoutId(null);
    }
  };

  const handleRefreshPaymentStatus = async (order) => {
    if (!order?.id) return;

    setRefreshingStatusId(String(order.id));

    try {
      const response = await api.get(paymentEndpoint.orderStatus(order.id));
      const data = unwrapApiData(response);

      setPaymentResult(data);
      updateOrderPaymentStatus(data);

      message.success("Đã cập nhật trạng thái thanh toán.");
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái thanh toán:", error);
      message.error(
        getApiMessage(
          error,
          "Không thể cập nhật trạng thái. Có thể đơn hàng chưa tạo giao dịch thanh toán."
        )
      );
    } finally {
      setRefreshingStatusId(null);
    }
  };

  const handleQueryTransactionStatus = async (order) => {
    if (!order?.id) return;

    setQueryingTransactionId(String(order.id));

    try {
      const response = await api.get(paymentEndpoint.transactionStatus(order.id));
      const data = unwrapApiData(response);

      setTransactionResult(data);

      Modal.info({
        title: "Trạng thái giao dịch Sepay",
        content: (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Transaction ID">
              {data?.transactionId || "Không có"}
            </Descriptions.Item>

            <Descriptions.Item label="External ID">
              {data?.externalId || "Không có"}
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái">
              {data?.status || "Không xác định"}
            </Descriptions.Item>

            <Descriptions.Item label="Số tiền">
              {formatCurrency(data?.amount)}
            </Descriptions.Item>

            <Descriptions.Item label="Tiền tệ">
              {data?.currency || "VND"}
            </Descriptions.Item>

            <Descriptions.Item label="Thời gian">
              {data?.timestamp || "Không có"}
            </Descriptions.Item>
          </Descriptions>
        ),
        okText: "Đóng",
        width: 720,
      });
    } catch (error) {
      console.error("Lỗi truy vấn trạng thái giao dịch:", error);
      message.error(
        getApiMessage(
          error,
          "Không thể truy vấn giao dịch. Có thể đơn hàng chưa có transactionId."
        )
      );
    } finally {
      setQueryingTransactionId(null);
    }
  };

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "id",
      key: "id",
      render: (id) => (
        <Tag color="orange" className="rounded-full px-3 py-1">
          #{getShortId(id)}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value) => formatDateTime(value),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (value) => (
        <Text strong className="!text-orange-600">
          {formatCurrency(value)}
        </Text>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status) => getPaymentStatusTag(status),
    },
    {
      title: "Đơn hàng",
      dataIndex: "status",
      key: "status",
      render: (status) => getOrderStatusTag(status),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, order) => (
        <Space wrap>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewOrder(order.id)}
            className="!rounded-xl"
          >
            Xem đơn
          </Button>

          {isPayableSepayOrder(order) && (
            <Button
              type="primary"
              icon={<CreditCardOutlined />}
              loading={creatingCheckoutId === String(order.id)}
              onClick={() => handleCreateSepayCheckout(order)}
              className="!rounded-xl !bg-orange-500 hover:!bg-orange-600"
            >
              Thanh toán
            </Button>
          )}

          <Button
            icon={<ReloadOutlined />}
            loading={refreshingStatusId === String(order.id)}
            onClick={() => handleRefreshPaymentStatus(order)}
            className="!rounded-xl"
          >
            Cập nhật
          </Button>

          <Button
            icon={<SyncOutlined />}
            loading={queryingTransactionId === String(order.id)}
            onClick={() => handleQueryTransactionStatus(order)}
            className="!rounded-xl"
          >
            Giao dịch
          </Button>
        </Space>
      ),
    },
  ];

  if (!userId) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 pb-10 pt-24 md:px-8 md:pt-28">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
          <WalletOutlined className="mb-4 text-5xl text-orange-500" />

          <Title level={2}>Bạn chưa đăng nhập</Title>

          <Paragraph className="text-gray-500">
            Vui lòng đăng nhập để quản lý thanh toán.
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
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 pb-10 pt-24 md:px-8 md:pt-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-8 text-white shadow-sm md:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <WalletOutlined className="text-3xl" />

                <Title level={2} className="!mb-0 !text-white">
                  Thanh toán Sepay
                </Title>
              </div>

              <Text className="!text-white/90">
                Quản lý các đơn hàng thanh toán qua Sepay và cập nhật trạng thái
                giao dịch.
              </Text>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/orders")}
                className="!rounded-xl"
              >
                Đơn hàng của tôi
              </Button>

              <Button
                icon={<ReloadOutlined />}
                loading={loadingOrders}
                onClick={fetchOrders}
                className="!rounded-xl"
              >
                Làm mới
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="rounded-3xl border-0 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-xl text-orange-500">
                <WalletOutlined />
              </div>

              <div>
                <Text type="secondary">Đơn Sepay</Text>
                <div className="text-2xl font-bold">{sepayOrders.length}</div>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl border-0 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-50 text-xl text-yellow-500">
                <ClockCircleOutlined />
              </div>

              <div>
                <Text type="secondary">Chờ thanh toán</Text>
                <div className="text-2xl font-bold">
                  {pendingSepayOrders.length}
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl border-0 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-xl text-green-500">
                <CheckCircleOutlined />
              </div>

              <div>
                <Text type="secondary">Đã thanh toán</Text>
                <div className="text-2xl font-bold">{paidSepayOrders.length}</div>
              </div>
            </div>
          </Card>
        </div>

        {focusedOrder && (
          <Card className="mb-6 rounded-3xl border-0 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Tag color="orange" className="rounded-full px-3 py-1">
                    Đơn đang chọn #{getShortId(focusedOrder.id)}
                  </Tag>

                  {getPaymentStatusTag(focusedOrder.paymentStatus)}
                  {getOrderStatusTag(focusedOrder.status)}
                  <Tag>{focusedOrder.paymentMethod || "N/A"}</Tag>
                </div>

                <Title level={4} className="!mb-1">
                  Tổng thanh toán: {formatCurrency(focusedOrder.totalAmount)}
                </Title>

                <Text type="secondary">
                  Ngày tạo: {formatDateTime(focusedOrder.createdAt)}
                </Text>
              </div>

              <Space wrap>
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => handleViewOrder(focusedOrder.id)}
                  className="!rounded-xl"
                >
                  Xem chi tiết đơn
                </Button>

                {isPayableSepayOrder(focusedOrder) && (
                  <Button
                    type="primary"
                    icon={<CreditCardOutlined />}
                    loading={creatingCheckoutId === String(focusedOrder.id)}
                    onClick={() => handleCreateSepayCheckout(focusedOrder)}
                    className="!rounded-xl !bg-orange-500 hover:!bg-orange-600"
                  >
                    Tạo thanh toán Sepay
                  </Button>
                )}

                <Button
                  icon={<ReloadOutlined />}
                  loading={refreshingStatusId === String(focusedOrder.id)}
                  onClick={() => handleRefreshPaymentStatus(focusedOrder)}
                  className="!rounded-xl"
                >
                  Cập nhật trạng thái
                </Button>
              </Space>
            </div>
          </Card>
        )}

        {paymentResult && (
          <Card className="mb-6 rounded-3xl border-0 shadow-sm">
            <Title level={4}>
              <LinkOutlined className="mr-2 text-orange-500" />
              Giao dịch vừa tạo
            </Title>

            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Order ID">
                {paymentResult.orderId || "Không có"}
              </Descriptions.Item>

              <Descriptions.Item label="Transaction ID">
                {paymentResult.transactionId || "Không có"}
              </Descriptions.Item>

              <Descriptions.Item label="Số tiền">
                {formatCurrency(paymentResult.amount)}
              </Descriptions.Item>

              <Descriptions.Item label="Phương thức">
                {paymentResult.paymentMethod || "Không xác định"}
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái">
                {getPaymentStatusTag(paymentResult.paymentStatus)}
              </Descriptions.Item>

              <Descriptions.Item label="Payment URL">
                {paymentResult.paymentUrl ? (
                  <Button
                    type="link"
                    icon={<LinkOutlined />}
                    onClick={() =>
                      window.open(
                        paymentResult.paymentUrl,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                    className="!px-0"
                  >
                    Mở lại trang thanh toán
                  </Button>
                ) : (
                  "Backend chưa trả về paymentUrl"
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {transactionResult && (
          <Card className="mb-6 rounded-3xl border-0 shadow-sm">
            <Title level={4}>Thông tin transaction mới nhất</Title>

            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Transaction ID">
                {transactionResult.transactionId || "Không có"}
              </Descriptions.Item>

              <Descriptions.Item label="External ID">
                {transactionResult.externalId || "Không có"}
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái">
                {transactionResult.status || "Không xác định"}
              </Descriptions.Item>

              <Descriptions.Item label="Số tiền">
                {formatCurrency(transactionResult.amount)}
              </Descriptions.Item>

              <Descriptions.Item label="Tiền tệ">
                {transactionResult.currency || "VND"}
              </Descriptions.Item>

              <Descriptions.Item label="Thời gian">
                {transactionResult.timestamp || "Không có"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        <Card className="rounded-3xl border-0 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <Title level={3} className="!mb-1">
                Danh sách đơn hàng Sepay
              </Title>

              <Text type="secondary">
                Tổng tiền đang chờ thanh toán:{" "}
                <strong>{formatCurrency(totalPendingAmount)}</strong>
              </Text>
            </div>

            <Button
              icon={<ReloadOutlined />}
              loading={loadingOrders}
              onClick={fetchOrders}
              className="!rounded-xl"
            >
              Tải lại
            </Button>
          </div>

          {loadingOrders ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <Spin size="large" tip="Đang tải đơn hàng..." />
            </div>
          ) : sepayOrders.length === 0 ? (
            <div className="py-12 text-center">
              <Empty description="Chưa có đơn hàng Sepay nào." />

              <Button
                type="primary"
                onClick={() => navigate("/cart")}
                className="mt-4 !rounded-xl !bg-orange-500 hover:!bg-orange-600"
              >
                Quay lại giỏ hàng
              </Button>
            </div>
          ) : (
            <Table
              rowKey="id"
              columns={columns}
              dataSource={sepayOrders}
              pagination={{
                pageSize: 6,
              }}
              scroll={{
                x: 1000,
              }}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;