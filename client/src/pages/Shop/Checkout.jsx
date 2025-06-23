import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Title, 
  Text, 
  TextInput, 
  Textarea, 
  Select, 
  Button, 
  Stack, 
  Group, 
  Divider,
  Alert,
  Loader
} from '@mantine/core';
import { IconAlertCircle, IconShoppingCart, IconCreditCard, IconTruck } from '@tabler/icons-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const Checkout = () => {
  const { cart, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nepal',
    paymentMethod: 'cod'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    if (cart.items.length === 0 && !cartLoading) {
      navigate('/cart');
    }
  }, [cart.items.length, cartLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderData = {
        orderItems: cart.items,
        shippingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          street: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country
        },
        paymentMethod: formData.paymentMethod,
        itemsPrice: cart.totalPrice,
        shippingPrice: 0, // Free shipping
        taxPrice: Math.round(cart.totalPrice * 0.13), // 13% tax
        totalPrice: Math.round(cart.totalPrice * 1.13)
      };

      // Use correct API endpoint
      const response = await api.post('/api/orders', orderData);

      // Clear cart after successful order
      if (cart.clearCart) await cart.clearCart(); // If clearCart is available in context

      // Redirect to order confirmation
      navigate(`/orders?success=true&orderId=${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (cartLoading) {
    return (
      <Container size="lg" py="xl">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text>Loading checkout...</Text>
        </Stack>
      </Container>
    );
  }

  if (cart.items.length === 0) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="blue">
          Your cart is empty. Please add some items before checkout.
        </Alert>
      </Container>
    );
  }

  const totalPrice = Math.round(cart.totalPrice * 1.13); // Including 13% tax

  return (
    <Container size="lg" py="xl">
      <Paper radius="md" p="xl" withBorder shadow="md">
        <Stack gap="lg">
          <Stack align="center" gap="xs">
            <Title order={1} size="2.5rem" fw={900} ta="center">
              Checkout
            </Title>
            <Text size="lg" c="dimmed" ta="center">
              Complete your purchase
            </Text>
          </Stack>

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack gap="xl">
              {/* Shipping Information */}
              <Paper radius="md" p="lg" withBorder>
                <Stack gap="md">
                  <Group gap="sm">
                    <IconTruck size={20} color="var(--mantine-color-blue-6)" />
                    <Title order={3} size="h4">Shipping Information</Title>
                  </Group>
                  
                  <Group grow>
                    <TextInput
                      label="Full Name"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      readOnly // Make uneditable
                      required
                    />
                    <TextInput
                      label="Email"
                      placeholder="Enter your email"
                      value={formData.email}
                      type="email"
                      readOnly // Make uneditable
                      required
                    />
                  </Group>
                  
                  <TextInput
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    required
                  />
                  
                  <Textarea
                    label="Address"
                    placeholder="Enter your complete address"
                    value={formData.address || ""}
                    onChange={(e) => handleChange('address', e.target.value)}
                    required
                    minRows={2} // Only if using Mantine Textarea
                  />
                  
                  <Group grow>
                    <TextInput
                      label="City"
                      placeholder="Enter your city"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      required
                    />
                    <TextInput
                      label="State/Province"
                      placeholder="Enter your state"
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      required
                    />
                  </Group>
                  
                  <Group grow>
                    <TextInput
                      label="Postal Code"
                      placeholder="Enter postal code"
                      value={formData.postalCode}
                      onChange={(e) => handleChange('postalCode', e.target.value)}
                      required
                    />
                    <TextInput
                      label="Country"
                      value={formData.country}
                      onChange={(e) => handleChange('country', e.target.value)}
                      required
                    />
                  </Group>
                </Stack>
              </Paper>

              {/* Payment Method */}
              <Paper radius="md" p="lg" withBorder>
                <Stack gap="md">
                  <Group gap="sm">
                    <IconCreditCard size={20} color="var(--mantine-color-green-6)" />
                    <Title order={3} size="h4">Payment Method</Title>
                  </Group>
                  
                  <Select
                    label="Select Payment Method"
                    placeholder="Choose payment method"
                    data={[
                      { value: 'cod', label: 'Cash on Delivery' },
                      { value: 'card', label: 'Credit/Debit Card' },
                      { value: 'bank', label: 'Bank Transfer' }
                    ]}
                    value={formData.paymentMethod}
                    onChange={(value) => handleChange('paymentMethod', value)}
                    required
                  />
                </Stack>
              </Paper>

              {/* Order Summary */}
              <Paper radius="md" p="lg" withBorder>
                <Stack gap="md">
                  <Group gap="sm">
                    <IconShoppingCart size={20} color="var(--mantine-color-orange-6)" />
                    <Title order={3} size="h4">Order Summary</Title>
                  </Group>
                  
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text>Items ({cart.items.length}):</Text>
                      <Text>रु{cart.totalPrice}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text>Shipping:</Text>
                      <Text color="green">Free</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text>Tax (13%):</Text>
                      <Text>रु{Math.round(cart.totalPrice * 0.13)}</Text>
                    </Group>
                    <Divider />
                    <Group justify="space-between">
                      <Text fw={700} size="lg">Total:</Text>
                      <Text fw={700} size="lg" color="blue">रु{totalPrice}</Text>
                    </Group>
                  </Stack>
                </Stack>
              </Paper>

              {/* Submit Button */}
              <Button 
                type="submit" 
                size="lg" 
                loading={loading}
                disabled={cart.items.length === 0}
              >
                Place Order - रु{totalPrice}
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Checkout;
