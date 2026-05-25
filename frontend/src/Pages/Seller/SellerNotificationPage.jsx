import React, { useState, useMemo, useEffect } from 'react';
import { Card, Button, Dropdown, Typography, message } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import api from '../../Apis/apiConfig';
import API_ENDPOINTS from '../../Apis/apiEndpoints';
import { getAuthUser } from '../../Utils/Auth';

export default function SellerNotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const authUser = getAuthUser();
  const userId = authUser?.id;

  useEffect(() => {
    if (!userId) return;
    const fetchSellerNotifs = async () => {
      try {
        const resp = await api.get(API_ENDPOINTS.notifications.byUser(userId));
        setNotifications(resp?.data || resp || []);
      } catch (err) {
        console.error('Cannot load seller notifications', err);
      }
    };
    fetchSellerNotifs();
  }, [userId]);

  const displayedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => (a.isRead === b.isRead ? 0 : a.isRead ? 1 : -1));
  }, [notifications]);

  const handleMarkAsRead = (id) => {
    setNotifications((prev) => prev.map((item) => item.id === id ? { ...item, isRead: true } : item));
    message.success('Đã đánh dấu là đã đọc');
  };

  const handleDelete = (id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    message.success('Đã xóa thông báo');
  };

  return (
    <div className="min-h-[70vh]">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="rounded-3xl bg-white border border-gray-100 p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Typography.Title level={3} className="m-0">Thông báo Seller</Typography.Title>
              <Typography.Paragraph className="text-gray-500 m-0">Cập nhật trạng thái đơn, tồn kho và tin khuyến mãi dành cho gian hàng của bạn.</Typography.Paragraph>
            </div>
            <Button type="primary" icon={<BellOutlined />} onClick={() => message.info('Tải lại thông báo...')}>
              Làm mới
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {displayedNotifications.length === 0 ? (
            <Card className="rounded-3xl border border-gray-100 shadow-sm text-center py-24">
              <BellOutlined className="text-4xl text-gray-300 mb-4" />
              <Typography.Paragraph className="text-gray-500">Bạn đã đọc hết thông báo.</Typography.Paragraph>
            </Card>
          ) : (
            displayedNotifications.map((item) => (
              <Card
                key={item.id}
                className={`rounded-3xl border ${item.isRead ? 'border-gray-200' : 'border-orange-200 bg-orange-50/70'} shadow-sm`}
                bodyStyle={{ padding: '1.5rem' }}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                        <BellOutlined />
                      </div>
                      <div>
                        <Typography.Title level={5} className="m-0">{item.title}</Typography.Title>
                        <Typography.Text type="secondary">{item.time}</Typography.Text>
                      </div>
                    </div>
                    <Typography.Paragraph className="m-0 text-gray-700">{item.description}</Typography.Paragraph>
                  </div>

                  <div className="flex flex-wrap gap-3 items-center">
                    {!item.isRead && (
                      <Button type="default" onClick={() => handleMarkAsRead(item.id)} icon={<CheckOutlined />}>
                        Đã đọc
                      </Button>
                    )}
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: 'delete',
                            label: 'Xóa',
                            icon: <DeleteOutlined />,
                            onClick: () => handleDelete(item.id),
                          },
                        ],
                      }}
                      trigger={['click']}
                    >
                      <Button icon={<MoreOutlined />}>
                        Thao tác
                      </Button>
                    </Dropdown>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
