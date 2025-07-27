import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Title, 
  Text, 
  Paper, 
  Stack, 
  Grid, 
  Button, 
  Loader, 
  Group, 
  ActionIcon,
  Alert,
  Card,
  Badge
} from '@mantine/core';
import { 
  IconHeart, 
  IconShoppingCart, 
  IconTrash, 
  IconEye, 
  IconArrowRight,
  IconMoodEmpty,
  IconHeartOff,
  IconAlertCircle
} from '@tabler/icons-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import ProductCard from '../components/common/ProductCard';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, loading, error } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [movingToCart, setMovingToCart] = useState({});

  // If wishlist is array of IDs (guest), fetch product details
  useEffect(() => {
    const fetchProducts = async () => {
      if (wishlist.length > 0 && typeof wishlist[0] === 'string') {
        setFetching(true);
        try {
          const res = await api.get('/products', { params: { ids: wishlist.join(',') } });
          setProducts(res.data.products || []);
        } catch {
          setProducts([]);
        }
        setFetching(false);
      } else if (wishlist.length > 0 && typeof wishlist[0] === 'object') {
        setProducts(wishlist);
      } else {
        setProducts([]);
      }
    };
    fetchProducts();
  }, [wishlist]);

  const handleMoveToCart = async (product) => {
    setMovingToCart(prev => ({ ...prev, [product._id]: true }));
    try {
      await addToCart(product._id, 1);
      await removeFromWishlist(product);
    } catch (error) {
      console.error('Wishlist: Error moving to cart:', error);
    } finally {
      setMovingToCart(prev => ({ ...prev, [product._id]: false }));
    }
  };

  const handleRemoveFromWishlist = async (product) => {
    try {
      await removeFromWishlist(product);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const wishlistProducts = loading ? [] : products;

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Paper radius="md" p="xl" withBorder shadow="md" 
          style={{ 
            background: 'linear-gradient(135deg, var(--mantine-color-pink-6) 0%, var(--mantine-color-red-6) 100%)',
            color: 'white'
          }}>
          <Stack align="center" gap="xs">
            <Title order={1} size="2.5rem" fw={900} ta="center">
              My Wishlist
            </Title>
            <Text size="lg" ta="center" maw={600} style={{ opacity: 0.9 }}>
              Save your favorite products for later
            </Text>
            {wishlistProducts.length > 0 && (
              <Badge size="lg" variant="white" color="dark">
                {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} in wishlist
              </Badge>
            )}
          </Stack>
        </Paper>

        {/* Wishlist Items */}
        {loading ? (
          <Stack align="center" gap="md" py="xl">
            <Loader size="lg" />
            <Text>Loading your wishlist...</Text>
          </Stack>
        ) : error && (error.toLowerCase().includes('log in') || error.toLowerCase().includes('unauthorized')) ? (
          <Alert icon={<IconAlertCircle size={16} />} color="blue" title="Login Required">
            <Stack gap="md">
              <Text>Please log in to view and manage your wishlist.</Text>
              <Button
                component={Link}
                to="/login"
                variant="filled"
                color="blue"
                size="sm"
              >
                Login Now
              </Button>
            </Stack>
          </Alert>
        ) : error ? (
          <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
            {error}
          </Alert>
        ) : wishlistProducts.length === 0 ? (
          <Paper p="xl" withBorder>
            <Stack align="center" gap="md">
              <ActionIcon size="xl" variant="light" color="pink" radius="xl">
                <IconHeart size={48} />
              </ActionIcon>
              <Title order={3} size="h4" ta="center">
                Your Wishlist is Empty
              </Title>
              <Text ta="center" c="dimmed" maw={500}>
                Start building your wishlist by browsing our products and adding items you love!
              </Text>
              <Button 
                component={Link} 
                to="/products" 
                variant="outline"
                leftSection={<IconArrowRight size={16} />}
              >
                Browse Products
              </Button>
            </Stack>
          </Paper>
        ) : (
          <Grid gutter="md">
            {wishlistProducts.map((product) => (
              <Grid.Col key={product._id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <ProductCard 
                  product={product} 
                  showStatus={false}
                  showStock={false}
                >
                  <Group gap="sm" mt="md">
                    <Button 
                      size="sm" 
                      variant="filled" 
                      color="blue"
                      leftSection={<IconShoppingCart size={16} />}
                      onClick={() => handleMoveToCart(product)}
                      style={{ flex: 1 }}
                    >
                      Move to Cart
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      color="red"
                      leftSection={<IconHeartOff size={16} />}
                      onClick={() => handleRemoveFromWishlist(product)}
                    >
                      Remove
                    </Button>
                  </Group>
                </ProductCard>
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Stack>
    </Container>
  );
};

export default Wishlist;