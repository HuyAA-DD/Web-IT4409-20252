import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  Divider,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  ShopOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);
};

/**
 * DTO_BACKEND_NOTE:
 * Backend ProductRequest:
 * {
 *   name,
 *   description,
 *   categoryId,
 *   sellerId,
 *   status,
 *   imageUrls,
 *   variants: [
 *     {
 *       sku,
 *       price,
 *       stock,
 *       attributes
 *     }
 *   ]
 * }
 *
 * Backend ProductResponse:
 * {
 *   id,
 *   name,
 *   description,
 *   categoryId,
 *   categoryName,
 *   sellerId,
 *   sellerName,
 *   status,
 *   imageUrls,
 *   variants,
 *   createdAt,
 *   updatedAt
 * }
 *
 * TODO_BACKEND:
 * Sau này thay mock data bằng:
 * GET /api/v1/products
 * POST /api/v1/products
 * PUT /api/v1/products/:id
 * DELETE /api/v1/products/:id
 */

const mockCategoryOptions = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Thời trang nam",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Giày dép",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Phụ kiện",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "Đồ công nghệ",
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    name: "Đồ gia dụng",
  },
];

const MOCK_SELLER_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const MOCK_SELLER_NAME = "MegaMart Admin";

const initialProducts = [
  {
    id: "p-001",
    name: "Áo thun basic nam form rộng",
    description: "Áo thun cotton basic, form rộng, dễ phối đồ.",
    categoryId: "11111111-1111-1111-1111-111111111111",
    categoryName: "Thời trang nam",
    sellerId: MOCK_SELLER_ID,
    sellerName: MOCK_SELLER_NAME,
    status: "ACTIVE",
    imageUrls: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    ],
    variants: [
      {
        id: "v-001",
        sku: "TSHIRT-BASIC-WHITE-M",
        price: 199000,
        stock: 120,
        attributes: {
          color: "Trắng",
          size: "M",
        },
      },
    ],
    createdAt: "2026-05-20T09:00:00",
    updatedAt: "2026-05-20T09:00:00",
  },
  {
    id: "p-002",
    name: "Giày sneaker trắng tối giản",
    description: "Giày sneaker trắng phong cách tối giản, phù hợp đi học, đi làm.",
    categoryId: "22222222-2222-2222-2222-222222222222",
    categoryName: "Giày dép",
    sellerId: MOCK_SELLER_ID,
    sellerName: MOCK_SELLER_NAME,
    status: "ACTIVE",
    imageUrls: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500",
    ],
    variants: [
      {
        id: "v-002",
        sku: "SNEAKER-WHITE-42",
        price: 799000,
        stock: 42,
        attributes: {
          color: "Trắng",
          size: "42",
        },
      },
    ],
    createdAt: "2026-05-20T09:00:00",
    updatedAt: "2026-05-20T09:00:00",
  },
  {
    id: "p-003",
    name: "Túi canvas đi học / đi làm",
    description: "Túi canvas rộng rãi, chất liệu bền, màu sắc trung tính.",
    categoryId: "33333333-3333-3333-3333-333333333333",
    categoryName: "Phụ kiện",
    sellerId: MOCK_SELLER_ID,
    sellerName: MOCK_SELLER_NAME,
    status: "INACTIVE",
    imageUrls: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500",
    ],
    variants: [
      {
        id: "v-003",
        sku: "BAG-CANVAS-BEIGE",
        price: 259000,
        stock: 0,
        attributes: {
          color: "Be",
          material: "Canvas",
        },
      },
    ],
    createdAt: "2026-05-20T09:00:00",
    updatedAt: "2026-05-20T09:00:00",
  },
  {
    id: "p-004",
    name: "Tai nghe bluetooth mini",
    description: "Tai nghe bluetooth nhỏ gọn, âm thanh ổn định.",
    categoryId: "44444444-4444-4444-4444-444444444444",
    categoryName: "Đồ công nghệ",
    sellerId: MOCK_SELLER_ID,
    sellerName: MOCK_SELLER_NAME,
    status: "ACTIVE",
    imageUrls: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    ],
    variants: [
      {
        id: "v-004",
        sku: "HEADPHONE-BT-BLACK",
        price: 395000,
        stock: 85,
        attributes: {
          color: "Đen",
          type: "Bluetooth",
        },
      },
    ],
    createdAt: "2026-05-20T09:00:00",
    updatedAt: "2026-05-20T09:00:00",
  },
  {
    id: "p-005",
    name: "Bình giữ nhiệt inox 500ml",
    description: "Bình giữ nhiệt inox dung tích 500ml, giữ nóng/lạnh tốt.",
    categoryId: "55555555-5555-5555-5555-555555555555",
    categoryName: "Đồ gia dụng",
    sellerId: MOCK_SELLER_ID,
    sellerName: MOCK_SELLER_NAME,
    status: "ACTIVE",
    imageUrls: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500",
    ],
    variants: [
      {
        id: "v-005",
        sku: "BOTTLE-INOX-500ML",
        price: 189000,
        stock: 66,
        attributes: {
          capacity: "500ml",
          material: "Inox",
        },
      },
    ],
    createdAt: "2026-05-20T09:00:00",
    updatedAt: "2026-05-20T09:00:00",
  },
];

