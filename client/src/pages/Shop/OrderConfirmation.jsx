import React from 'react';
import { Container, Paper, Title, Text, Group, Divider, Button } from '@mantine/core';
import { IconCheck, IconMail } from '@tabler/icons-react';
import { useLocation, Link } from 'react-router-dom';

const OrderConfirmation = () => {
  const location = useLocation();
  const { orderId, totalPrice } = location.state || {};

  return (
    <Container size="sm" py="xl">
      <Paper radius="md" p="xl" withBorder shadow="md">
        <Group gap="md" align="center">
          <IconCheck size={32} color="green" />
          <Title order={2}>Order Placed Successfully!</Title>
        </Group>
        <Divider my="lg" />
        <Text size="lg" fw={500}>
          Thank you for your order. Your order ID is <b>{orderId}</b>.
        </Text>
        <Text mt="md">
          <b>Payment Method:</b> Cash on Delivery
        </Text>
        <Text>
          <b>Total Amount:</b> रु{totalPrice}
        </Text>
        <Text mt="md" c="dimmed">
          A confirmation email has been sent to your registered email address. Please check your inbox for details.
        </Text>
        <Group mt="xl">
          <Button component={Link} to="/products" color="blue">Continue Shopping</Button>
          <Button component={Link} to={`/track-order?id=${orderId}`} color="green" leftSection={<IconMail size={16} />}>
            Track Order
          </Button>
        </Group>
      </Paper>
    </Container>
  );
};

export default OrderConfirmation;