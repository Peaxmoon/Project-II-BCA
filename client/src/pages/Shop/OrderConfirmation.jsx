import React, { useEffect, useState } from 'react';
import { Container, Paper, Title, Text, Group, Divider, Button } from '@mantine/core';
import { IconCheck, IconMail } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

function useQuery() {
  return new URLSearchParams(window.location.search);
}

const OrderConfirmation = () => {
  const query = useQuery();
  const [orderDetails, setOrderDetails] = useState({});

  useEffect(() => {
    const orderId = query.get('purchase_order_id') || query.get('orderId');
    const totalPrice = query.get('amount') || query.get('total_amount');
    const txnId = query.get('txnId') || query.get('transaction_id');
    const mobile = query.get('mobile');
    const paymentMethod = query.get('payment_method') || 'Cash on Delivery';

    if (orderId && totalPrice) {
      setOrderDetails({ orderId, totalPrice, txnId, mobile, paymentMethod });
    } else {
      // Fallback to local storage if details are not in URL
      const storedOrder = JSON.parse(localStorage.getItem('orderDetails'));
      if (storedOrder) {
        setOrderDetails(storedOrder);
      }
    }
  }, [query]);

  const { orderId, totalPrice, txnId, mobile, paymentMethod } = orderDetails;

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
          <b>Payment Method:</b> {paymentMethod}
        </Text>
        <Text>
          <b>Total Amount:</b> रु{totalPrice}
        </Text>
        {txnId && (
          <Text>
            <b>Transaction ID:</b> {txnId}
          </Text>
        )}
        {mobile && (
          <Text>
            <b>Mobile:</b> {mobile}
          </Text>
        )}
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