const getMainVariant = (product) => {
  return product?.variants?.[0] || {
    sku: "",
    price: 0,
    stock: 0,
    attributes: {},
  };
};

const getMainImage = (product) => {
  return product?.imageUrls?.[0] || "https://via.placeholder.com/120x120?text=Product";
};

const ProductPage = () => {
  const [form] = Form.useForm();

  const [products, setProducts] = useState(initialProducts);
  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const mainVariant = getMainVariant(product);

      const matchKeyword =
        product.name.toLowerCase().includes(keyword.toLowerCase()) ||
        product.categoryName.toLowerCase().includes(keyword.toLowerCase()) ||
        mainVariant.sku.toLowerCase().includes(keyword.toLowerCase());

      const matchCategory =
        categoryFilter === "ALL" || product.categoryId === categoryFilter;

      const matchStatus =
        statusFilter === "ALL" || product.status === statusFilter;

      return matchKeyword && matchCategory && matchStatus;
    });
  }, [products, keyword, categoryFilter, statusFilter]);

  const totalProducts = products.length;
  const activeProducts = products.filter((item) => item.status === "ACTIVE").length;
  const inactiveProducts = products.filter((item) => item.status === "INACTIVE").length;
  const totalStock = products.reduce(
    (sum, item) => sum + getMainVariant(item).stock,
    0
  );

  const openCreateModal = () => {
    setEditingProduct(null);
    form.resetFields();
    form.setFieldsValue({
      categoryId: mockCategoryOptions[0].id,
      sellerId: MOCK_SELLER_ID,
      status: "ACTIVE",
      imageUrl: "",
      sku: "",
      price: 0,
      stock: 0,
      color: "",
      size: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    const mainVariant = getMainVariant(record);

    setEditingProduct(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      categoryId: record.categoryId,
      sellerId: record.sellerId,
      status: record.status,
      imageUrl: getMainImage(record),
      sku: mainVariant.sku,
      price: mainVariant.price,
      stock: mainVariant.stock,
      color: mainVariant.attributes?.color || "",
      size: mainVariant.attributes?.size || "",
    });
    setModalOpen(true);
  };

  const openViewModal = (record) => {
    setViewingProduct(record);
    setViewModalOpen(true);
  };

  const buildProductPayload = (values) => {
    const selectedCategory = mockCategoryOptions.find(
      (category) => category.id === values.categoryId
    );

    return {
      name: values.name,
      description: values.description || "",
      categoryId: values.categoryId,
      categoryName: selectedCategory?.name || "",
      sellerId: values.sellerId || MOCK_SELLER_ID,
      sellerName: MOCK_SELLER_NAME,
      status: values.status,
      imageUrls: values.imageUrl ? [values.imageUrl] : [],
      variants: [
        {
          id: editingProduct?.variants?.[0]?.id || `v-${Date.now()}`,
          sku: values.sku,
          price: Number(values.price),
          stock: Number(values.stock),
          attributes: {
            color: values.color || "",
            size: values.size || "",
          },
        },
      ],
    };
  };

  const handleSubmitProduct = async () => {
    try {
      const values = await form.validateFields();
      const productPayload = buildProductPayload(values);

      if (editingProduct) {
        /**
         * TODO_BACKEND:
         * await productApi.updateProduct(editingProduct.id, {
         *   name: productPayload.name,
         *   description: productPayload.description,
         *   categoryId: productPayload.categoryId,
         *   sellerId: productPayload.sellerId,
         *   status: productPayload.status,
         *   imageUrls: productPayload.imageUrls,
         *   variants: productPayload.variants.map(({ sku, price, stock, attributes }) => ({
         *     sku,
         *     price,
         *     stock,
         *     attributes,
         *   })),
         * });
         * await fetchProducts();
         */
        setProducts((prev) =>
          prev.map((product) =>
            product.id === editingProduct.id
              ? {
                  ...product,
                  ...productPayload,
                  updatedAt: new Date().toISOString(),
                }
              : product
          )
        );

        message.success("Cập nhật sản phẩm thành công.");
      } else {
        /**
         * TODO_BACKEND:
         * await productApi.createProduct({
         *   name: productPayload.name,
         *   description: productPayload.description,
         *   categoryId: productPayload.categoryId,
         *   sellerId: productPayload.sellerId,
         *   status: productPayload.status,
         *   imageUrls: productPayload.imageUrls,
         *   variants: productPayload.variants.map(({ sku, price, stock, attributes }) => ({
         *     sku,
         *     price,
         *     stock,
         *     attributes,
         *   })),
         * });
         * await fetchProducts();
         */
        const newProduct = {
          id: `p-${Date.now()}`,
          ...productPayload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setProducts((prev) => [newProduct, ...prev]);
        message.success("Thêm sản phẩm thành công.");
      }

      setModalOpen(false);
      form.resetFields();
      setEditingProduct(null);
    } catch (error) {
      message.warning("Vui lòng kiểm tra lại thông tin sản phẩm.");
    }
  };

  const handleDeleteProduct = (id) => {
    /**
     * TODO_BACKEND:
     * await productApi.deleteProduct(id);
     * await fetchProducts();
     */
    setProducts((prev) => prev.filter((product) => product.id !== id));
    message.success("Đã xóa sản phẩm khỏi danh sách.");
  };

  const getStockTag = (stock) => {
    if (stock === 0) return <Tag color="red">Hết hàng</Tag>;
    if (stock <= 20) return <Tag color="orange">Sắp hết</Tag>;
    return <Tag color="green">Còn hàng</Tag>;
  };

  const getStatusTag = (status) => {
    if (status === "ACTIVE") return <Tag color="green">ACTIVE</Tag>;
    return <Tag color="default">INACTIVE</Tag>;
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      width: 330,
      render: (_, record) => {
        const mainVariant = getMainVariant(record);

        return (
          <div className="flex items-center gap-3">
            <Image
              width={56}
              height={56}
              src={getMainImage(record)}
              alt={record.name}
              className="rounded-xl object-cover"
              fallback="https://via.placeholder.com/120x120?text=Product"
            />

            <div className="min-w-0">
              <div className="line-clamp-1 font-semibold text-gray-800">
                {record.name}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                SKU: {mainVariant.sku}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Danh mục",
      dataIndex: "categoryName",
      key: "categoryName",
      width: 150,
      render: (value) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: "Giá",
      key: "price",
      width: 135,
      render: (_, record) => (
        <span className="font-semibold text-orange-600">
          {formatCurrency(getMainVariant(record).price)}
        </span>
      ),
      sorter: (a, b) => getMainVariant(a).price - getMainVariant(b).price,
    },
    {
      title: "Tồn kho",
      key: "stock",
      width: 120,
      render: (_, record) => {
        const stock = getMainVariant(record).stock;

        return (
          <div className="space-y-1">
            <div className="font-semibold">{stock}</div>
            {getStockTag(stock)}
          </div>
        );
      },
      sorter: (a, b) => getMainVariant(a).stock - getMainVariant(b).stock,
    },
    {
      title: "Người bán",
      dataIndex: "sellerName",
      key: "sellerName",
      width: 150,
      render: (value) => <span className="text-gray-700">{value}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: getStatusTag,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 145,
      render: (_, record) => (
        <Space size={8}>
          <Button icon={<EyeOutlined />} onClick={() => openViewModal(record)} />
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} />

          <Popconfirm
            title="Xóa sản phẩm?"
            description="Bạn có chắc muốn xóa sản phẩm này?"
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDeleteProduct(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-5 py-6">
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Title level={2} className="!mb-1 !text-[32px]">
              Quản lý sản phẩm
            </Title>

            <Text type="secondary">
              Dựng UI theo ProductRequest, ProductResponse và ProductVariant DTO của backend.
            </Text>
          </div>

          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
            className="!h-11 !rounded-xl !bg-orange-500 !px-5 hover:!bg-orange-600"
          >
            Thêm sản phẩm
          </Button>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-2xl border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Tổng sản phẩm</div>
                <div className="mt-1 text-2xl font-bold">{totalProducts}</div>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-xl text-orange-600">
                <ShopOutlined />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-0 shadow-sm">
            <div className="text-sm text-gray-500">Đang bán</div>
            <div className="mt-1 text-2xl font-bold text-green-600">
              {activeProducts}
            </div>
          </Card>

          <Card className="rounded-2xl border-0 shadow-sm">
            <div className="text-sm text-gray-500">Đã ẩn</div>
            <div className="mt-1 text-2xl font-bold text-gray-600">
              {inactiveProducts}
            </div>
          </Card>

          <Card className="rounded-2xl border-0 shadow-sm">
            <div className="text-sm text-gray-500">Tổng tồn kho</div>
            <div className="mt-1 text-2xl font-bold text-blue-600">
              {totalStock}
            </div>
          </Card>
        </div>

        <Card className="rounded-2xl border-0 shadow-sm">
          <div className="mb-5 grid grid-cols-1 gap-3 xl:grid-cols-12">
            <Input
              size="large"
              placeholder="Tìm theo tên, danh mục hoặc SKU..."
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="xl:col-span-6"
            />

            <Select
              size="large"
              value={categoryFilter}
              onChange={setCategoryFilter}
              className="xl:col-span-3"
              options={[
                { label: "Tất cả danh mục", value: "ALL" },
                ...mockCategoryOptions.map((category) => ({
                  label: category.name,
                  value: category.id,
                })),
              ]}
            />

            <Select
              size="large"
              value={statusFilter}
              onChange={setStatusFilter}
              className="xl:col-span-3"
              options={[
                { label: "Tất cả trạng thái", value: "ALL" },
                { label: "ACTIVE", value: "ACTIVE" },
                { label: "INACTIVE", value: "INACTIVE" },
              ]}
            />
          </div>

          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredProducts}
            pagination={{
              pageSize: 5,
              showSizeChanger: false,
              showTotal: (total) => `Tổng ${total} sản phẩm`,
            }}
            scroll={{ x: 1150 }}
          />
        </Card>

        <Modal
          title={editingProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
          open={modalOpen}
          onCancel={() => {
            setModalOpen(false);
            setEditingProduct(null);
            form.resetFields();
          }}
          onOk={handleSubmitProduct}
          okText={editingProduct ? "Cập nhật" : "Thêm mới"}
          cancelText="Hủy"
          width={820}
        >
          <Form form={form} layout="vertical" className="mt-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Form.Item
                label="Tên sản phẩm"
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên sản phẩm." },
                  { max: 200, message: "Tên sản phẩm tối đa 200 ký tự." },
                ]}
              >
                <Input placeholder="Nhập tên sản phẩm" />
              </Form.Item>

              <Form.Item
                label="Trạng thái"
                name="status"
                rules={[{ required: true, message: "Vui lòng chọn trạng thái." }]}
              >
                <Select
                  options={[
                    { label: "ACTIVE", value: "ACTIVE" },
                    { label: "INACTIVE", value: "INACTIVE" },
                  ]}
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Form.Item
                label="Danh mục"
                name="categoryId"
                rules={[{ required: true, message: "Vui lòng chọn danh mục." }]}
              >
                <Select
                  options={mockCategoryOptions.map((category) => ({
                    label: category.name,
                    value: category.id,
                  }))}
                />
              </Form.Item>

              <Form.Item
                label="Seller ID"
                name="sellerId"
                rules={[{ required: true, message: "Seller ID là bắt buộc theo ProductRequest." }]}
              >
                <Input placeholder="UUID người bán" />
              </Form.Item>
            </div>

            <Form.Item label="Mô tả" name="description">
              <Input.TextArea rows={3} placeholder="Nhập mô tả sản phẩm" />
            </Form.Item>

            <Form.Item
              label="Image URL đầu tiên"
              name="imageUrl"
              rules={[{ required: true, message: "Vui lòng nhập URL ảnh." }]}
            >
              <Input placeholder="https://..." />
            </Form.Item>

            <Divider orientation="left">Variant đầu tiên</Divider>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Form.Item
                label="SKU"
                name="sku"
                rules={[
                  { required: true, message: "SKU là bắt buộc." },
                  { max: 100, message: "SKU tối đa 100 ký tự." },
                ]}
              >
                <Input placeholder="VD: TSHIRT-WHITE-M" />
              </Form.Item>

              <Form.Item
                label="Giá"
                name="price"
                rules={[{ required: true, message: "Giá là bắt buộc." }]}
              >
                <InputNumber min={1} className="!w-full" placeholder="Nhập giá" />
              </Form.Item>

              <Form.Item
                label="Tồn kho"
                name="stock"
                rules={[{ required: true, message: "Tồn kho là bắt buộc." }]}
              >
                <InputNumber min={0} className="!w-full" placeholder="Nhập tồn kho" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Form.Item label="Màu sắc" name="color">
                <Input placeholder="VD: Trắng" />
              </Form.Item>

              <Form.Item label="Kích cỡ" name="size">
                <Input placeholder="VD: M / 42 / 500ml" />
              </Form.Item>
            </div>
          </Form>
        </Modal>

        <Modal
          title="Chi tiết sản phẩm"
          open={viewModalOpen}
          onCancel={() => {
            setViewModalOpen(false);
            setViewingProduct(null);
          }}
          footer={[
            <Button
              key="close"
              onClick={() => {
                setViewModalOpen(false);
                setViewingProduct(null);
              }}
            >
              Đóng
            </Button>,
          ]}
          width={760}
        >
          {viewingProduct && (
            <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
              <div>
                <Image
                  src={getMainImage(viewingProduct)}
                  alt={viewingProduct.name}
                  className="rounded-2xl object-cover"
                  fallback="https://via.placeholder.com/300x300?text=Product"
                />
              </div>

              <div className="md:col-span-2">
                <Title level={4} className="!mb-2">
                  {viewingProduct.name}
                </Title>

                <Space wrap className="mb-3">
                  <Tag color="blue">{viewingProduct.categoryName}</Tag>
                  {getStatusTag(viewingProduct.status)}
                  {getStockTag(getMainVariant(viewingProduct).stock)}
                </Space>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Product ID: </span>
                    <span className="font-medium">{viewingProduct.id}</span>
                  </div>

                  <div>
                    <span className="text-gray-500">Seller: </span>
                    <span className="font-medium">{viewingProduct.sellerName}</span>
                  </div>

                  <div>
                    <span className="text-gray-500">SKU: </span>
                    <span className="font-medium">
                      {getMainVariant(viewingProduct).sku}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500">Giá: </span>
                    <span className="font-semibold text-orange-600">
                      {formatCurrency(getMainVariant(viewingProduct).price)}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500">Tồn kho: </span>
                    <span className="font-medium">
                      {getMainVariant(viewingProduct).stock}
                    </span>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                  {viewingProduct.description || "Chưa có mô tả sản phẩm."}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ProductPage;