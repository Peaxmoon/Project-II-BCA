import React, { useEffect, useState } from 'react';
import { 
  Paper, 
  Title, 
  Table, 
  Text, 
  Loader, 
  Alert, 
  Group, 
  Badge, 
  Stack, 
  Button, 
  Container,
  Modal,
  TextInput,
  Divider,
  Card,
  CopyButton,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import { 
  IconAlertCircle, 
  IconSearch, 
  IconTruck, 
  IconPackage, 
  IconCheck, 
  IconClock,
  IconEye,
  IconCopy
} from '@tabler/icons-react';
import api from '../../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [trackOrderId, setTrackOrderId] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

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

  const handleTrackOrder = () => {
    if (trackOrderId.trim()) {
      window.open(`/track-order?id=${trackOrderId}`, '_blank');
      setTrackModalOpen(false);
      setTrackOrderId('');
    }
  };

  if (loading) return (
    <Container size="md" py="xl">
      <Group justify="center">
        <Loader size="lg" />
      </Group>
    </Container>
  );
  
  if (error) return (
    <Container size="md" py="xl">
      <Alert icon={<IconAlertCircle size={16} />} color="red">
        {error}
      </Alert>
    </Container>
  );

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={1} size="2.5rem" fw={900}>
            My Orders
          </Title>
          <Button 
            leftSection={<IconSearch size={16} />}
            onClick={() => setTrackModalOpen(true)}
            variant="light"
          >
            Track Order
          </Button>
        </Group>

        {orders.length === 0 ? (
          <Card shadow="sm" padding="xl" withBorder>
            <Stack align="center" gap="md">
              <IconPackage size={48} color="var(--mantine-color-gray-5)" />
              <Title order={3} size="h4" ta="center">
                No Orders Yet
              </Title>
              <Text c="dimmed" ta="center">
                You haven't placed any orders yet. Start shopping to see your orders here!
              </Text>
            </Stack>
          </Card>
        ) : (
          <Stack gap="md">
            {orders.map(order => (
              <Card key={order._id} shadow="sm" padding="lg" withBorder>
                <Stack gap="md">
                  <Group justify="space-between" align="flex-start">
                    <Stack gap="xs">
                      <Title order={3} size="h4">
                        Order #{order._id?.slice(-8)}
                        <CopyButton value={order._id} timeout={2000}>
                          {({ copied, copy }) => (
                            <Tooltip label={copied ? 'Copied!' : 'Copy Order ID'} withArrow position="right">
                              <ActionIcon
                                color={copied ? 'teal' : 'gray'}
                                variant="subtle"
                                size="sm"
                                onClick={copy}
                                ml={8}
                                style={{ verticalAlign: 'middle' }}
                              >
                                {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </CopyButton>
                      </Title>
                      <Text size="sm" c="dimmed">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </Text>
                    </Stack>
                    
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
                  <Stack gap="sm">
                    <Text fw={600}>Order Items:</Text>
                    {order.orderItems?.map((item, index) => (
                      <Group key={index} justify="space-between">
                        <Stack gap={4}>
                          <Text fw={500}>{item.name}</Text>
                          <Text size="sm" c="dimmed">Quantity: {item.quantity}</Text>
                        </Stack>
                        <Text fw={600}>रु{item.price}</Text>
                      </Group>
                    ))}
                  </Stack>

                  <Divider />

                  {/* Order Summary */}
                  <Group justify="space-between">
                    <Stack gap="xs">
                      <Text size="sm">Items: रु{order.itemsPrice}</Text>
                      <Text size="sm">Shipping: रु{order.shippingPrice}</Text>
                      <Text size="sm">Tax: रु{order.taxPrice}</Text>
                      <Text fw={700} size="lg">Total: रु{order.totalPrice}</Text>
                    </Stack>
                  </Group>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>

      {/* Track Order Modal */}
      <Modal 
        opened={trackModalOpen} 
        onClose={() => setTrackModalOpen(false)}
        title="Track Order"
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Enter an order ID to track its status
          </Text>
          <TextInput
            label="Order ID"
            placeholder="Enter order ID"
            value={trackOrderId}
            onChange={(e) => setTrackOrderId(e.target.value)}
            required
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setTrackModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTrackOrder} disabled={!trackOrderId.trim()}>
              Track Order
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default Orders;
