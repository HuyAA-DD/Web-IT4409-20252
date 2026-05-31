package com.webtechnology.ecommerce.service;

import com.webtechnology.ecommerce.dto.DashboardResponse;
import com.webtechnology.ecommerce.dto.RevenueResponse;
import com.webtechnology.ecommerce.dto.TopProductResponse;
import java.util.List;

public interface AdminService {

    DashboardResponse getDashboard(Integer year, Integer month, Integer quarter);

    RevenueResponse getRevenue(Integer year, Integer month, Integer quarter);

    List<TopProductResponse> getTopProducts(int limit, Integer year, Integer month, Integer quarter);
}
