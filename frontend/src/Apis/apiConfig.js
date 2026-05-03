import axios from "axios"
import { getAccessToken } from "../Utils/Auth"


const BASE_URL = "http://localhost:8080/api"

const axiosInstance = axios.create({
    baseURL: BASE_URL
})

axiosInstance.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token){
        config.headers = config.headers || {},
        config.headers.Authorization = `Bearer ${getAccessToken()}`
    }
    
    return config

})


axiosInstance.interceptors.response.use(
  (response) => {
    // Nếu API gọi thành công (Status 2xx), cho qua bình thường
    return response;
  },
  (error) => {
    // Chặn bắt lỗi từ Backend trả về
    if (error.response && error.response.status === 401) {
      
      // BƯỚC 1: Xóa sạch dữ liệu cũ trong ổ cứng
      localStorage.removeItem('token'); // Xóa token
      localStorage.removeItem('user');  // Xóa thông tin user (nếu có)
      
      // BƯỚC 2: Báo cho người dùng biết tại sao bị văng
      window.message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');

      // BƯỚC 3: Đá thẳng cổ về trang Login
      // Dùng window.location.href để reload và clear toàn bộ state hiện tại
      window.location.href = '/login'; 
    }

    // Nếu là các lỗi khác (400, 403, 500...), cứ ném ra ngoài cho Component tự xử lý
    return Promise.reject(error);
  }
);


const api = {
  get: (endpoint, params = {}) => axiosInstance.get(endpoint, { params }).then(res => res.data),
  post: (endpoint, data, config = {}) => axiosInstance.post(endpoint, data, config).then(res => res.data),
  put: (endpoint, data, config = {}) => axiosInstance.put(endpoint, data, config).then(res => res.data),
  delete: (endpoint, params = {}) => axiosInstance.delete(endpoint, { params }).then(res => res.data),
};

export default api;