package com.webtechnology.ecommerce.service;

import com.webtechnology.ecommerce.dto.DashboardResponse;
import com.webtechnology.ecommerce.dto.RevenueResponse;
import com.webtechnology.ecommerce.dto.TopProductResponse;
import java.util.List;

public interface AdminService {

    DashboardResponse getDashboard();

    RevenueResponse getRevenue();

    List<TopProductResponse> getTopProducts(int limit);
}
