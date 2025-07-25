import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Title, 
  Text, 
  TextInput, 
  Button, 
  Stack, 
  Alert, 
  Card, 
  Group, 
  Badge, 
  Divider,
  Loader,
  Timeline,
  CopyButton,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import { 
  IconAlertCircle, 
  IconTruck, 
  IconPackage, 
  IconCheck, 
  IconClock,
  IconSearch,
  IconCopy
} from '@tabler/icons-react';
import api from '../services/api';

// Anyone can enter an order ID to view the status and details of that order.
// The logic is handled in the `handleTrackOrder` function and the UI updates accordingly.

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Check for order ID in URL parameters
  useEffect(() => {
    const urlOrderId = searchParams.get('id');
    if (urlOrderId) {
      setOrderId(urlOrderId);
      handleTrackOrder(null, urlOrderId);
    }
  }, [searchParams]);

  const handleTrackOrder = async (e, orderIdToTrack = null) => {
    if (e) e.preventDefault();
    
    const idToTrack = orderIdToTrack || orderId;
    if (!idToTrack.trim()) {
      setError('Please enter an order ID');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await api.get(`/orders/${idToTrack}`);
      setOrder(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found. Please check your order ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleKhaltiPayment = async (advance = false) => {
    if (!order) return;
    setPaymentLoading(true);
    try {
      const amount = advance
        ? Math.round(Number(order.totalPrice) * 0.4)
        : Number(order.totalPrice);
      const res = await api.post('/payments/khalti/initiate', {
        amount,
        orderId: order._id,
        name: order.shippingAddress?.fullName,
        email: order.user?.email || '',
        phone: order.shippingAddress?.phone || ''
      });
      window.location.href = res.data.payment_url;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing': return 'blue';
      case 'shipped': return 'orange';
      case 'delivered': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing': return IconClock;
      case 'shipped': return IconTruck;
      case 'delivered': return IconCheck;
      case 'cancelled': return IconAlertCircle;
      default: return IconPackage;
    }
  };

  const getTimelineItems = (order) => {
    const items = [
      {
        title: 'Order Placed',
        description: 'Your order has been successfully placed',
        date: new Date(order.createdAt).toLocaleDateString(),
        color: 'green',
        icon: IconCheck
      }
    ];

    if (order.orderStatus === 'pending') {
      items.push({
        title: 'Pending',
        description: 'Your order is pending and awaiting processing',
        date: new Date(order.createdAt).toLocaleDateString(),
        color: 'gray',
        icon: IconClock
      });
    }

    if (order.isPaid) {
      items.push({
        title: 'Payment Confirmed',
        description: 'Payment has been received and confirmed',
        date: order.paidAt ? new Date(order.paidAt).toLocaleDateString() : new Date(order.createdAt).toLocaleDateString(),
        color: 'green',
        icon: IconCheck
      });
    }

    if (["processing", "shipped", "delivered", "cancelled"].includes(order.orderStatus)) {
      items.push({
        title: 'Processing',
        description: 'Your order is being prepared for shipment',
        date: new Date(order.createdAt).toLocaleDateString(),
        color: 'blue',
        icon: IconClock
      });
    }

    if (["shipped", "delivered", "cancelled"].includes(order.orderStatus)) {
      items.push({
        title: 'Shipped',
        description: 'Your order has been shipped',
        date: order.shippedAt ? new Date(order.shippedAt).toLocaleDateString() : new Date(order.updatedAt || order.createdAt).toLocaleDateString(),
        color: 'orange',
        icon: IconTruck
      });
    }

    if (order.orderStatus === 'delivered') {
      items.push({
        title: 'Delivered',
        description: 'Your order has been delivered',
        date: order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : new Date(order.updatedAt || order.createdAt).toLocaleDateString(),
        color: 'green',
        icon: IconCheck
      });
    }

    if (order.orderStatus === 'cancelled') {
      items.push({
        title: 'Cancelled',
        description: 'Your order has been cancelled',
        date: new Date(order.updatedAt || order.createdAt).toLocaleDateString(),
        color: 'red',
        icon: IconAlertCircle
      });
    }

    return items;
  };

  return (
    <Container size="md" py="xl">
      <Paper radius="md" p="xl" withBorder shadow="md">
        <Stack align="center" gap="lg">
          <Title order={1} size="2.5rem" fw={900} ta="center">
            Track Your Order
          </Title>
          <Text size="lg" c="dimmed" ta="center" maw={500}>
            Enter your order ID to track the status of your order and get real-time updates on delivery.
          </Text>

          {/* Track Order Form */}
          <Paper radius="md" p="lg" withBorder style={{ width: '100%', maxWidth: 500 }}>
            <form onSubmit={handleTrackOrder}>
              <Stack gap="md">
                <TextInput
                  label="Order ID"
                  placeholder="Enter your order ID (e.g., 507f1f77bcf86cd799439011)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  required
                  size="lg"
                />
                <Button 
                  type="submit" 
                  fullWidth 
                  size="lg"
                  loading={loading}
                  leftSection={<IconSearch size={20} />}
                >
                  Track Order
                </Button>
              </Stack>
            </form>
          </Paper>

          {/* Error Message */}
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" style={{ width: '100%', maxWidth: 500 }}>
              {error}
            </Alert>
          )}

          {/* Order Details */}
          {order && (
            <Paper radius="md" p="xl" withBorder style={{ width: '100%' }}>
              <Stack gap="lg">
                <Group justify="space-between" align="center" mb="sm" wrap="wrap">
                  <Group gap="md" align="center">
                    <Group gap="xs" align="center">
                      <Text fw={700} size="lg">
                        Order #{order._id?.slice(-8)}
                      </Text>
                      <CopyButton value={order._id} timeout={2000}>
                        {({ copied, copy }) => (
                          <Tooltip label={copied ? 'Copied!' : 'Copy Order ID'} withArrow position="right">
                            <ActionIcon
                              color={copied ? 'teal' : 'blue'}
                              variant="light"
                              size="sm"
                              onClick={copy}
                              style={{ marginLeft: 4 }}
                            >
                              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>
                    </Group>
                    <Text size="sm" c="dimmed">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </Text>
                    {order.orderStatus === 'delivered' && (
                      <Text size="sm" c="green" fw={600}>
                        Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                      </Text>
                    )}
                  </Group>
                  <Badge 
                    size="lg" 
                    color={getStatusColor(order.orderStatus)}
                    leftSection={React.createElement(getStatusIcon(order.orderStatus), { size: 16 })}
                  >
                    {order.orderStatus?.toUpperCase() || 'PROCESSING'}
                  </Badge>
                </Group>
                <Text size="xs" c="dimmed" mb={8}>
                  <b>Note:</b> You can copy the full order ID above and share it with friends or support. Anyone with this ID can track the order status using the Track Order page.
                </Text>

                <Divider />

                {/* Order Items */}
                <Stack gap="md">
                  <Title order={3} size="h4">Order Items</Title>
                  {order.orderItems?.map((item, index) => (
                    <Card key={index} shadow="sm" padding="md" withBorder>
                      <Group justify="space-between">
                        <Stack gap="xs">
                          <Text fw={500}>{item.name}</Text>
                          <Text size="sm" c="dimmed">Quantity: {item.quantity}</Text>
                        </Stack>
                        <Text fw={600}>रु{item.price}</Text>
                      </Group>
                    </Card>
                  ))}
                </Stack>

                <Divider />


                {/* Timeline and status only, no shipping/payment details */}
                <Divider />

                {/* Order Timeline */}
                <Stack gap="md">
                  <Title order={3} size="h4">Order Timeline</Title>
                  <Timeline active={getTimelineItems(order).length - 1} bulletSize={24} lineWidth={2}>
                    {getTimelineItems(order).map((item, index) => (
                      <Timeline.Item 
                        key={index} 
                        bullet={<item.icon size={12} />} 
                        title={item.title}
                        color={item.color}
                      >
                        <Text size="sm" c="dimmed">{item.description}</Text>
                        <Text size="xs" c="dimmed" mt={4}>{item.date}</Text>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Stack>

                <Divider />

                {/* Order Summary */}
                <Card shadow="sm" padding="lg" withBorder>
                  <Stack gap="md">
                    <Title order={3} size="h4">Order Summary</Title>
                    <Group justify="space-between">
                      <Text>Items Price:</Text>
                      <Text>रु{order.itemsPrice}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text>Shipping:</Text>
                      <Text>रु{order.shippingPrice}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text>Tax:</Text>
                      <Text>रु{order.taxPrice}</Text>
                    </Group>
                    <Divider />
                    <Group justify="space-between">
                      <Text fw={700} size="lg">Total:</Text>
                      <Text fw={700} size="lg">रु{order.totalPrice}</Text>
                    </Group>
                  </Stack>
                </Card>

                <Divider />


                {/* Order Status Legend */}
                <Stack gap="xs" mt="lg">
                  <Title order={4} size="h5">Order Status Explanation</Title>
                  <Text size="sm"><b>Order Placed</b>: Your order has been successfully placed in our system.</Text>
                  <Text size="sm"><b>Payment Confirmed</b>: We have received and confirmed your payment.</Text>
                  <Text size="sm"><b>Processing</b>: Your order is being prepared for shipment.</Text>
                  <Text size="sm"><b>Shipped</b>: Your order has left our warehouse and is on its way to you.</Text>
                  <Text size="sm"><b>Delivered</b>: Your order has been delivered to your address.</Text>
                  <Text size="sm"><b>Cancelled</b>: Your order has been cancelled and will not be delivered.</Text>
                </Stack>
              </Stack>
            </Paper>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default TrackOrder;