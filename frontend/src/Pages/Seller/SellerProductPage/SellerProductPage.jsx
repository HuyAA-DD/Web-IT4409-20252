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

// --- MOCK DATA ---
const mockCategoryOptions = [
  { id: "11111111-1111-1111-1111-111111111111", name: "Thời trang nam" },
  { id: "22222222-2222-2222-2222-222222222222", name: "Giày dép" },
  { id: "33333333-3333-3333-3333-333333333333", name: "Phụ kiện" },
  { id: "44444444-4444-4444-4444-444444444444", name: "Đồ công nghệ" },
  { id: "55555555-5555-5555-5555-555555555555", name: "Đồ gia dụng" },
];

// Giả lập ID của Seller đang đăng nhập (Lấy từ Context/Redux trong thực tế)
const CURRENT_SELLER_ID = "s-1000000-0000-0000-0000-000000000001";

const initialProducts = [
  {
    id: "p-001",
    name: "Áo thun basic nam form rộng",
    description: "Áo thun cotton basic, form rộng, dễ phối đồ.",
    categoryId: "11111111-1111-1111-1111-111111111111",
    categoryName: "Thời trang nam",
    sellerId: CURRENT_SELLER_ID,
    sellerName: "ProTech Store",
    status: "ACTIVE",
    imageUrls: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"],
    variants: [
      {
        id: "v-001",
        sku: "TSHIRT-BASIC-WHITE-M",
        price: 199000,
        stock: 120,
        attributes: { color: "Trắng", size: "M" },
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
    sellerId: CURRENT_SELLER_ID,
    sellerName: "ProTech Store",
    status: "INACTIVE",
    imageUrls: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"],
    variants: [
      {
        id: "v-004",
        sku: "HEADPHONE-BT-BLACK",
        price: 395000,
        stock: 0,
        attributes: { color: "Đen", type: "Bluetooth" },
      },
    ],
    createdAt: "2026-05-20T09:00:00",
    updatedAt: "2026-05-20T09:00:00",
  },
];

const getMainVariant = (product) => {
  return product?.variants?.[0] || { sku: "", price: 0, stock: 0, attributes: {} };
};

const getMainImage = (product) => {
  return product?.imageUrls?.[0] || "https://via.placeholder.com/120x120?text=Product";
};

const SellerProductPage = () => {
  const [form] = Form.useForm();

  const [products, setProducts] = useState(initialProducts);
  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);

  // --- LỌC DỮ LIỆU ---
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const mainVariant = getMainVariant(product);
      const matchKeyword =
        product.name.toLowerCase().includes(keyword.toLowerCase()) ||
        product.categoryName.toLowerCase().includes(keyword.toLowerCase()) ||
        mainVariant.sku.toLowerCase().includes(keyword.toLowerCase());

      const matchCategory = categoryFilter === "ALL" || product.categoryId === categoryFilter;
      const matchStatus = statusFilter === "ALL" || product.status === statusFilter;

      return matchKeyword && matchCategory && matchStatus;
    });
  }, [products, keyword, categoryFilter, statusFilter]);

  // --- THỐNG KÊ ---
  const totalProducts = products.length;
  const activeProducts = products.filter((item) => item.status === "ACTIVE").length;
  const outOfStockProducts = products.filter((item) => getMainVariant(item).stock === 0).length;
  const totalStock = products.reduce((sum, item) => sum + getMainVariant(item).stock, 0);

  // --- HANDLERS MODAL ---
  const openCreateModal = () => {
    setEditingProduct(null);
    form.resetFields();
    form.setFieldsValue({
      categoryId: mockCategoryOptions[0].id,
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

  // --- XỬ LÝ SUBMIT (Tạo payload theo đúng ProductRequest DTO) ---
  const buildProductPayload = (values) => {
    const selectedCategory = mockCategoryOptions.find((cat) => cat.id === values.categoryId);

    return {
      name: values.name,
      description: values.description || "",
      categoryId: values.categoryId,
      categoryName: selectedCategory?.name || "",
      // Tự động gán SellerID của người dùng hiện tại
      sellerId: CURRENT_SELLER_ID, 
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
        // TODO_BACKEND: axios.put(`/api/v1/products/${editingProduct.id}`, productPayload)
        setProducts((prev) =>
          prev.map((product) =>
            product.id === editingProduct.id
              ? { ...product, ...productPayload, updatedAt: new Date().toISOString() }
              : product
          )
        );
        message.success("Cập nhật sản phẩm thành công.");
      } else {
        // TODO_BACKEND: axios.post('/api/v1/products', productPayload)
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
    // TODO_BACKEND: axios.delete(`/api/v1/products/${id}`)
    setProducts((prev) => prev.filter((product) => product.id !== id));
    message.success("Đã xóa sản phẩm khỏi gian hàng.");
  };

  // --- UI HELPERS ---
  const getStockTag = (stock) => {
    if (stock === 0) return <Tag color="red">Hết hàng</Tag>;
    if (stock <= 20) return <Tag color="orange">Sắp hết</Tag>;
    return <Tag color="green">Còn hàng</Tag>;
  };

  const getStatusTag = (status) => {
    if (status === "ACTIVE") return <Tag color="blue">ĐANG BÁN</Tag>;
    return <Tag color="default">ĐÃ ẨN</Tag>;
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      width: 350,
      render: (_, record) => {
        const mainVariant = getMainVariant(record);
        return (
          <div className="flex items-center gap-3">
            <Image
              width={56}
              height={56}
              src={getMainImage(record)}
              alt={record.name}
              className="rounded-xl object-cover border border-gray-100"
              fallback="https://via.placeholder.com/120x120?text=Product"
            />
            <div className="min-w-0">
              <div className="line-clamp-1 font-bold text-gray-800 hover:text-blue-600 transition-colors cursor-pointer" onClick={() => openViewModal(record)}>
                {record.name}
              </div>
              <div className="mt-1 text-xs text-gray-500 font-mono">
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
      render: (value) => <span className="text-gray-600 font-medium">{value}</span>,
    },
    {
      title: "Giá bán",
      key: "price",
      width: 135,
      render: (_, record) => (
        <span className="font-bold text-blue-600">
          {formatCurrency(getMainVariant(record).price)}
        </span>
      ),
      sorter: (a, b) => getMainVariant(a).price - getMainVariant(b).price,
    },
    {
      title: "Kho",
      key: "stock",
      width: 120,
      render: (_, record) => {
        const stock = getMainVariant(record).stock;
        return (
          <div className="space-y-1">
            <div className="font-bold text-gray-700">{stock}</div>
            {getStockTag(stock)}
          </div>
        );
      },
      sorter: (a, b) => getMainVariant(a).stock - getMainVariant(b).stock,
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
      width: 120,
      render: (_, record) => (
        <Space size={8}>
          <Button type="text" className="text-blue-600 bg-blue-50 hover:bg-blue-100" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Popconfirm
            title="Xóa sản phẩm?"
            description="Bạn có chắc muốn xóa vĩnh viễn sản phẩm này?"
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDeleteProduct(record.id)}
          >
            <Button type="text" danger className="bg-red-50 hover:bg-red-100" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-2 md:px-5 py-6 animate-fade-in">
      <div className="mx-auto w-full max-w-[1200px]">
        
        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Title level={2} className="!mb-1 !text-2xl font-black text-gray-800">
              Sản phẩm của tôi
            </Title>
            <Text className="text-gray-500">
              Quản lý danh sách sản phẩm, giá bán và tồn kho trên gian hàng của bạn.
            </Text>
          </div>

          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
            className="!h-11 !rounded-xl !bg-blue-600 !px-5 hover:!bg-blue-700 shadow-sm font-bold"
          >
            Thêm sản phẩm mới
          </Button>
        </div>

        {/* THỐNG KÊ (KPI CARDS) */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Tổng sản phẩm</div>
                <div className="mt-1 text-3xl font-black text-gray-800">{totalProducts}</div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl text-blue-600">
                <ShopOutlined />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Đang mở bán</div>
            <div className="mt-1 text-3xl font-black text-blue-600">
              {activeProducts}
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Hết hàng</div>
            <div className="mt-1 text-3xl font-black text-red-500">
              {outOfStockProducts}
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-100 shadow-sm bg-gradient-to-br from-blue-600 to-blue-800">
            <div className="text-sm font-bold text-blue-100 uppercase tracking-wider">Tổng tồn kho</div>
            <div className="mt-1 text-3xl font-black text-white">
              {totalStock}
            </div>
          </Card>
        </div>

        {/* BẢNG DỮ LIỆU & BỘ LỌC */}
        <Card className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-12 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            <Input
              size="large"
              placeholder="Tìm theo tên sản phẩm hoặc mã SKU..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="xl:col-span-6 rounded-lg"
            />

            <Select
              size="large"
              value={categoryFilter}
              onChange={setCategoryFilter}
              className="xl:col-span-3 rounded-lg"
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
              className="xl:col-span-3 rounded-lg"
              options={[
                { label: "Tất cả trạng thái", value: "ALL" },
                { label: "Đang bán (ACTIVE)", value: "ACTIVE" },
                { label: "Đã ẩn (INACTIVE)", value: "INACTIVE" },
              ]}
            />
          </div>

          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredProducts}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showTotal: (total) => <span className="font-medium text-gray-500">Tổng cộng {total} sản phẩm</span>,
            }}
            scroll={{ x: 1000 }}
            className="seller-product-table"
          />
        </Card>

        {/* MODAL TẠO/SỬA SẢN PHẨM */}
        <Modal
          title={<span className="text-lg font-black text-gray-800">{editingProduct ? "Cập nhật sản phẩm" : "Đăng sản phẩm mới"}</span>}
          open={modalOpen}
          onCancel={() => {
            setModalOpen(false);
            setEditingProduct(null);
            form.resetFields();
          }}
          onOk={handleSubmitProduct}
          okText={editingProduct ? "Lưu thay đổi" : "Đăng bán"}
          cancelText="Hủy"
          width={800}
          okButtonProps={{ className: "bg-blue-600 hover:bg-blue-700 font-bold rounded-lg" }}
          cancelButtonProps={{ className: "font-bold rounded-lg" }}
        >
          <Form form={form} layout="vertical" className="mt-6">
            <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 mb-6">
              <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-2"><ShopOutlined /> Thông tin cơ bản</h4>
              <div className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2">
                <Form.Item
                  label={<span className="font-medium text-gray-700">Tên sản phẩm</span>}
                  name="name"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên sản phẩm." },
                    { max: 200, message: "Tên sản phẩm tối đa 200 ký tự." },
                  ]}
                  className="md:col-span-2"
                >
                  <Input size="large" placeholder="Nhập tên sản phẩm (VD: Áo thun nam cổ tròn)" className="rounded-lg" />
                </Form.Item>

                <Form.Item
                  label={<span className="font-medium text-gray-700">Danh mục ngành hàng</span>}
                  name="categoryId"
                  rules={[{ required: true, message: "Vui lòng chọn danh mục." }]}
                >
                  <Select
                    size="large"
                    className="rounded-lg"
                    options={mockCategoryOptions.map((category) => ({
                      label: category.name,
                      value: category.id,
                    }))}
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="font-medium text-gray-700">Trạng thái hiển thị</span>}
                  name="status"
                  rules={[{ required: true, message: "Vui lòng chọn trạng thái." }]}
                >
                  <Select
                    size="large"
                    className="rounded-lg"
                    options={[
                      { label: "Đăng bán (ACTIVE)", value: "ACTIVE" },
                      { label: "Ẩn sản phẩm (INACTIVE)", value: "INACTIVE" },
                    ]}
                  />
                </Form.Item>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-12">
              <div className="md:col-span-4">
                <Form.Item
                  label={<span className="font-medium text-gray-700">Ảnh sản phẩm (URL)</span>}
                  name="imageUrl"
                  rules={[{ required: true, message: "Vui lòng nhập URL ảnh." }]}
                >
                  <Input placeholder="https://..." className="rounded-lg" />
                </Form.Item>
                <div className="w-full aspect-square bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 overflow-hidden">
                  <Form.Item noStyle shouldUpdate={(prev, cur) => prev.imageUrl !== cur.imageUrl}>
                    {() => {
                      const url = form.getFieldValue("imageUrl");
                      return url ? (
                        <img src={url} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <ShopOutlined className="text-3xl mb-2 opacity-50" />
                          <span className="text-xs font-medium">Ảnh xem trước</span>
                        </>
                      );
                    }}
                  </Form.Item>
                </div>
              </div>

              <div className="md:col-span-8">
                <Form.Item 
                  label={<span className="font-medium text-gray-700">Mô tả chi tiết</span>} 
                  name="description"
                >
                  <Input.TextArea rows={9} placeholder="Mô tả chi tiết công dụng, chất liệu, hướng dẫn sử dụng..." className="rounded-xl p-4" />
                </Form.Item>
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-800 mb-4">Thông tin bán hàng (Phân loại gốc)</h4>
              <div className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-3">
                <Form.Item
                  label={<span className="font-medium text-gray-700">Mã SKU</span>}
                  name="sku"
                  rules={[
                    { required: true, message: "SKU là bắt buộc." },
                    { max: 100, message: "SKU tối đa 100 ký tự." },
                  ]}
                >
                  <Input placeholder="Mã quản lý kho" className="rounded-lg" />
                </Form.Item>

                <Form.Item
                  label={<span className="font-medium text-gray-700">Giá bán (VNĐ)</span>}
                  name="price"
                  rules={[{ required: true, message: "Giá là bắt buộc." }]}
                >
                  <InputNumber min={1} className="!w-full rounded-lg" placeholder="Nhập giá" formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(value) => value.replace(/\$\s?|(,*)/g, '')} />
                </Form.Item>

                <Form.Item
                  label={<span className="font-medium text-gray-700">Số lượng kho</span>}
                  name="stock"
                  rules={[{ required: true, message: "Tồn kho là bắt buộc." }]}
                >
                  <InputNumber min={0} className="!w-full rounded-lg" placeholder="Tồn kho" />
                </Form.Item>

                <Form.Item label={<span className="text-gray-500">Màu sắc (Tùy chọn)</span>} name="color">
                  <Input placeholder="VD: Trắng" className="rounded-lg" />
                </Form.Item>

                <Form.Item label={<span className="text-gray-500">Kích cỡ (Tùy chọn)</span>} name="size">
                  <Input placeholder="VD: M / 42 / 500ml" className="rounded-lg" />
                </Form.Item>
              </div>
            </div>
          </Form>
        </Modal>

        {/* MODAL VIEW CHI TIẾT */}
        <Modal
          title={<span className="text-lg font-black text-gray-800">Chi tiết sản phẩm</span>}
          open={viewModalOpen}
          onCancel={() => {
            setViewModalOpen(false);
            setViewingProduct(null);
          }}
          footer={[
            <Button key="close" onClick={() => setViewModalOpen(false)} className="rounded-lg font-bold">
              Đóng
            </Button>
          ]}
          width={700}
        >
          {viewingProduct && (
            <div className="mt-4 flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3 shrink-0">
                <Image
                  src={getMainImage(viewingProduct)}
                  alt={viewingProduct.name}
                  className="rounded-2xl object-cover border border-gray-100 w-full aspect-square"
                  fallback="https://via.placeholder.com/300x300?text=Product"
                />
              </div>

              <div className="flex-1">
                <Title level={4} className="!mb-2 font-black text-gray-800">
                  {viewingProduct.name}
                </Title>
                <div className="text-2xl font-black text-blue-600 mb-3">
                  {formatCurrency(getMainVariant(viewingProduct).price)}
                </div>

                <Space wrap className="mb-5 border-b border-gray-100 pb-5 w-full">
                  <Tag color="blue">{viewingProduct.categoryName}</Tag>
                  {getStatusTag(viewingProduct.status)}
                  {getStockTag(getMainVariant(viewingProduct).stock)}
                </Space>

                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <div className="text-gray-500 mb-1">Mã SKU</div>
                    <div className="font-bold text-gray-800 font-mono">{getMainVariant(viewingProduct).sku}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Tồn kho hiện tại</div>
                    <div className="font-bold text-gray-800">{getMainVariant(viewingProduct).stock} sản phẩm</div>
                  </div>
                  {(getMainVariant(viewingProduct).attributes?.color || getMainVariant(viewingProduct).attributes?.size) && (
                    <div className="col-span-2 flex gap-4 pt-3 border-t border-gray-200">
                      {getMainVariant(viewingProduct).attributes?.color && (
                        <div><span className="text-gray-500">Màu:</span> <span className="font-bold">{getMainVariant(viewingProduct).attributes.color}</span></div>
                      )}
                      {getMainVariant(viewingProduct).attributes?.size && (
                        <div><span className="text-gray-500">Size:</span> <span className="font-bold">{getMainVariant(viewingProduct).attributes.size}</span></div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <div className="font-bold text-gray-800 mb-2">Mô tả sản phẩm</div>
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {viewingProduct.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default SellerProductPage;