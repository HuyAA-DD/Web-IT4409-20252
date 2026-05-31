import React, { useEffect, useMemo, useState } from "react";
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
  Upload,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import api from "../../../Apis/apiConfig";
import API_ENDPOINTS from "../../../Apis/apiEndpoints";
import { getAuthUser } from "../../../Utils/Auth";

const { Title, Text } = Typography;

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);
};

const getMainVariant = (product) => {
  return product?.variants?.[0] || { sku: "", price: 0, stock: 0, attributes: {} };
};

const getMainImage = (product) => {
  return product?.imageUrls?.[0] || "https://via.placeholder.com/120x120?text=Product";
};

// Hàm hỗ trợ chuyển đổi file Upload sang Base64 để xem trước
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

// Hàm chuẩn hóa giá trị của Upload component trong Form Antd
const normFile = (e) => {
  if (Array.isArray(e)) return e;
  return e?.fileList;
};

const SellerProductPage = () => {
  const [form] = Form.useForm();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);

  // States hỗ trợ upload ảnh
  const [previewImage, setPreviewImage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const currentUser = getAuthUser();
  const sellerId = currentUser?.id;

  useEffect(() => {
    if (!sellerId) return;

    const loadSellerData = async () => {
      setIsLoading(true);
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          api.get(API_ENDPOINTS.products.filter, { sellerId }),
          api.get(API_ENDPOINTS.categories.list),
        ]);

        const fetchedProducts = productsResponse?.data || productsResponse || [];
        const fetchedCategories = categoriesResponse?.data || categoriesResponse || [];

        setProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
        setCategories(Array.isArray(fetchedCategories) ? fetchedCategories : []);
      } catch (error) {
        console.error("Lỗi tải dữ liệu sản phẩm hoặc danh mục", error);
        message.error("Không thể tải dữ liệu sản phẩm hoặc danh mục.");
      } finally {
        setIsLoading(false);
      }
    };

    loadSellerData();
  }, [sellerId]);

  const categoryOptions = useMemo(() => {
    return categories.map((category) => ({
      label: category.name,
      value: category.id,
    }));
  }, [categories]);

  // --- LỌC DỮ LIỆU ---
  const filteredProducts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return products.filter((product) => {
      const matchKeyword =
        !normalizedKeyword ||
        product.name.toLowerCase().includes(normalizedKeyword) ||
        product.categoryName?.toLowerCase().includes(normalizedKeyword) ||
        product.variants?.some((v) => v.sku.toLowerCase().includes(normalizedKeyword));

      const matchCategory = categoryFilter === "ALL" || product.categoryId === categoryFilter;
      const matchStatus = statusFilter === "ALL" || product.status === statusFilter;

      return matchKeyword && matchCategory && matchStatus;
    });
  }, [products, keyword, categoryFilter, statusFilter]);

  // --- THỐNG KÊ ---
  const totalProducts = products.length;
  const activeProducts = products.filter((item) => item.status === "ACTIVE").length;
  const outOfStockProducts = products.filter((item) => getMainVariant(item).stock === 0).length;
  const totalStock = products.reduce((sum, item) => sum + (item.variants?.reduce((vSum, v) => vSum + v.stock, 0) || 0), 0);

  // --- HANDLERS MODAL THÊM / SỬA ---
  const openCreateModal = () => {
    setEditingProduct(null);
    form.resetFields();
    form.setFieldsValue({
      categoryId: categories[0]?.id,
      status: "ACTIVE",
      description: "",
      imageUrls: [],
      // Cấu hình ít nhất 1 variant rỗng
      variants: [{ sku: "", price: null, stock: 0, color: "", size: "" }],
    });
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingProduct(record);
    
    // Ánh xạ imageUrls string sang mảng objects cho Upload Antd
    const initialFileList = record.imageUrls?.map((url, idx) => ({
      uid: `-${idx}`,
      name: `image-${idx}.png`,
      status: 'done',
      url: url,
    })) || [];

    // Ánh xạ variants từ backend sang dạng dẹp cho form
    const initialVariants = record.variants?.map(v => ({
      sku: v.sku,
      price: v.price,
      stock: v.stock,
      color: v.attributes?.color || "",
      size: v.attributes?.size || "",
    })) || [];

    form.setFieldsValue({
      name: record.name,
      description: record.description,
      categoryId: record.categoryId,
      status: record.status,
      imageUrls: initialFileList,
      variants: initialVariants.length > 0 ? initialVariants : [{ sku: "", price: null, stock: 0, color: "", size: "" }],
    });
    setModalOpen(true);
  };

  const openViewModal = (record) => {
    setViewingProduct(record);
    setViewModalOpen(true);
  };

  // --- LOGIC UPLOAD ẢNH ---
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const uploadImageFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file.originFileObj);
    // Lưu ý: Đảm bảo Seller có quyền gọi endpoint upload image này (giống Admin)
    const uploadResponse = await api.postFormData(API_ENDPOINTS.upload.image, formData);
    return uploadResponse?.data?.url || uploadResponse?.url || null;
  };

  const uploadImageUrls = async (fileList) => {
    const uploadPromises = fileList
      .filter((file) => !file.url && file.originFileObj)
      .map(uploadImageFile);

    const urls = await Promise.all(uploadPromises);
    return urls.filter(Boolean);
  };

  // --- XỬ LÝ SUBMIT (Tạo payload theo đúng ProductRequest DTO) ---
  const handleSubmitProduct = async () => {
    try {
      const values = await form.validateFields();

      // Lọc các ảnh đã có url sẵn (không cần upload lại)
      const existingUrls = (values.imageUrls || [])
        .filter((file) => file.url)
        .map((file) => file.url);

      // Upload các ảnh mới và gom link lại
      const uploadedUrls = await uploadImageUrls(values.imageUrls || []);
      const finalImageUrls = [...existingUrls, ...uploadedUrls];

      // Map biến thể
      const mappedVariants = values.variants.map((v) => ({
        sku: v.sku.trim(),
        price: Number(v.price),
        stock: Number(v.stock),
        attributes: {
          color: v.color?.trim() || "",
          size: v.size?.trim() || "",
        },
      }));

      const productPayload = {
        name: values.name.trim(),
        description: values.description?.trim() || null,
        categoryId: values.categoryId,
        status: values.status,
        imageUrls: finalImageUrls,
        variants: mappedVariants,
      };

      if (editingProduct) {
        const response = await api.put(API_ENDPOINTS.products.update(editingProduct.id), productPayload);
        const updatedProduct = response?.data || response;

        setProducts((prev) =>
          prev.map((product) =>
            product.id === editingProduct.id
              ? { ...product, ...updatedProduct, updatedAt: new Date().toISOString() }
              : product
          )
        );
        message.success("Cập nhật sản phẩm thành công.");
      } else {
        const response = await api.post(API_ENDPOINTS.products.create, productPayload);
        const newProduct = response?.data || response;

        setProducts((prev) => [newProduct, ...prev]);
        message.success("Thêm sản phẩm thành công.");
      }

      setModalOpen(false);
      form.resetFields();
      setEditingProduct(null);
    } catch (error) {
      console.error("Lỗi lưu sản phẩm", error);
      if (!error.errorFields) {
        message.error("Không thể lưu sản phẩm. Vui lòng thử lại.");
      }
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await api.delete(API_ENDPOINTS.products.delete(id));
      setProducts((prev) => prev.filter((product) => product.id !== id));
      message.success("Đã xóa sản phẩm khỏi gian hàng.");
    } catch (error) {
      console.error("Lỗi xóa sản phẩm", error);
      message.error("Không thể xóa sản phẩm.");
    }
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

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Tải ảnh</div>
    </div>
  );

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      width: 350,
      render: (_, record) => {
        const mainVariant = getMainVariant(record);
        const variantCount = record.variants?.length || 1;
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
              <div className="mt-1 text-xs text-gray-500 font-mono flex items-center gap-2">
                <span>SKU: {mainVariant.sku}</span>
                {variantCount > 1 && <Tag color="blue" className="!text-[10px] !m-0">+{variantCount - 1} loại</Tag>}
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
        const totalStock = record.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
        return (
          <div className="space-y-1">
            <div className="font-bold text-gray-700">{totalStock}</div>
            {getStockTag(totalStock)}
          </div>
        );
      },
      sorter: (a, b) => {
        const stockA = a.variants?.reduce((s, v) => s + v.stock, 0) || 0;
        const stockB = b.variants?.reduce((s, v) => s + v.stock, 0) || 0;
        return stockA - stockB;
      },
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
                ...categoryOptions,
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
            loading={isLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showTotal: (total) => <span className="font-medium text-gray-500">Tổng cộng {total} sản phẩm</span>,
            }}
            scroll={{ x: 1000 }}
            className="seller-product-table"
          />
        </Card>

        {/* =========================================================
            MODAL THÊM / CẬP NHẬT SẢN PHẨM & VARIANTS
        ========================================================= */}
        <Modal
          title={<span className="text-lg font-black text-gray-800">{editingProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</span>}
          open={modalOpen}
          onCancel={() => {
            setModalOpen(false);
            setEditingProduct(null);
            form.resetFields();
          }}
          onOk={handleSubmitProduct}
          okText={editingProduct ? "Lưu thay đổi" : "Đăng bán"}
          cancelText="Hủy"
          width={900}
          style={{ top: 20 }}
          okButtonProps={{ className: "bg-blue-600 hover:bg-blue-700 font-bold rounded-lg" }}
          cancelButtonProps={{ className: "font-bold rounded-lg" }}
        >
          <Form form={form} layout="vertical" className="mt-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Form.Item
                label={<span className="font-medium text-gray-700">Tên sản phẩm</span>}
                name="name"
                rules={[
                  { required: true, whitespace: true, message: "Vui lòng nhập tên sản phẩm." },
                  { max: 200, message: "Tên sản phẩm tối đa 200 ký tự." },
                ]}
              >
                <Input size="large" placeholder="Nhập tên sản phẩm (VD: Áo thun nam cổ tròn)" className="rounded-lg" />
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Form.Item
                label={<span className="font-medium text-gray-700">Danh mục ngành hàng</span>}
                name="categoryId"
                rules={[{ required: true, message: "Vui lòng chọn danh mục." }]}
              >
                <Select
                  size="large"
                  className="rounded-lg"
                  placeholder="Chọn danh mục"
                  options={categoryOptions}
                />
              </Form.Item>
            </div>

            <Form.Item label={<span className="font-medium text-gray-700">Mô tả chi tiết</span>} name="description">
              <Input.TextArea rows={4} placeholder="Mô tả chi tiết công dụng, chất liệu, hướng dẫn sử dụng..." className="rounded-xl p-3" />
            </Form.Item>

            {/* UPLOAD NHIỀU ẢNH */}
            <Form.Item
              label={<span className="font-medium text-gray-700">Hình ảnh sản phẩm (Ảnh đầu tiên sẽ là ảnh chính)</span>}
              name="imageUrls"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              rules={[{ required: true, message: "Vui lòng đăng ít nhất 1 hình ảnh" }]}
            >
              <Upload
                listType="picture-card"
                multiple
                beforeUpload={() => false}
                onPreview={handlePreview}
                accept="image/*"
              >
                {(form.getFieldValue('imageUrls')?.length >= 8) ? null : uploadButton}
              </Upload>
            </Form.Item>
            
            <Modal open={previewOpen} title="Xem trước ảnh" footer={null} onCancel={() => setPreviewOpen(false)}>
              <img alt="preview" style={{ width: '100%' }} src={previewImage} />
            </Modal>

            <Divider orientation="left"><span className="text-gray-700 font-bold">Phân loại hàng hóa (Variants)</span></Divider>

            {/* FORM.LIST QUẢN LÝ NHIỀU VARIANT */}
            <Form.List 
              name="variants"
              rules={[
                {
                  validator: async (_, variants) => {
                    if (!variants || variants.length < 1) {
                      return Promise.reject(new Error('Sản phẩm phải có ít nhất 1 phân loại (Variant)'));
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <div className="space-y-4">
                  {fields.map(({ key, name, ...restField }, index) => (
                    <Card 
                      size="small" 
                      key={key} 
                      className="bg-blue-50/40 border border-blue-100 rounded-xl shadow-sm"
                      title={<span className="text-blue-700 font-bold">Phân loại {index + 1}</span>}
                      extra={
                        fields.length > 1 ? (
                          <Button danger type="text" onClick={() => remove(name)} icon={<DeleteOutlined />}>
                            Xóa
                          </Button>
                        ) : null
                      }
                    >
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Form.Item
                          {...restField}
                          label={<span className="text-gray-600 font-medium">Mã SKU</span>}
                          name={[name, 'sku']}
                          rules={[
                            { required: true, whitespace: true, message: "Bắt buộc." },
                            { max: 100, message: "Tối đa 100 ký tự." },
                          ]}
                        >
                          <Input placeholder="Mã quản lý kho" className="rounded-lg" />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          label={<span className="text-gray-600 font-medium">Giá bán (VNĐ)</span>}
                          name={[name, 'price']}
                          rules={[
                            { required: true, message: "Bắt buộc." },
                            {
                              validator: (_, value) => {
                                if (value === undefined || value === null) return Promise.resolve();
                                if (value <= 0) return Promise.reject(new Error("Giá phải lớn hơn 0"));
                                return Promise.resolve();
                              }
                            }
                          ]}
                        >
                          <InputNumber min={1} className="!w-full rounded-lg" placeholder="Giá tiền" formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(value) => value.replace(/\$\s?|(,*)/g, '')} />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          label={<span className="text-gray-600 font-medium">Số lượng kho</span>}
                          name={[name, 'stock']}
                          rules={[
                            { required: true, message: "Bắt buộc." },
                            { type: 'number', min: 0, message: "Tồn kho >= 0" }
                          ]}
                        >
                          <InputNumber min={0} className="!w-full rounded-lg" placeholder="Số lượng" />
                        </Form.Item>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Form.Item {...restField} label={<span className="text-gray-500">Màu sắc (Tùy chọn)</span>} name={[name, 'color']}>
                          <Input placeholder="VD: Đỏ, Xanh, Trắng..." className="rounded-lg" />
                        </Form.Item>

                        <Form.Item {...restField} label={<span className="text-gray-500">Kích cỡ (Tùy chọn)</span>} name={[name, 'size']}>
                          <Input placeholder="VD: M, L, XL, 42..." className="rounded-lg" />
                        </Form.Item>
                      </div>
                    </Card>
                  ))}
                  
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} className="h-10 text-blue-600 border-blue-300 bg-blue-50/50 hover:bg-blue-100 rounded-xl font-medium">
                    Thêm một phân loại khác
                  </Button>
                  <Form.ErrorList errors={errors} className="text-red-500 mt-2" />
                </div>
              )}
            </Form.List>
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
          width={800}
        >
          {viewingProduct && (
            <div className="mt-4 flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-2/5 shrink-0">
                <Image
                  src={getMainImage(viewingProduct)}
                  alt={viewingProduct.name}
                  className="rounded-2xl object-cover border border-gray-100 w-full aspect-square"
                  fallback="https://via.placeholder.com/300x300?text=Product"
                />
                {/* HIỂN THỊ CÁC ẢNH PHỤ */}
                {viewingProduct.imageUrls?.length > 1 && (
                   <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                     {viewingProduct.imageUrls.slice(1).map((url, idx) => (
                        <Image
                          key={idx}
                          src={url}
                          width={64}
                          height={64}
                          className="rounded-lg object-cover border border-gray-200"
                        />
                     ))}
                   </div>
                )}
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
                </Space>

                <div className="mt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Danh sách Phân loại ({viewingProduct.variants?.length})</h4>
                  <Table
                    size="small"
                    rowKey="sku"
                    pagination={false}
                    dataSource={viewingProduct.variants || []}
                    columns={[
                      { title: 'SKU', dataIndex: 'sku', key: 'sku', render: (val) => <span className="font-mono text-xs">{val}</span> },
                      { 
                        title: 'Thuộc tính', 
                        key: 'attr', 
                        render: (_, record) => (
                          <div className="text-xs">
                             {record.attributes?.color && <Tag>{record.attributes.color}</Tag>}
                             {record.attributes?.size && <Tag>{record.attributes.size}</Tag>}
                          </div>
                        ) 
                      },
                      { title: 'Giá', dataIndex: 'price', key: 'price', render: (val) => <span className="font-semibold text-blue-600">{formatCurrency(val)}</span> },
                      { title: 'Kho', dataIndex: 'stock', key: 'stock', render: (val) => getStockTag(val) },
                    ]}
                  />
                </div>

                <div className="mt-6">
                  <div className="font-bold text-gray-800 mb-2">Mô tả sản phẩm</div>
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-xl">
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