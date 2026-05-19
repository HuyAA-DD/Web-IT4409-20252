import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import couponApi from "../api/couponApi";
import { formatCurrency } from "../utils/formatCurrency";

function normalizeCoupons(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.coupons)) {
    return response.coupons;
  }

  if (Array.isArray(response?.data?.coupons)) {
    return response.data.coupons;
  }

  return [];
}

function formatDateTime(value) {
  if (!value) {
    return "Không giới hạn";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("vi-VN");
}

function getCouponStatus(coupon) {
  const now = new Date();
  const startDate = coupon.startDate ? new Date(coupon.startDate) : null;
  const endDate = coupon.endDate ? new Date(coupon.endDate) : null;

  if (coupon.active === false) {
    return {
      label: "Đã tắt",
      type: "disabled",
      canUse: false,
    };
  }

  if (startDate && now < startDate) {
    return {
      label: "Chưa bắt đầu",
      type: "upcoming",
      canUse: false,
    };
  }

  if (endDate && now > endDate) {
    return {
      label: "Hết hạn",
      type: "expired",
      canUse: false,
    };
  }

  if (
    coupon.usageLimit !== null &&
    coupon.usageLimit !== undefined &&
    Number(coupon.usedCount || 0) >= Number(coupon.usageLimit)
  ) {
    return {
      label: "Hết lượt",
      type: "used-up",
      canUse: false,
    };
  }

  return {
    label: "Còn hiệu lực",
    type: "available",
    canUse: true,
  };
}

function getCouponDiscountText(coupon) {
  if (coupon.type === "PERCENTAGE") {
    return `Giảm ${coupon.value}%`;
  }

  return `Giảm ${formatCurrency(coupon.value)}`;
}

function getStatusStyle(statusType) {
  if (statusType === "available") {
    return {
      background: "#dcfce7",
      color: "#166534",
      border: "1px solid #86efac",
    };
  }

  if (statusType === "upcoming") {
    return {
      background: "#eff6ff",
      color: "#1d4ed8",
      border: "1px solid #93c5fd",
    };
  }

  if (statusType === "expired" || statusType === "used-up") {
    return {
      background: "#fee2e2",
      color: "#991b1b",
      border: "1px solid #fecaca",
    };
  }

  return {
    background: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
  };
}

function CouponsPage() {
  const navigate = useNavigate();

  const [coupons, setCoupons] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const filteredCoupons = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return coupons.filter((coupon) => {
      const status = getCouponStatus(coupon);

      const matchStatus =
        statusFilter === "ALL" ||
        status.type === statusFilter;

      const matchKeyword =
        !normalizedKeyword ||
        coupon.code?.toLowerCase().includes(normalizedKeyword) ||
        coupon.name?.toLowerCase().includes(normalizedKeyword) ||
        coupon.description?.toLowerCase().includes(normalizedKeyword);

      return matchStatus && matchKeyword;
    });
  }, [coupons, keyword, statusFilter]);

  useEffect(() => {
    async function fetchCoupons() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await couponApi.getAllCoupons();
        const couponList = normalizeCoupons(response);

        setCoupons(couponList);
      } catch (error) {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
          setErrorMessage(
            "Bạn cần đăng nhập hoặc backend chưa mở quyền User cho GET /coupons."
          );
        } else {
          setErrorMessage("Không tải được danh sách mã giảm giá.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchCoupons();
  }, []);

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Đã sao chép mã ${code}`);
    } catch (error) {
      toast.info(`Mã giảm giá: ${code}`);
    }
  };

  const handleUseCoupon = (coupon) => {
    const status = getCouponStatus(coupon);

    if (!status.canUse) {
      toast.error("Mã này hiện không thể sử dụng");
      return;
    }

    localStorage.setItem("selectedCouponCode", coupon.code);
    navigate(`/checkout?coupon=${encodeURIComponent(coupon.code)}`);
  };

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Mã giảm giá</h1>
        <p>
          Xem danh sách coupon hiện có, bao gồm mã còn hiệu lực, hết hạn, hết
          lượt hoặc chưa bắt đầu.
        </p>
      </div>

      <div
        className="info-card"
        style={{
          marginBottom: "24px",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 220px",
          gap: "12px",
        }}
      >
        <input
          type="text"
          placeholder="Tìm theo mã, tên hoặc mô tả..."
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="available">Còn hiệu lực</option>
          <option value="upcoming">Chưa bắt đầu</option>
          <option value="expired">Hết hạn</option>
          <option value="used-up">Hết lượt</option>
          <option value="disabled">Đã tắt</option>
        </select>
      </div>

      {isLoading && (
        <div className="placeholder-box">Đang tải danh sách mã giảm giá...</div>
      )}

      {!isLoading && errorMessage && (
        <div
          className="placeholder-box"
          style={{
            color: "#92400e",
            background: "#fffbeb",
            borderColor: "#fbbf24",
          }}
        >
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && filteredCoupons.length === 0 && (
        <div className="info-card">
          <h2>Không tìm thấy mã giảm giá</h2>
          <p style={{ color: "#4b5563" }}>
            Thử đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái.
          </p>
        </div>
      )}

      {!isLoading && !errorMessage && filteredCoupons.length > 0 && (
        <section className="section-grid">
          {filteredCoupons.map((coupon) => {
            const status = getCouponStatus(coupon);
            const statusStyle = getStatusStyle(status.type);

            return (
              <article key={coupon.id || coupon.code} className="info-card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "12px",
                    marginBottom: "14px",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: "0 0 8px",
                        color: "#2563eb",
                        fontWeight: 800,
                      }}
                    >
                      {coupon.code}
                    </p>

                    <h2 style={{ margin: 0 }}>
                      {coupon.name || getCouponDiscountText(coupon)}
                    </h2>
                  </div>

                  <span
                    style={{
                      ...statusStyle,
                      padding: "6px 10px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: 800,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {status.label}
                  </span>
                </div>

                <p
                  style={{
                    color: "#2563eb",
                    fontWeight: 900,
                    fontSize: "22px",
                    margin: "0 0 12px",
                  }}
                >
                  {getCouponDiscountText(coupon)}
                </p>

                <p style={{ color: "#4b5563", minHeight: "48px" }}>
                  {coupon.description || "Không có mô tả cho mã giảm giá này."}
                </p>

                <div
                  style={{
                    display: "grid",
                    gap: "8px",
                    marginTop: "16px",
                    color: "#374151",
                  }}
                >
                  <div>
                    <strong>Đơn tối thiểu:</strong>{" "}
                    {coupon.minOrderAmount
                      ? formatCurrency(coupon.minOrderAmount)
                      : "Không yêu cầu"}
                  </div>

                  <div>
                    <strong>Giảm tối đa:</strong>{" "}
                    {coupon.maxDiscountAmount
                      ? formatCurrency(coupon.maxDiscountAmount)
                      : "Không giới hạn"}
                  </div>

                  <div>
                    <strong>Lượt dùng:</strong>{" "}
                    {coupon.usageLimit
                      ? `${coupon.usedCount || 0}/${coupon.usageLimit}`
                      : "Không giới hạn"}
                  </div>

                  <div>
                    <strong>Thời gian:</strong> {formatDateTime(coupon.startDate)}{" "}
                    - {formatDateTime(coupon.endDate)}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop: "18px",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => handleCopyCode(coupon.code)}
                  >
                    Sao chép mã
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleUseCoupon(coupon)}
                    disabled={!status.canUse}
                  >
                    Dùng mã này
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <div style={{ marginTop: "28px" }}>
        <Link to="/checkout" className="btn btn-outline">
          Đi tới thanh toán
        </Link>
      </div>
    </div>
  );
}

export default CouponsPage;