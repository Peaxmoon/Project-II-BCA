import React, { useEffect, useState } from 'react';
import { 
  Title, 
  Text, 
  Paper, 
  Table, 
  Badge, 
  Group, 
  Button, 
  Select, 
  Stack, 
  Loader, 
  Alert,
  ActionIcon,
  Modal,
  Menu
} from '@mantine/core';
import { IconAlertCircle, IconEye, IconMenu2, IconTruck, IconPackage } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import api from '../../services/api';
import AdminLayout from './AdminLayout';
import { useNavigate } from 'react-router-dom';
import { modals } from '@mantine/modals';

const OrdersManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsModal, setOrderDetailsModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      notifications.show({ color: 'green', title: 'Order Updated', message: 'Order status updated successfully.' });
      fetchOrders();
    } catch (err) {
      notifications.show({ color: 'red', title: 'Error', message: err.response?.data?.message || 'Failed to update order' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'processing': return 'blue';
      case 'shipped': return 'orange';
      case 'delivered': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setOrderDetailsModal(true);
  };

  const confirmStatusChange = (order, newStatus) => {
    modals.openConfirmModal({
      title: 'Confirm Status Change',
      children: (
        <Text>Are you sure you want to change the status of order <b>#{order._id.slice(-8)}</b> to <b>{newStatus}</b>?</Text>
      ),
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onConfirm: () => updateOrderStatus(order._id, newStatus),
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <Group justify="center" mt="xl">
          <Loader size="lg" />
        </Group>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
          {error}
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Title order={2} mb="lg">Orders Management</Title>
      
      <Paper radius="md" p="xl" withBorder shadow="sm">
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={600} size="lg">All Orders ({orders.length})</Text>
            <Button variant="light" onClick={fetchOrders}>Refresh</Button>
          </Group>

          {orders.length === 0 ? (
            <Text ta="center" c="dimmed" py="xl">No orders found</Text>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Order ID</Table.Th>
                  <Table.Th>Customer</Table.Th>
                  <Table.Th>Items</Table.Th>
                  <Table.Th>Total</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {orders.map((order) => (
                  <Table.Tr key={order._id}>
                    <Table.Td>
                      <Text size="sm" fw={600}>{order._id.slice(-8)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{order.user?.name || 'Guest'}</Text>
                      <Text size="xs" c="dimmed">{order.user?.email || 'No email'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{order.orderItems?.length || 0} items</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={600}>रु{order.totalPrice}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={getStatusColor(order.orderStatus)} size="sm">
                        {order.orderStatus}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{new Date(order.createdAt).toLocaleDateString()}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Button
                        size="xs"
                        variant="outline"
                        color="blue"
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                      >
                        Order Details
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Paper>

      {/* Order Details Modal */}
      <Modal 
        opened={orderDetailsModal} 
        onClose={() => setOrderDetailsModal(false)} 
        title="Order Details"
        size="lg"
      >
        {selectedOrder && (
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={600}>Order #{selectedOrder._id.slice(-8)}</Text>
              <Badge color={getStatusColor(selectedOrder.orderStatus)}>
                {selectedOrder.orderStatus}
              </Badge>
            </Group>
            
            <Text size="sm" c="dimmed">Customer Information</Text>
            <Paper p="md" withBorder>
              <Text size="sm"><strong>Name:</strong> {selectedOrder.user?.name || 'Guest'}</Text>
              <Text size="sm"><strong>Email:</strong> {selectedOrder.user?.email || 'No email'}</Text>
              <Text size="sm"><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone || 'Not provided'}</Text>
            </Paper>

            <Text size="sm" c="dimmed">Shipping Address</Text>
            <Paper p="md" withBorder>
              <Text size="sm">{selectedOrder.shippingAddress?.address || 'No address'}</Text>
              <Text size="sm">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</Text>
              <Text size="sm">PIN: {selectedOrder.shippingAddress?.postalCode}</Text>
            </Paper>

            <Text size="sm" c="dimmed">Order Items</Text>
            <Paper p="md" withBorder>
              {selectedOrder.orderItems?.map((item, index) => (
                <Group key={index} justify="space-between" mb="xs">
                  <Text size="sm">{item.name}</Text>
                  <Text size="sm">रु{item.price} x {item.quantity}</Text>
                </Group>
              ))}
            </Paper>

            <Group justify="space-between">
              <Text fw={600}>Total Amount</Text>
              <Text fw={600} size="lg">रु{selectedOrder.totalPrice}</Text>
            </Group>

            <Text size="sm" c="dimmed">Order Timeline</Text>
            <Paper p="md" withBorder>
              <Text size="sm"><strong>Ordered:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</Text>
              {selectedOrder.updatedAt && selectedOrder.updatedAt !== selectedOrder.createdAt && (
                <Text size="sm"><strong>Last Updated:</strong> {new Date(selectedOrder.updatedAt).toLocaleString()}</Text>
              )}
            </Paper>

            <Group justify="space-between">
              <Text size="sm" c="dimmed">Update Status</Text>
              <Select
                size="sm"
                value={selectedOrder.orderStatus}
                onChange={(value) => {
                  updateOrderStatus(selectedOrder._id, value);
                  setOrderDetailsModal(false);
                }}
                data={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'processing', label: 'Processing' },
                  { value: 'shipped', label: 'Shipped' },
                  { value: 'delivered', label: 'Delivered' },
                  { value: 'cancelled', label: 'Cancelled' }
                ]}
                styles={{ input: { minHeight: 32 } }}
              />
            </Group>
          </Stack>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default OrdersManagement; 