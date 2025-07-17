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
  Alert 
} from '@mantine/core';
import { IconAlertCircle, IconEye } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import api from '../../services/api';
import AdminLayout from './AdminLayout';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
                      <Select
                        size="xs"
                        value={order.orderStatus}
                        onChange={(value) => updateOrderStatus(order._id, value)}
                        data={[
                          { value: 'pending', label: 'Pending' },
                          { value: 'processing', label: 'Processing' },
                          { value: 'shipped', label: 'Shipped' },
                          { value: 'delivered', label: 'Delivered' },
                          { value: 'cancelled', label: 'Cancelled' }
                        ]}
                        styles={{ input: { minHeight: 28 } }}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{new Date(order.createdAt).toLocaleDateString()}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Button size="xs" variant="light" leftSection={<IconEye size={14} />}>
                        View
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Paper>
    </AdminLayout>
  );
};

export default OrdersManagement; 