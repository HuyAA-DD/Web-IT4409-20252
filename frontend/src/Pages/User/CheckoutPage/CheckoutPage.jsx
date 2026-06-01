import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
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

      const defaultAddress =
        addressList.find((address) => address.isDefault) || addressList[0];

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

      console.error("Lỗi thêm địa chỉ:", error);
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
        const nextAddresses = prev.filter(
          (address) => String(address.id) !== String(addressId)
        );

        if (String(selectedAddressId) === String(addressId)) {
          const nextSelectedAddress =
            nextAddresses.find((address) => address.isDefault) ||
            nextAddresses[0];

          setSelectedAddressId(nextSelectedAddress?.id || null);
        }

        return nextAddresses;
      });

      message.success("Đã xóa địa chỉ nhận hàng.");
    } catch (error) {
      console.error("Lỗi xóa địa chỉ:", error);
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
        (address) =>
          address.isDefault && String(address.id) !== String(addressId)
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
      console.error("Lỗi đặt địa chỉ mặc định:", error);
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
      await Promise.all(
        selectedItemIds.map((itemId) =>
          api.delete(cartEndpoint.item(userId, itemId))
        )
      );
    } catch (error) {
      console.error("Tạo đơn thành công nhưng lỗi khi xóa item khỏi cart:", error);
      message.warning(
        "Đơn hàng đã được tạo, nhưng một số sản phẩm có thể vẫn còn trong giỏ hàng."
      );
    }
  };

  const handleCreateOrder = async () => {
    if (!userId) {
      message.warning("Vui lòng đăng nhập để đặt hàng.");
      return;
    }

    if (!checkoutDraft || selectedItems.length === 0) {
      message.warning("Không có sản phẩm để đặt hàng.");
      return;
    }

    if (!selectedAddressId) {
      message.warning("Vui lòng chọn hoặc thêm địa chỉ nhận hàng.");
      return;
    }

    const orderItems = selectedItems
      .filter((item) => item.productVariantId)
      .map((item) => ({
        productVariantId: item.productVariantId,
        quantity: Number(item.quantity || 1),
      }));

    if (orderItems.length === 0) {
      message.warning("Không có sản phẩm hợp lệ để tạo đơn hàng.");
      return;
    }

    setCreatingOrder(true);

    try {
      const payload = {
        addressId: selectedAddressId,
        items: orderItems,
        paymentMethod,
        couponCode: checkoutDraft.couponCode || null,
      };

      console.log("Create order payload:", payload);

      const response = await api.post(orderEndpoint.create, payload);
      const createdOrder = unwrapApiData(response);

      await cleanupOrderedCartItems();

      sessionStorage.removeItem("checkoutDraft");

      Modal.success({
        title: "Tạo đơn hàng thành công",
        content: (
          <div>
            <p>Đơn hàng đã được tạo thành công.</p>
            <p>
              Tổng thanh toán:{" "}
              <strong>
                {formatCurrency(createdOrder?.totalAmount || finalAmount)}
              </strong>
            </p>
            <p>
              Phương thức thanh toán:{" "}
              <strong>{createdOrder?.paymentMethod || paymentMethod}</strong>
            </p>
            <p>
              Trạng thái thanh toán:{" "}
              <strong>{createdOrder?.paymentStatus || "PENDING"}</strong>
            </p>
          </div>
        ),
        okText:
          paymentMethod === "SEPAY" ? "Đi tới thanh toán" : "Xem đơn hàng",
        onOk: () => {
          if (paymentMethod === "SEPAY") {
            navigate("/seapay", {
              state: {
                order: createdOrder,
              },
            });
            return;
          }

          navigate(`/orders/${createdOrder.id}`, {
            state: {
              order: createdOrder,
            },
          });
        },
      });
    } catch (error) {
      const status = error?.response?.status;
      const responseData = error?.response?.data;

      const backendMessage =
        responseData?.message ||
        responseData?.error ||
        responseData?.detail ||
        responseData?.data?.message ||
        error?.message ||
        "Không rõ nguyên nhân";

      console.error("Lỗi tạo đơn hàng chi tiết:", {
        status,
        responseData,
        error,
      });

      message.error(
        `Không thể tạo đơn hàng${status ? ` (${status})` : ""}: ${backendMessage}`
      );
    } finally {
      setCreatingOrder(false);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 pb-10 pt-24 md:px-8 md:pt-28">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
          <Title level={2}>Bạn chưa đăng nhập</Title>

          <Paragraph className="text-gray-500">
            Vui lòng đăng nhập để tiếp tục thanh toán.
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

  if (!checkoutDraft || selectedItems.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 pb-10 pt-24 md:px-8 md:pt-28">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
          <Empty description="Không có dữ liệu thanh toán." />

          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/cart")}
            className="mt-5 !rounded-xl !bg-orange-500 hover:!bg-orange-600"
          >
            Quay lại giỏ hàng
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 pb-10 pt-24 md:px-8 md:pt-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-8 text-white shadow-sm md:px-8">
          <div className="flex items-center gap-3">
            <ShoppingCartOutlined className="text-3xl" />

            <div>
              <Title level={2} className="!mb-1 !text-white">
                Xác nhận thanh toán
              </Title>

              <Text className="!text-white/90">
                Chọn địa chỉ nhận hàng, phương thức thanh toán và tạo đơn hàng.
              </Text>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-6">
            <Card className="rounded-3xl border-0 shadow-sm">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <EnvironmentOutlined className="text-xl text-orange-500" />
                  <Title level={3} className="!mb-0">
                    Địa chỉ nhận hàng
                  </Title>
                </div>

                <Button
                  icon={<PlusOutlined />}
                  onClick={handleOpenAddressModal}
                  className="!rounded-xl"
                >
                  Thêm địa chỉ
                </Button>
              </div>

              {loading ? (
                <div className="py-10 text-center">
                  <Spin tip="Đang tải địa chỉ..." />
                </div>
              ) : addresses.length === 0 ? (
                <div className="rounded-2xl bg-orange-50 p-6 text-center">
                  <Paragraph className="text-gray-500">
                    Bạn chưa có địa chỉ nhận hàng.
                  </Paragraph>

                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleOpenAddressModal}
                    className="!rounded-xl !bg-orange-500 hover:!bg-orange-600"
                  >
                    Thêm địa chỉ mới
                  </Button>
                </div>
              ) : (
                <Radio.Group
                  value={selectedAddressId}
                  onChange={(event) => setSelectedAddressId(event.target.value)}
                  className="w-full"
                >
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`relative block cursor-pointer rounded-2xl border p-4 pr-14 transition ${
                          String(selectedAddressId) === String(address.id)
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-100 bg-white hover:border-orange-300"
                        }`}
                      >
                        <Radio value={address.id}>
                          <div className="ml-2">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <Text strong>{address.recipientName}</Text>
                              <Text type="secondary">
                                {address.recipientPhone}
                              </Text>

                              {address.isDefault && (
                                <Tag color="orange">Mặc định</Tag>
                              )}

                              {!address.isDefault && (
                                <Button
                                  type="link"
                                  size="small"
                                  icon={<CheckCircleOutlined />}
                                  loading={
                                    String(settingDefaultAddressId) ===
                                    String(address.id)
                                  }
                                  onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    handleSetDefaultAddress(address.id);
                                  }}
                                  className="!h-auto !p-0 !text-orange-600"
                                >
                                  Đặt mặc định
                                </Button>
                              )}
                            </div>

                            <Text className="text-gray-600">
                              {getAddressText(address)}
                            </Text>
                          </div>
                        </Radio>

                        <Popconfirm
                          title="Xóa địa chỉ này?"
                          description="Địa chỉ đã xóa sẽ không thể dùng cho đơn hàng mới."
                          okText="Xóa"
                          cancelText="Hủy"
                          okButtonProps={{ danger: true }}
                          onConfirm={(event) => {
                            event?.stopPropagation?.();
                            handleDeleteAddress(address.id);
                          }}
                          onCancel={(event) => event?.stopPropagation?.()}
                        >
                          <Button
                            danger
                            type="text"
                            icon={<DeleteOutlined />}
                            loading={
                              String(deletingAddressId) === String(address.id)
                            }
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                            }}
                            className="!absolute right-3 top-3"
                            aria-label="Xóa địa chỉ"
                          />
                        </Popconfirm>
                      </label>
                    ))}
                  </div>
                </Radio.Group>
              )}
            </Card>

            <Card className="rounded-3xl border-0 shadow-sm">
              <Title level={3}>Sản phẩm thanh toán</Title>

              <div className="mt-4 space-y-3">
                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-gray-100 bg-white p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <Text strong>{item.productName}</Text>

                        <div className="mt-1 text-sm text-gray-500">
                          SKU: {item.sku || "Không có"}
                        </div>

                        <div className="mt-1 text-sm text-gray-500">
                          Số lượng: {item.quantity}
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
              <Title level={3}>Phương thức thanh toán</Title>

              <Radio.Group
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                className="mt-3 w-full"
              >
                <div className="space-y-3">
                  <label className="block cursor-pointer rounded-2xl border border-gray-100 p-4 hover:border-orange-300">
                    <Radio value="COD">
                      Thanh toán khi nhận hàng{" "}
                      <Tag color="green" className="ml-2">
                        COD
                      </Tag>
                    </Radio>
                  </label>

                  <label className="block cursor-pointer rounded-2xl border border-gray-100 p-4 hover:border-orange-300">
                    <Radio value="SEPAY">
                      Thanh toán qua Sepay{" "}
                      <Tag color="blue" className="ml-2">
                        SEPAY
                      </Tag>
                    </Radio>
                  </label>

                  <label className="block cursor-pointer rounded-2xl border border-gray-100 p-4 hover:border-orange-300">
                    <Radio value="BANK_TRANSFER">
                      Chuyển khoản ngân hàng
                    </Radio>
                  </label>
                </div>
              </Radio.Group>
            </Card>
          </div>

          <div className="xl:sticky xl:top-28 xl:h-fit">
            <Card className="rounded-3xl border-0 shadow-sm">
              <Title level={3}>Tóm tắt thanh toán</Title>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <Text type="secondary">Số sản phẩm</Text>
                  <Text>{selectedItems.length}</Text>
                </div>

                <div className="flex justify-between">
                  <Text type="secondary">Tạm tính</Text>
                  <Text>{formatCurrency(subtotal)}</Text>
                </div>

                <div className="flex justify-between">
                  <Text type="secondary">Mã giảm giá</Text>
                  <Text>{checkoutDraft.couponCode || "Không áp dụng"}</Text>
                </div>

                <div className="flex justify-between">
                  <Text type="secondary">Giảm giá</Text>
                  <Text className="!text-green-600">
                    -{formatCurrency(discountAmount)}
                  </Text>
                </div>
              </div>

              <Divider />

              <div className="mb-5 flex items-center justify-between">
                <Text strong>Tổng thanh toán</Text>

                <Text className="text-2xl font-bold !text-orange-600">
                  {formatCurrency(finalAmount)}
                </Text>
              </div>

              {selectedAddress && (
                <div className="mb-5 rounded-2xl bg-orange-50 p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <CheckCircleOutlined className="text-green-500" />
                    <Text strong>Địa chỉ đã chọn</Text>
                  </div>

                  <Text className="text-sm text-gray-600">
                    {selectedAddress.recipientName} -{" "}
                    {selectedAddress.recipientPhone}
                  </Text>

                  <div className="mt-1 text-sm text-gray-500">
                    {getAddressText(selectedAddress)}
                  </div>
                </div>
              )}

              <Button
                type="primary"
                size="large"
                block
                loading={creatingOrder}
                disabled={!selectedAddressId}
                onClick={handleCreateOrder}
                className="!h-12 !rounded-xl !bg-orange-500 hover:!bg-orange-600"
              >
                Đặt hàng
              </Button>

              <Button
                block
                size="large"
                onClick={() => navigate("/cart")}
                className="mt-3 !h-12 !rounded-xl"
              >
                Quay lại giỏ hàng
              </Button>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        title="Thêm địa chỉ nhận hàng"
        open={addressModalOpen}
        onCancel={() => setAddressModalOpen(false)}
        onOk={handleCreateAddress}
        okText="Lưu địa chỉ"
        cancelText="Hủy"
        confirmLoading={creatingAddress}
        width={720}
      >
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Form.Item
              name="recipientName"
              label="Tên người nhận"
              rules={[
                { required: true, message: "Vui lòng nhập tên người nhận" },
              ]}
            >
              <Input placeholder="Nguyễn Văn A" />
            </Form.Item>

            <Form.Item
              name="recipientPhone"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
              ]}
            >
              <Input placeholder="09xxxxxxxx" />
            </Form.Item>
          </div>

          <Form.Item
            name="street"
            label="Địa chỉ cụ thể"
            rules={[
              { required: true, message: "Vui lòng nhập địa chỉ cụ thể" },
            ]}
          >
            <Input placeholder="Số nhà, tên đường..." />
          </Form.Item>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Form.Item
              name="ward"
              label="Phường/Xã"
              rules={[{ required: true, message: "Vui lòng nhập phường/xã" }]}
            >
              <Input placeholder="Phường/Xã" />
            </Form.Item>

            <Form.Item
              name="district"
              label="Quận/Huyện"
              rules={[{ required: true, message: "Vui lòng nhập quận/huyện" }]}
            >
              <Input placeholder="Quận/Huyện" />
            </Form.Item>

            <Form.Item
              name="province"
              label="Tỉnh/Thành phố"
              rules={[
                { required: true, message: "Vui lòng nhập tỉnh/thành phố" },
              ]}
            >
              <Input placeholder="Tỉnh/Thành phố" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Form.Item name="postalCode" label="Mã bưu chính">
              <Input placeholder="Có thể bỏ trống" />
            </Form.Item>

            <Form.Item name="country" label="Quốc gia">
              <Input placeholder="Việt Nam" />
            </Form.Item>

            <Form.Item name="addressType" label="Loại địa chỉ">
              <Radio.Group>
                <Radio value="HOME">Nhà riêng</Radio>
                <Radio value="OFFICE">Công ty</Radio>
              </Radio.Group>
            </Form.Item>
          </div>

          <Form.Item name="isDefault" label="Đặt làm mặc định">
            <Radio.Group>
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
