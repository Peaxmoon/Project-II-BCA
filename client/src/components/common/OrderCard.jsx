import React from 'react';
import { Group, Stack, Text, Badge, CopyButton, ActionIcon, Tooltip, Card, Divider } from '@mantine/core';
import { IconCopy, IconCheck } from '@tabler/icons-react';

function getStatusColor(status) {
  switch (status) {
    case 'processing': return 'blue';
    case 'shipped': return 'orange';
    case 'delivered': return 'green';
    case 'cancelled': return 'red';
    default: return 'gray';
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'processing': return IconCheck;
    case 'shipped': return IconCheck;
    case 'delivered': return IconCheck;
    case 'cancelled': return IconCheck;
    default: return IconCheck;
  }
}

const OrderCard = ({ order, showSummary = true, showNote = true }) => {
  if (!order) return null;
  return (
    <Card shadow="sm" padding="lg" withBorder mb="md">
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
      {showNote && (
        <Text size="xs" c="dimmed" mb={8}>
          <b>Note:</b> You can copy the full order ID above and share it with friends or support. Anyone with this ID can track the order status using the Track Order page.
        </Text>
      )}
      <Divider />
      <Stack gap="sm" mt="sm">
        <Text fw={600}>Order Items:</Text>
        {order.orderItems?.map((item, idx) => (
          <Group key={idx} justify="space-between">
            <Stack gap={4}>
              <Text fw={500}>{item.name}</Text>
              <Text size="sm" c="dimmed">Quantity: {item.quantity}</Text>
            </Stack>
            <Text fw={600}>रु{item.price}</Text>
          </Group>
        ))}
      </Stack>
      {showSummary && (
        <>
          <Divider my="sm" />
          <Group justify="space-between">
            <Stack gap="xs">
              <Text size="sm">Items: रु{order.itemsPrice}</Text>
              <Text size="sm">Shipping: रु{order.shippingPrice}</Text>
              <Text size="sm">Tax: रु{order.taxPrice}</Text>
              <Text fw={700} size="lg">Total: रु{order.totalPrice}</Text>
            </Stack>
          </Group>
        </>
      )}
    </Card>
  );
};

export default OrderCard; 