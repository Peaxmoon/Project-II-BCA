import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import {
  Container,
  Title,
  Text,
  Group,
  Loader,
  Alert,
  Stack,
  Paper,
  Button,
  Grid,
  Badge,
  ActionIcon,
  Divider,
  Card,
  Image,
  Box,
  rem
} from '@mantine/core';
import {
  IconAlertCircle,
  IconShoppingCart,
  IconArrowRight,
  IconMoodEmpty,
  IconX,
  IconMinus,
  IconPlus,
  IconArrowLeft,
  IconTrash
} from '@tabler/icons-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// --- Debounce utility ---
function useDebouncedCallback(callback, delay) {
  const timeout = useRef();
  return (...args) => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => callback(...args), delay);
  };
}

const Cart = () => {
    const { user } = useAuth();
  const { cart, loading, error, updateCartItem, removeCartItem, clearCart } = useCart();
  const [products, setProducts] = useState([]);
  const [fetching, setFetching] = useState(false);

  // --- 1. Local cart state for instant UI update ---
  const [localCartItems, setLocalCartItems] = useState([]);

  // Sync localCartItems with context cart.items when cart changes
  useEffect(() => {
    setLocalCartItems(cart.items.map(item => ({ ...item })));
  }, [cart.items]);

  // Only fetch products if product IDs change (not on every quantity change)
  const productIds = useMemo(
    () => cart.items.map(item => item.product._id || item.product).sort().join(','),
    [cart.items]
  );

  useEffect(() => {
    if (!productIds || fetching) return; // Avoid duplicate fetches
    if (!user) {
      setProducts([]);
      setFetching(false);
      return;
    }
    if (!productIds) {
      setProducts([]);
      setFetching(false);
      return;
    }
    setFetching(true);
    api.get('/products', { params: { ids: productIds } })
      .then(res => setProducts(res.data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setFetching(false));
  }, [productIds, user]);

  const [updating, setUpdating] = useState({}); // { [productId]: boolean }

  // --- Debounced backend sync ---
  const debouncedUpdateCart = useDebouncedCallback(async (productId, quantity) => {
    setUpdating(prev => ({ ...prev, [productId]: true }));
    try {
      await updateCartItem(productId, quantity);
    } catch (e) {
      // Optionally revert local state or show error
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  }, 1000);

  // --- 2. Handle quantity change locally and sync to backend (debounced) ---
  const handleQtyChange = (productId, delta) => {
    setLocalCartItems(prev =>
      prev.map(item =>
        item.product === productId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
    const newQty = (localCartItems.find(item => item.product === productId)?.quantity || 1) + delta;
    debouncedUpdateCart(productId, Math.max(1, newQty));
  };

  // --- 3. Calculate subtotal/total in real-time from localCartItems ---
  const cartSubtotal = useMemo(() => {
    return localCartItems.reduce((sum, item) => {
      const product = products.find(p => p._id === item.product);
      if (!product) return sum;
      const price = product.isDiscounted ? product.afterDiscountPrice : product.InitialPrice;
      return sum + price * item.quantity;
    }, 0);
  }, [localCartItems, products]);

  const cartTotalQuantity = useMemo(() =>
    localCartItems.reduce((sum, item) => sum + item.quantity, 0),
    [localCartItems]
  );

  // --- 4. UI ---
  return (
    <Box style={{ background: '#f8fafc', minHeight: '100vh', paddingTop: rem(24), paddingBottom: rem(24) }}>
      <Container size="lg" px={0} style={{ maxWidth: 1280 }}>
        <Paper
          radius="md"
          p="md"
          withBorder
          shadow="xs"
          style={{
            background: 'white',
            marginBottom: rem(18),
            overflow: 'hidden',
            border: '1.5px solid #e3e8ef',
          }}
        >
          <Group justify="space-between" align="center" mb={8}>
            <Group gap={8}>
              <IconShoppingCart size={28} />
              <Title order={2} size="h2" fw={800} style={{ letterSpacing: -1, marginBottom: 0 }}>
                Cart
              </Title>
              {localCartItems.length > 0 && (
                <Badge size="md" variant="light" color="blue" ml={4}>
                  {cartTotalQuantity} {cartTotalQuantity === 1 ? 'item' : 'items'}
                </Badge>
              )}
            </Group>
            {localCartItems.length > 0 && (
              <Button
                variant="subtle"
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={clearCart}
                size="xs"
              >
                Clear Cart
              </Button>
            )}
          </Group>
          <Divider mb={8} />
          {(loading || fetching) ? (
            <Group align="center" justify="center" py="xl">
              <Loader size="md" />
              <Text>Loading...</Text>
            </Group>
          ) : error && (error.toLowerCase().includes('unauthorized') || error.toLowerCase().includes('log in')) ? (
            <Alert color="blue" title="Login Required" icon={<IconAlertCircle size={16} />}>
              <Stack gap="md">
                <Text>Please log in to view and manage your cart.</Text>
                <Button
                  component={Link}
                  to="/auth/login"
                  variant="filled"
                  color="blue"
                  size="sm"
                >
                  Login Now
                </Button>
              </Stack>
            </Alert>
          ) : localCartItems.length === 0 ? (
            <Group align="center" justify="center" py="xl" style={{ minHeight: 180 }}>
              <ActionIcon size={54} variant="light" color="blue" radius="xl" style={{ background: '#e7f0fd' }}>
                <IconMoodEmpty size={36} />
              </ActionIcon>
              <Stack gap={2} align="center">
                <Title order={4} size="h4" fw={700}>Your Cart is Empty</Title>
                <Text c="dimmed" size="sm" ta="center">
                  Looks like you haven't added any products yet.
                </Text>
                <Button
                  component={Link}
                  to="/products"
                  size="sm"
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'indigo', deg: 90 }}
                  leftSection={<IconArrowRight size={16} />}
                  mt={4}
                >
                  Start Shopping
                </Button>
              </Stack>
            </Group>
          ) : (
            <Box>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1100 }}>
                <thead>
                  <tr style={{ background: '#f1f3f5' }}>
                    <th style={{ padding: 8, fontWeight: 700, fontSize: 15, textAlign: 'left', width: 110 }}>Image</th>
                    <th style={{ padding: 8, fontWeight: 700, fontSize: 15, textAlign: 'left' }}>Name</th>
                    <th style={{ padding: 8, fontWeight: 700, fontSize: 15, textAlign: 'center' }}>Price</th>
                    <th style={{ padding: 8, fontWeight: 700, fontSize: 15, textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: 8, fontWeight: 700, fontSize: 15, textAlign: 'center' }}>Total</th>
                    <th style={{ padding: 8, fontWeight: 700, fontSize: 15, textAlign: 'center' }}>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {localCartItems.map((item) => {
                    const product = products.find(p => p._id === item.product);
                    if (!product) return null;
                    const price = product.isDiscounted ? product.afterDiscountPrice : product.InitialPrice;
                    return (
                      <tr key={item.product} style={{ borderBottom: '1px solid #f1f3f5', background: '#fff' }}>
                        <td style={{ padding: 8, width: 100, minWidth: 100, maxWidth: 110 }}>
                          <Image
                            src={item.image || product.featuredImage || (product.images[0] && product.images[0].url)}
                            alt={item.name}
                            width={80}
                            height={80}
                            fit="cover"
                            radius="sm"
                            fallbackSrc="https://via.placeholder.com/80x80?text=No+Image"
                            style={{ border: '1px solid #e3e8ef', background: '#f8fafc', minWidth: 80, minHeight: 80, maxWidth: 100, maxHeight: 100, objectFit: 'contain' }}
                          />
                        </td>
                        <td style={{ padding: 8, maxWidth: 180 }}>
                          <Text fw={600} size="sm" lineClamp={2}>{item.name}</Text>
                          <Text size="xs" c="dimmed">{product.brand} • {product.category}</Text>
                        </td>
                        <td style={{ padding: 8, textAlign: 'center' }}>
                          <Group gap={4} align="center" justify="center">
                            <Text fw={700} size="sm" c={product.isDiscounted ? 'red' : undefined}>
                              रु{price}
                            </Text>
                            {product.isDiscounted && (
                              <Text size="xs" c="dimmed" td="line-through">
                                रु{product.InitialPrice}
                              </Text>
                            )}
                          </Group>
                        </td>
                        <td style={{ padding: 8, textAlign: 'center' }}>
                          <Group gap={0} align="center" justify="center">
                            <ActionIcon
                              variant="light"
                              size="sm"
                              color="blue"
                              radius="xl"
                              onClick={() => handleQtyChange(item.product, -1)}
                              disabled={item.quantity <= 1 || updating[item.product]}
                              style={{ background: '#f1f3f5' }}
                            >
                              <IconMinus size={14} />
                            </ActionIcon>
                            <Text fw={700} size="sm" style={{ minWidth: 24, textAlign: 'center' }}>
                              {item.quantity}
                            </Text>
                            <ActionIcon
                              variant="light"
                              size="sm"
                              color="blue"
                              radius="xl"
                              onClick={() => handleQtyChange(item.product, 1)}
                              disabled={item.quantity >= product.stock || updating[item.product]}
                              style={{ background: '#f1f3f5' }}
                            >
                              <IconPlus size={14} />
                            </ActionIcon>
                          </Group>
                        </td>
                        <td style={{ padding: 8, textAlign: 'center' }}>
                          <Text fw={700} size="sm" c="indigo">
                            रु{price * item.quantity}
                          </Text>
                        </td>
                        <td style={{ padding: 8, textAlign: 'center' }}>
                          <ActionIcon
                            variant="light"
                            color="red"
                            size="md"
                            radius="xl"
                            onClick={() => removeCartItem(item.product)}
                            title="Remove item"
                            style={{
                              background: '#fff',
                              border: '1.5px solid #ffe3e3'
                            }}
                          >
                            <IconX size={22} />
                          </ActionIcon>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Box>
          )}
        </Paper>
        {/* Summary */}
        {localCartItems.length > 0 && (
          <Paper
            radius="md"
            p="md"
            withBorder
            shadow="xs"
            style={{
              background: '#f8fafc',
              minWidth: 240,
              maxWidth: 400,
              margin: '0 auto',
              marginTop: rem(10),
              position: 'sticky',
              bottom: 0,
              zIndex: 2,
            }}
          >
            <Stack gap={6}>
              <Group justify="space-between">
                <Text>Subtotal:</Text>
                <Text fw={700}>रु{cartSubtotal}</Text>
              </Group>
              <Group justify="space-between">
                <Text>Shipping:</Text>
                <Text fw={700}>रु{cartSubtotal > 5000 ? 0 : 500}</Text>
              </Group>
              <Group justify="space-between">
                <Text>Tax:</Text>
                <Text fw={700}>रु{Math.round(cartSubtotal * 0.13)}</Text>
              </Group>
              <Divider />
              <Group justify="space-between">
                <Text size="md" fw={900}>Total:</Text>
                <Text size="md" fw={900} c="blue">
                  रु{cartSubtotal + (cartSubtotal > 5000 ? 0 : 500) + Math.round(cartSubtotal * 0.13)}
                </Text>
              </Group>
              <Group gap={8} mt={4}>
                <Button
                  component={Link}
                  to="/checkout"
                  size="sm"
                  fullWidth
                  gradient={{ from: 'blue', to: 'indigo', deg: 90 }}
                  variant="gradient"
                  leftSection={<IconArrowRight size={16} />}
                  style={{ fontWeight: 700, fontSize: 16, letterSpacing: -0.5 }}
                >
                  Checkout
                </Button>
                <Button
                  component={Link}
                  to="/products"
                  variant="outline"
                  size="sm"
                  fullWidth
                  leftSection={<IconArrowLeft size={15} />}
                  style={{ fontWeight: 600 }}
                >
                  Continue Shopping
                </Button>
              </Group>
            </Stack>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default Cart;