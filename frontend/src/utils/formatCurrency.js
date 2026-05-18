export function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "0 ₫";
  }

  return Number(value).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
}