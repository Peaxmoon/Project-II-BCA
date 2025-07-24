import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Title, Text, Paper, Group, Stack, Loader, Alert, Badge, Button, Image, Divider, Table, Box, Select
} from '@mantine/core';
import { IconAlertCircle, IconArrowLeft } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import api from '../../services/api';

const statusColors = {
  pending: 'yellow',
  processing: 'blue',
  shipped: 'orange',
  delivered: 'green',
  cancelled: 'red',
};

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState('');

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
      setLocalStatus(res.data.orderStatus);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusDropdownChange = (newStatus) => {
    setLocalStatus(newStatus);
  };

  const handleApplyStatusChange = async () => {
    if (!order || order.orderStatus === localStatus) return;
    setStatusLoading(true);
    try {
      const response = await api.put(`/orders/${order._id}/status`, { status: localStatus });
      notifications.show({ color: 'green', title: 'Order Status Updated', message: `Order status changed to ${localStatus}` });
      await fetchOrder();
      setLocalStatus(localStatus);
    } catch (err) {
      notifications.show({ color: 'red', title: 'Error', message: err.response?.data?.message || 'Failed to update status' });
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDiscardStatusChange = () => {
    setLocalStatus(order.orderStatus);
  };

  if (loading) {
    return <Group justify="center" mt="xl"><Loader size="lg" /></Group>;
  }
  if (error) {
    return <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">{error}</Alert>;
  }
  if (!order) return null;

  return (
    <Box maw={900} mx="auto" my="xl">
      <Button variant="subtle" leftSection={<IconArrowLeft size={18} />} mb="md" onClick={() => navigate(-1)}>
        Back to Orders
      </Button>
      <Paper radius="md" p="xl" withBorder shadow="sm">
        <Group justify="space-between" align="flex-start" mb="md">
          <Stack gap={0}>
            <Title order={2}>Order #{order._id.slice(-8)}</Title>
            <Text size="sm" c="dimmed">Placed: {new Date(order.createdAt).toLocaleString()}</Text>
          </Stack>
          <Badge color={statusColors[order.orderStatus] || 'gray'} size="lg" radius="sm">
            {order.orderStatus}
          </Badge>
        </Group>
        <Divider my="md" />
        <Group align="flex-start" grow>
          <Stack gap="xs" w="50%">
            <Text fw={600}>Customer Information</Text>
            <Text size="sm"><b>Name:</b> {order.user?.name || 'Guest'}</Text>
            <Text size="sm"><b>Email:</b> {order.user?.email || 'No email'}</Text>
            <Text size="sm"><b>Phone:</b> {order.shippingAddress?.phone || 'Not provided'}</Text>
            <Text size="sm"><b>Payment:</b> {order.paymentStatus || 'N/A'}</Text>
          </Stack>
          <Stack gap="xs" w="50%">
            <Text fw={600}>Shipping Address</Text>
            <Text size="sm">{order.shippingAddress?.address || 'No address'}</Text>
            <Text size="sm">{order.shippingAddress?.city}, {order.shippingAddress?.state}</Text>
            <Text size="sm">PIN: {order.shippingAddress?.postalCode}</Text>
          </Stack>
        </Group>
        <Divider my="md" />
        <Text fw={600} mb="xs">Order Items</Text>
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Product</Table.Th>
              <Table.Th>Image</Table.Th>
              <Table.Th>Price</Table.Th>
              <Table.Th>Qty</Table.Th>
              <Table.Th>Subtotal</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {order.orderItems?.map((item, idx) => (
              <Table.Tr key={idx}>
                <Table.Td>
                  <Button
                    variant="subtle"
                    color="blue"
                    size="sm"
                    style={{ padding: 0, fontWeight: 600 }}
                    component="a"
                    href={`/products/${item.product}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.name}
                  </Button>
                </Table.Td>
                <Table.Td>
                  <Box
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 12,
                      overflow: 'hidden',
                      border: '1px solid #e9ecef',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f8f9fa',
                    }}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      fit="cover"
                      radius={12}
                      style={{ objectFit: 'cover', width: 80, height: 80 }}
                    />
                  </Box>
                </Table.Td>
                <Table.Td>रु{item.price}</Table.Td>
                <Table.Td>{item.quantity}</Table.Td>
                <Table.Td>रु{item.price * item.quantity}</Table.Td>
                <Table.Td>
                  <Button
                    variant="outline"
                    color="blue"
                    size="xs"
                    component="a"
                    href={`/products/${item.product}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Details
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        <Group justify="flex-end" mt="md">
          <Stack gap={0} align="flex-end">
            <Text fw={600}>Total: रु{order.totalPrice}</Text>
            <Text size="sm" c="dimmed">Last Updated: {new Date(order.updatedAt).toLocaleString()}</Text>
          </Stack>
        </Group>
        <Divider my="md" />
        <Group align="center" gap="md">
          <Text fw={600}>Update Status:</Text>
          <Select
            data={statusOptions}
            value={localStatus}
            onChange={handleStatusDropdownChange}
            disabled={statusLoading}
            styles={{ input: { minWidth: 180, minHeight: 36 } }}
          />
          {localStatus !== order.orderStatus && (
            <Group gap="xs">
              <Button
                color="green"
                size="xs"
                onClick={handleApplyStatusChange}
                loading={statusLoading}
                disabled={statusLoading}
              >
                Apply Changes
              </Button>
              <Button
                color="gray"
                size="xs"
                variant="outline"
                onClick={handleDiscardStatusChange}
                disabled={statusLoading}
              >
                Discard
              </Button>
            </Group>
          )}
        </Group>
      </Paper>
    </Box>
  );
};

export default OrderDetails; 