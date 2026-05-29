import React, { useMemo, useState, useEffect } from "react";
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
  FolderAddOutlined,
} from "@ant-design/icons";
import api from '../../../Apis/apiConfig';
import API_ENDPOINTS from '../../../Apis/apiEndpoints';

const { Title, Text } = Typography;

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);
};

// Lấy variant đầu tiên để hiển thị ở bảng
const getMainVariant = (product) => {
  return product?.variants?.[0] || {
    sku: "",
    price: 0,
    stock: 0,
    attributes: {},
  };
};

// Lấy ảnh đầu tiên để hiển thị ở bảng
const getMainImage = (product) => {
  return product?.imageUrls?.[0] || "https://via.placeholder.com/120x120?text=Product";
};

// Hàm hỗ trợ chuyển đổi file Upload sang Base64 để giả lập URL
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

const AdminProductPage = () => {
  const [form] = Form.useForm();
  const [categoryForm] = Form.useForm();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);

  // States cho các Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          api.get(API_ENDPOINTS.admin.products.list),
          api.get(API_ENDPOINTS.categories.list),
        ]);

        const fetchedProducts = productsResponse?.data || productsResponse || [];
        const fetchedCategories = categoriesResponse?.data || categoriesResponse || [];

        setProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
        setCategories(Array.isArray(fetchedCategories) ? fetchedCategories : []);
      } catch (error) {
        console.error('Lỗi tải sản phẩm hoặc danh mục', error);
        message.error('Không thể tải dữ liệu sản phẩm hoặc danh mục.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchKeyword =
        product.name.toLowerCase().includes(keyword.toLowerCase()) ||
        product.categoryName?.toLowerCase().includes(keyword.toLowerCase()) ||
        product.variants?.some(v => v.sku.toLowerCase().includes(keyword.toLowerCase()));

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
    (sum, item) => sum + (item.variants?.reduce((vSum, v) => vSum + v.stock, 0) || 0),
    0
  );

  // ==========================================
  // XỬ LÝ SẢN PHẨM
  // ==========================================
  const openCreateModal = () => {
    setEditingProduct(null);
    form.resetFields();
    form.setFieldsValue({
      categoryId: categories[0]?.id || undefined,
      sellerId: "",
      status: "ACTIVE",
      imageUrls: [],
      // Cấu hình ít nhất 1 variant rỗng
      variants: [
        { sku: "", price: null, stock: 0, color: "", size: "" }
      ],
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
      sellerId: record.sellerId,
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

  const uploadImageFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file.originFileObj);

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

  const handleSubmitProduct = async () => {
    try {
      const values = await form.validateFields();

      const existingUrls = (values.imageUrls || [])
        .filter((file) => file.url)
        .map((file) => file.url);

      const uploadedUrls = await uploadImageUrls(values.imageUrls || []);
      const finalImageUrls = [...existingUrls, ...uploadedUrls];

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
        sellerId: values.sellerId?.trim() || null,
        status: values.status,
        imageUrls: finalImageUrls,
        variants: mappedVariants,
      };

      if (editingProduct) {
        const updatedProduct = await api.put(
          API_ENDPOINTS.admin.products.update(editingProduct.id),
          productPayload
        );
        const normalizedProduct = updatedProduct?.data || updatedProduct;

        setProducts((prev) =>
          prev.map((product) =>
            product.id === editingProduct.id
              ? { ...product, ...normalizedProduct, updatedAt: new Date().toISOString() }
              : product
          )
        );
        message.success('Cập nhật sản phẩm thành công.');
      } else {
        const createdProduct = await api.post(
          API_ENDPOINTS.admin.products.create,
          productPayload
        );
        const normalizedProduct = createdProduct?.data || createdProduct;
        setProducts((prev) => [normalizedProduct, ...prev]);
        message.success('Thêm sản phẩm thành công.');
      }

      setModalOpen(false);
      form.resetFields();
      setEditingProduct(null);
    } catch (error) {
      console.error('Lỗi lưu sản phẩm', error);
      if (!error.errorFields) {
        message.error('Không thể lưu sản phẩm. Vui lòng thử lại.');
      }
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await api.delete(API_ENDPOINTS.admin.products.delete(id));
      setProducts((prev) => prev.filter((product) => product.id !== id));
      message.success('Đã xóa sản phẩm.');
    } catch (error) {
      console.error('Lỗi xóa sản phẩm', error);
      message.error('Không thể xóa sản phẩm.');
    }
  };

  // Preview Ảnh khi upload
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  // ==========================================
  // XỬ LÝ DANH MỤC (CATEGORY)
  // ==========================================
  const handleCreateCategory = async () => {
    try {
      const values = await categoryForm.validateFields();
      const response = await api.post(API_ENDPOINTS.categories.create, {
        name: values.name.trim(),
        description: values.description?.trim() || "",
        parentId: values.parentId || null
      });

      const newCategory = response?.data || response;
      setCategories(prev => [...prev, newCategory]);
      message.success("Thêm danh mục mới thành công!");
      categoryForm.resetFields();
    } catch (error) {
      console.error("Lỗi khi thêm danh mục", error);
      if (!error.errorFields) message.error("Không thể thêm danh mục.");
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    const parentCategory = categories.find((c) => c.name === category.parentName);
    categoryForm.setFieldsValue({
      name: category.name,
      description: category.description || "",
      parentId: parentCategory?.id || undefined,
    });
  };

  const handleSaveCategory = async () => {
    try {
      if (!editingCategory) return;
      const values = await categoryForm.validateFields();
      
      const response = await api.put(API_ENDPOINTS.categories.update(editingCategory.id), {
        name: values.name.trim(),
        description: values.description?.trim() || "",
        parentId: values.parentId || null
      });

      const updatedCategory = response?.data || response;
      setCategories(prev => prev.map(cat => cat.id === editingCategory.id ? updatedCategory : cat));
      message.success("Cập nhật danh mục thành công!");
      setEditingCategory(null);
      categoryForm.resetFields();
    } catch (error) {
      console.error("Lỗi khi cập nhật", error);
      if (!error.errorFields) message.error("Không thể cập nhật danh mục.");
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await api.delete(API_ENDPOINTS.categories.delete(id));
      setCategories(prev => prev.filter(cat => cat.id !== id));
      message.success("Đã xóa danh mục!");
    } catch (error) {
      console.error("Lỗi xóa danh mục", error);
      message.error("Không thể xóa danh mục.");
    }
  };

  const categoryColumns = [
    {
      title: "ID (UUID)",
      dataIndex: "id",
      key: "id",
      width: 130,
      render: (id) => <Text copyable ellipsis className="font-mono text-xs text-gray-400">{id}</Text>,
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      width: 140,
      render: (name) => <span className="font-semibold text-gray-800">{name}</span>,
    },
    {
      title: "Danh mục cha",
      dataIndex: "parentName",
      key: "parentName",
      width: 130,
      render: (parentName) => parentName ? <Tag color="orange">{parentName}</Tag> : <Text type="secondary">-</Text>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date) => <span className="text-xs text-gray-500">{date ? new Date(date).toLocaleString('vi-VN') : "-"}</span>,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space size={8}>
          <Button icon={<EditOutlined />} onClick={() => handleEditCategory(record)} />
          <Popconfirm
            title="Xóa danh mục?"
            description="Bạn có chắc muốn xóa danh mục này?"
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDeleteCategory(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

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
        const variantCount = record.variants?.length || 1;
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
              <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
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
      render: (value) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: "Giá (Từ)",
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
      title: "Tổng Tồn",
      key: "stock",
      width: 120,
      render: (_, record) => {
        const totalStock = record.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
        return (
          <div className="space-y-1">
            <div className="font-semibold">{totalStock}</div>
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

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Tải ảnh</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 px-5 py-6">
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Title level={2} className="!mb-1 !text-[32px]">Quản lý sản phẩm</Title>
            <Text type="secondary">Dựng UI theo ProductRequest, ProductResponse và ProductVariant DTO.</Text>
          </div>
          <Space>
            <Button
              size="large"
              icon={<FolderAddOutlined />}
              onClick={() => setCategoryModalOpen(true)}
              className="!h-11 !rounded-xl"
            >
              Cấu hình Danh mục
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
              className="!h-11 !rounded-xl !bg-orange-500 !px-5 hover:!bg-orange-600"
            >
              Thêm sản phẩm
            </Button>
          </Space>
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
            <div className="mt-1 text-2xl font-bold text-green-600">{activeProducts}</div>
          </Card>

          <Card className="rounded-2xl border-0 shadow-sm">
            <div className="text-sm text-gray-500">Đã ẩn</div>
            <div className="mt-1 text-2xl font-bold text-gray-600">{inactiveProducts}</div>
          </Card>

          <Card className="rounded-2xl border-0 shadow-sm">
            <div className="text-sm text-gray-500">Tổng tồn kho (All Variants)</div>
            <div className="mt-1 text-2xl font-bold text-blue-600">{totalStock}</div>
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
                ...categories.map((category) => ({ label: category.name, value: category.id })),
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
            pagination={{ pageSize: 5, showSizeChanger: false, showTotal: (total) => `Tổng ${total} sản phẩm` }}
            scroll={{ x: 1150 }}
            loading={isLoading}
          />
        </Card>

        {/* =========================================================
            MODAL THÊM / CẬP NHẬT SẢN PHẨM & VARIANTS & UPLOAD MULTIPLE IMAGES
        ========================================================= */}
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
          width={900} // Mở rộng Modal để chứa List dễ nhìn
          style={{ top: 20 }}
        >
          <Form form={form} layout="vertical" className="mt-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Form.Item
                label="Tên sản phẩm"
                name="name"
                rules={[
                  { required: true, whitespace: true, message: "Vui lòng nhập tên sản phẩm." },
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
                  placeholder="Chọn danh mục"
                  options={categories.map((category) => ({
                    label: category.name,
                    value: category.id,
                  }))}
                />
              </Form.Item>

              <Form.Item label="Seller ID" name="sellerId">
                <Input placeholder="UUID người bán (Tuỳ chọn)" />
              </Form.Item>
            </div>

            <Form.Item label="Mô tả" name="description">
              <Input.TextArea rows={3} placeholder="Nhập mô tả sản phẩm" />
            </Form.Item>

            {/* UPLOAD NHIỀU ẢNH */}
            <Form.Item
              label="Danh sách hình ảnh (Image URLs)"
              name="imageUrls"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              rules={[{ required: true, message: "Ít nhất 1 hình ảnh (Ảnh đầu tiên sẽ là ảnh chính)" }]}
            >
              <Upload
                listType="picture-card"
                multiple
                beforeUpload={() => false} // Không tự động gọi request
                onPreview={handlePreview}
                accept="image/*"
              >
                {/* Giới hạn ví dụ 8 ảnh */}
                {(form.getFieldValue('imageUrls')?.length >= 8) ? null : uploadButton}
              </Upload>
            </Form.Item>
            
            {/* Modal nhỏ hỗ trợ Preview Hình Ảnh Upload */}
            <Modal open={previewOpen} title="Xem trước ảnh" footer={null} onCancel={() => setPreviewOpen(false)}>
              <img alt="preview" style={{ width: '100%' }} src={previewImage} />
            </Modal>

            <Divider orientation="left">Quản lý Phân loại (Variants)</Divider>

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
                      className="bg-gray-50/50 border border-gray-200"
                      title={<span className="text-orange-600 font-semibold">Phân loại {index + 1}</span>}
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
                          label="SKU"
                          name={[name, 'sku']}
                          rules={[
                            { required: true, whitespace: true, message: "Bắt buộc." },
                            { max: 100, message: "Tối đa 100 ký tự." },
                          ]}
                        >
                          <Input placeholder="Mã SKU (VD: TSHIRT-RED-M)" />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          label="Giá (VNĐ)"
                          name={[name, 'price']}
                          rules={[
                            { required: true, message: "Bắt buộc." },
                            {
                              validator: (_, value) => {
                                if (value === undefined || value === null) return Promise.resolve();
                                if (value <= 0) return Promise.reject(new Error("Giá > 0"));
                                return Promise.resolve();
                              }
                            }
                          ]}
                        >
                          <InputNumber min={0.01} step={1000} className="!w-full" placeholder="Giá tiền" />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          label="Tồn kho"
                          name={[name, 'stock']}
                          rules={[
                            { required: true, message: "Bắt buộc." },
                            { type: 'number', min: 0, message: "Tồn kho >= 0" }
                          ]}
                        >
                          <InputNumber min={0} className="!w-full" placeholder="Số lượng" />
                        </Form.Item>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Form.Item {...restField} label="Màu sắc (Thuộc tính)" name={[name, 'color']}>
                          <Input placeholder="VD: Đỏ, Xanh..." />
                        </Form.Item>

                        <Form.Item {...restField} label="Kích cỡ (Thuộc tính)" name={[name, 'size']}>
                          <Input placeholder="VD: M, L, XL..." />
                        </Form.Item>
                      </div>
                    </Card>
                  ))}
                  
                  {/* Nút thêm mới biến thể */}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} className="h-10 text-orange-600 border-orange-300 bg-orange-50">
                    Thêm một phân loại khác
                  </Button>
                  <Form.ErrorList errors={errors} className="text-red-500 mt-2" />
                </div>
              )}
            </Form.List>

          </Form>
        </Modal>

        {/* =========================================================
            MODAL QUẢN LÝ DANH MỤC
        ========================================================= */}
        <Modal
          title={<span className="text-xl font-bold text-gray-800">Cấu hình & Quản lý Danh mục</span>}
          open={categoryModalOpen}
          onCancel={() => {
            setCategoryModalOpen(false);
            setEditingCategory(null);
            categoryForm.resetFields();
          }}
          footer={[
            <Button key="close" type="primary" onClick={() => {
              setCategoryModalOpen(false);
              setEditingCategory(null);
              categoryForm.resetFields();
            }}>
              Đóng quản lý
            </Button>
          ]}
          width={1100}
          style={{ top: 40 }}
        >
          <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4 bg-gray-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-gray-200/60 flex flex-col justify-between">
              <div>
                <div className="mb-4 font-bold text-gray-700 text-sm">{editingCategory ? "Cập nhật danh mục" : "Tạo danh mục mới"}</div>
                <Form form={categoryForm} layout="vertical">
                  <Form.Item
                    label="Tên danh mục"
                    name="name"
                    rules={[{ required: true, whitespace: true, message: "Vui lòng nhập tên danh mục" }]}
                  >
                    <Input placeholder="VD: Điện thoại, Quần áo..." />
                  </Form.Item>

                  <Form.Item
                    label="Danh mục cha (Tùy chọn)"
                    name="parentId"
                    tooltip="Chọn danh mục cha nếu đây là danh mục con"
                  >
                    <Select
                      allowClear
                      placeholder="Chọn danh mục cha..."
                      options={categories
                        .filter(c => c.id !== editingCategory?.id)
                        .map((c) => ({
                          label: c.name,
                          value: c.id,
                        }))}
                    />
                  </Form.Item>

                  <Form.Item label="Mô tả" name="description">
                    <Input.TextArea rows={4} placeholder="Nhập mô tả danh mục..." />
                  </Form.Item>
                </Form>
              </div>
              
              <div className="space-y-2 mt-2">
                <Button 
                  type="primary" 
                  block 
                  icon={editingCategory ? <EditOutlined /> : <PlusOutlined />} 
                  onClick={editingCategory ? handleSaveCategory : handleCreateCategory}
                  className="bg-orange-500 hover:bg-orange-600 h-10 rounded-xl font-medium"
                >
                  {editingCategory ? "Cập nhật" : "Tạo mới"}
                </Button>
                {editingCategory && (
                  <Button 
                    block 
                    onClick={() => {
                      setEditingCategory(null);
                      categoryForm.resetFields();
                    }}
                    className="h-10 rounded-xl font-medium"
                  >
                    Hủy sửa
                  </Button>
                )}
              </div>
            </div>

            <div className="lg:col-span-8 border border-gray-100 rounded-2xl p-2 bg-white">
              <div className="p-2 mb-2 font-bold text-gray-700 text-sm flex items-center justify-between">
                <span>Dữ liệu phản hồi thực tế (CategoryResponse DTO)</span>
                <Tag color="blue">Tổng: {categories.length}</Tag>
              </div>
              <Table
                rowKey="id"
                columns={categoryColumns}
                dataSource={categories}
                pagination={{ pageSize: 4 }}
                size="small"
                scroll={{ x: 650 }}
              />
            </div>
          </div>
        </Modal>

        {/* =========================================================
            MODAL XEM CHI TIẾT SẢN PHẨM
        ========================================================= */}
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
          width={850}
        >
          {viewingProduct && (
            <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
              <div>
                <Image
                  src={getMainImage(viewingProduct)}
                  alt={viewingProduct.name}
                  className="rounded-2xl object-cover w-full aspect-square"
                  fallback="https://via.placeholder.com/300x300?text=Product"
                />
                {/* HIỂN THỊ CÁC ẢNH PHỤ (NẾU CÓ) */}
                {viewingProduct.imageUrls?.length > 1 && (
                   <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                     {viewingProduct.imageUrls.slice(1).map((url, idx) => (
                        <Image
                          key={idx}
                          src={url}
                          width={60}
                          height={60}
                          className="rounded-lg object-cover border border-gray-200"
                        />
                     ))}
                   </div>
                )}
              </div>

              <div className="md:col-span-2">
                <Title level={4} className="!mb-2">
                  {viewingProduct.name}
                </Title>

                <Space wrap className="mb-3">
                  <Tag color="blue">{viewingProduct.categoryName}</Tag>
                  {getStatusTag(viewingProduct.status)}
                </Space>

                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">Product ID: </span><span className="font-medium">{viewingProduct.id}</span></div>
                  <div><span className="text-gray-500">Seller: </span><span className="font-medium">{viewingProduct.sellerName}</span></div>
                </div>

                <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                  {viewingProduct.description || "Chưa có mô tả sản phẩm."}
                </div>

                {/* BẢNG BIẾN THỂ (VARIANTS) */}
                <div className="mt-6">
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
                      { title: 'Giá', dataIndex: 'price', key: 'price', render: (val) => <span className="font-semibold text-orange-600">{formatCurrency(val)}</span> },
                      { title: 'Tồn kho', dataIndex: 'stock', key: 'stock', render: (val) => getStockTag(val) },
                    ]}
                  />
                </div>

              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AdminProductPage;