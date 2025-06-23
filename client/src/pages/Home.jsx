import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Button,
  Grid,
  Card,
  Image,
  Badge,
  Group,
  Stack,
  Paper,
  Loader,
  Alert,
  ActionIcon,
} from '@mantine/core';
import { 
  IconArrowRight, 
  IconArrowLeft, 
  IconStar, 
  IconTrendingUp,
  IconDeviceMobile,
  IconDeviceLaptop,
  IconDeviceTv,
  IconDeviceSpeaker,
  IconDeviceAirpods,
  IconDeviceWatch,
  IconPackage
} from '@tabler/icons-react';
import api from '../services/api';
import ProductCard from '../components/common/ProductCard';
import ShopByCategory from '../components/home/ShopByCategory';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state for featured products
  const [featuredPage, setFeaturedPage] = useState(1);
  const [featuredTotal, setFeaturedTotal] = useState(0);
  const [featuredLoadingMore, setFeaturedLoadingMore] = useState(false);
  
  // Pagination state for best sellers
  const [bestSellersPage, setBestSellersPage] = useState(1);
  const [bestSellersTotal, setBestSellersTotal] = useState(0);
  const [bestSellersLoadingMore, setBestSellersLoadingMore] = useState(false);
  
  const [pageSize] = useState(8); // Show 8 products initially

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch featured products with pagination
        const featuredRes = await api.get('/products', { 
          params: { isFeatured: true, pageSize: pageSize, page: 1 } 
        });
        setFeaturedProducts(featuredRes.data.products || []);
        setFeaturedTotal(featuredRes.data.total || 0);
        setFeaturedPage(1);

        // Fetch best sellers with pagination
        const bestSellersRes = await api.get('/products', { 
          params: { pageSize: pageSize, sort: 'rating', page: 1 } 
        });
        setBestSellers(bestSellersRes.data.products || []);
        setBestSellersTotal(bestSellersRes.data.total || 0);
        setBestSellersPage(1);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        setFeaturedProducts([]);
        setBestSellers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Load more featured products
  const handleLoadMoreFeatured = async () => {
    setFeaturedLoadingMore(true);
    try {
      const res = await api.get('/products', { 
        params: { isFeatured: true, pageSize: pageSize, page: featuredPage + 1 } 
      });
      setFeaturedProducts(prev => [...prev, ...(res.data.products || [])]);
      setFeaturedPage(prev => prev + 1);
      setFeaturedTotal(res.data.total || featuredTotal);
    } catch (err) {
      console.error('Error loading more featured products:', err);
    } finally {
      setFeaturedLoadingMore(false);
    }
  };

  // Load more best sellers
  const handleLoadMoreBestSellers = async () => {
    setBestSellersLoadingMore(true);
    try {
      const res = await api.get('/products', { 
        params: { pageSize: pageSize, sort: 'rating', page: bestSellersPage + 1 } 
      });
      setBestSellers(prev => [...prev, ...(res.data.products || [])]);
      setBestSellersPage(prev => prev + 1);
      setBestSellersTotal(res.data.total || bestSellersTotal);
    } catch (err) {
      console.error('Error loading more best sellers:', err);
    } finally {
      setBestSellersLoadingMore(false);
    }
  };

  const categories = [
    { name: 'TV & Audio', icon: '📺', count: '150+ Products', color: 'blue' },
    { name: 'Mobile Phones', icon: '📱', count: '200+ Products', color: 'green' },
    { name: 'Kitchen Appliances', icon: '🍳', count: '100+ Products', color: 'orange' },
    { name: 'Laptops', icon: '💻', count: '80+ Products', color: 'purple' },
    { name: 'Refrigerators', icon: '❄️', count: '60+ Products', color: 'cyan' },
    { name: 'Washing Machines', icon: '🧺', count: '40+ Products', color: 'pink' },
  ];

  const brands = [
    { name: 'Samsung', icon: IconDeviceMobile, color: 'blue' },
    { name: 'Apple', icon: IconDeviceLaptop, color: 'gray' },
    { name: 'Sony', icon: IconDeviceTv, color: 'blue' },
    { name: 'LG', icon: IconDeviceSpeaker, color: 'red' },
    { name: 'Panasonic', icon: IconDeviceAirpods, color: 'blue' },
    { name: 'Whirlpool', icon: IconDeviceWatch, color: 'blue' },
  ];

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text>Loading amazing products...</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" py="xl">
        <Alert color="red" title="Error" variant="light" mb="lg">
          {error}
        </Alert>
        <Button 
          component={Link} 
          to="/products" 
          variant="outline"
          leftSection={<IconArrowRight size={16} />}
        >
          Browse All Products
        </Button>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      {/* Hero Section */}
      <Paper radius="md" p="xl" withBorder shadow="md" mb="xl" 
        style={{ 
          background: 'linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-cyan-6) 100%)',
          color: 'white'
        }}>
        <Stack align="center" gap="xs">
          <Title order={1} size="2.8rem" fw={900} ta="center">
            Welcome to Electomart
          </Title>
          <Text size="lg" ta="center" maw={600} style={{ opacity: 0.9 }}>
            Your one-stop shop for the latest home appliances and gadgets. Discover top brands, best prices, and fast delivery.
          </Text>
          <Group gap="md" mt="md">
            <Button
              component={Link}
              to="/products"
              size="lg"
              radius="xl"
              variant="white"
              color="dark"
            >
              Shop Now
            </Button>
            <Button
              component={Link}
              to="/products?featured=true"
              size="lg"
              radius="xl"
              variant="outline"
              color="white"
            >
              Featured Products
            </Button>
          </Group>
        </Stack>
      </Paper>

      {/* Featured Categories */}
      <ShopByCategory />

      {/* Featured Products */}
      <Stack mb="xl">
        <Group justify="space-between" align="center">
          <Title order={2} size="1.8rem" fw={700}>
            Featured Products
          </Title>
          <Button component={Link} to="/products?featured=true" variant="subtle" rightSection={<IconArrowRight size={16} />}>
            View All
          </Button>
        </Group>
        {featuredProducts.length > 0 ? (
          <>
            <Grid gutter="md">
              {featuredProducts.map((product) => (
                <Grid.Col key={product._id} span={{ base: 12, sm: 6, md: 3 }}>
                  <ProductCard product={product} showStatus={false} showStock={false} />
                </Grid.Col>
              ))}
            </Grid>
            
            {/* Load More Button for Featured Products */}
            {featuredProducts.length < featuredTotal && (
              <Group justify="center" mt="lg">
                <Button 
                  onClick={handleLoadMoreFeatured} 
                  loading={featuredLoadingMore} 
                  size="md" 
                  variant="light"
                  color="blue"
                >
                  Load More Featured Products ({featuredProducts.length} of {featuredTotal})
                </Button>
              </Group>
            )}
          </>
        ) : (
          <Paper p="xl" withBorder>
            <Stack align="center" gap="md">
              <ActionIcon size="xl" variant="light" color="blue" radius="xl">
                <IconPackage size={48} />
              </ActionIcon>
              <Title order={3} size="h4" ta="center">
                No Featured Products Yet
              </Title>
              <Text ta="center" c="dimmed" maw={500}>
                Our featured products section is currently empty. Check back soon for amazing deals and top-rated products!
              </Text>
              <Button 
                component={Link} 
                to="/products" 
                variant="outline"
                leftSection={<IconArrowRight size={16} />}
              >
                Browse All Products
              </Button>
            </Stack>
          </Paper>
        )}
      </Stack>

      {/* Best Sellers */}
      <Stack mb="xl">
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <IconTrendingUp size={24} color="var(--mantine-color-orange-6)" />
            <Title order={2} size="1.8rem" fw={700}>
              Best Sellers
            </Title>
          </Group>
          <Button component={Link} to="/products?sort=rating" variant="subtle" rightSection={<IconArrowRight size={16} />}>
            View All
          </Button>
        </Group>
        {bestSellers.length > 0 ? (
          <>
            <Grid gutter="md">
              {bestSellers.map((product) => (
                <Grid.Col key={product._id} span={{ base: 12, sm: 6, md: 3 }}>
                  <ProductCard product={product} showStatus={false} showStock={false} />
                </Grid.Col>
              ))}
            </Grid>
            
            {/* Load More Button for Best Sellers */}
            {bestSellers.length < bestSellersTotal && (
              <Group justify="center" mt="lg">
                <Button 
                  onClick={handleLoadMoreBestSellers} 
                  loading={bestSellersLoadingMore} 
                  size="md" 
                  variant="light"
                  color="orange"
                >
                  Load More Best Sellers ({bestSellers.length} of {bestSellersTotal})
                </Button>
              </Group>
            )}
          </>
        ) : (
          <Paper p="xl" withBorder>
            <Stack align="center" gap="md">
              <ActionIcon size="xl" variant="light" color="orange" radius="xl">
                <IconStar size={48} />
              </ActionIcon>
              <Title order={3} size="h4" ta="center">
                No Best Sellers Yet
              </Title>
              <Text ta="center" c="dimmed" maw={500}>
                Our best sellers section is currently empty. As customers start rating products, the top-rated items will appear here!
              </Text>
              <Button 
                component={Link} 
                to="/products" 
                variant="outline"
                leftSection={<IconArrowRight size={16} />}
              >
                Browse All Products
              </Button>
            </Stack>
          </Paper>
        )}
      </Stack>

      {/* Shop by Brands */}
      <Stack mb="xl">
        <Title order={2} size="1.8rem" fw={700} ta="center">
          Shop by Brands
        </Title>
        <Grid gutter="md">
          {brands.map((brand) => (
            <Grid.Col key={brand.name} span={{ base: 6, sm: 4, md: 2 }}>
              <Card 
                shadow="sm" 
                padding="lg" 
                radius="md" 
                withBorder 
                component={Link}
                to={`/products?brand=${encodeURIComponent(brand.name)}`}
                style={{ textDecoration: 'none', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Stack align="center" gap="sm">
                  <ActionIcon size="xl" variant="light" color={brand.color} radius="xl">
                    <brand.icon size={32} />
                  </ActionIcon>
                  <Text fw={600} size="sm" ta="center">{brand.name}</Text>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Stack>

      {/* Why Choose Us */}
      <Paper radius="md" p="xl" withBorder shadow="md" mb="xl">
        <Title order={2} size="1.8rem" fw={700} ta="center" mb="lg">
          Why Choose Electomart?
        </Title>
        <Grid gutter="xl">
          <>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Stack align="center" gap="sm">
                <ActionIcon size="xl" variant="light" color="green" radius="xl">
                  <IconStar size={24} />
                </ActionIcon>
                <Text fw={600} ta="center">Quality Products</Text>
                <Text size="sm" c="dimmed" ta="center">Premium brands and authentic products</Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Stack align="center" gap="sm">
                <ActionIcon size="xl" variant="light" color="blue" radius="xl">
                  <IconTrendingUp size={24} />
                </ActionIcon>
                <Text fw={600} ta="center">Best Prices</Text>
                <Text size="sm" c="dimmed" ta="center">Competitive prices and great deals</Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Stack align="center" gap="sm">
                <ActionIcon size="xl" variant="light" color="orange" radius="xl">
                  <IconStar size={24} />
                </ActionIcon>
                <Text fw={600} ta="center">Fast Delivery</Text>
                <Text size="sm" c="dimmed" ta="center">Quick and reliable shipping</Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Stack align="center" gap="sm">
                <ActionIcon size="xl" variant="light" color="red" radius="xl">
                  <IconStar size={24} />
                </ActionIcon>
                <Text fw={600} ta="center">24/7 Support</Text>
                <Text size="sm" c="dimmed" ta="center">Round the clock customer service</Text>
              </Stack>
            </Grid.Col>
          </>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Home;
//               </ActionIcon>
//               <Text fw={600} ta="center">Best Prices</Text>
//               <Text size="sm" c="dimmed" ta="center">Competitive prices and great deals</Text>
//             </Stack>
//           </Grid.Col>
//           <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
//             <Stack align="center" gap="sm">
//               <ActionIcon size="xl" variant="light" color="orange" radius="xl">
//                 <IconStar size={24} />
//               </ActionIcon>
//               <Text fw={600} ta="center">Fast Delivery</Text>
//               <Text size="sm" c="dimmed" ta="center">Quick and reliable shipping</Text>
//             </Stack>
//           </Grid.Col>
//           <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
//             <Stack align="center" gap="sm">
//               <ActionIcon size="xl" variant="light" color="red" radius="xl">
//                 <IconStar size={24} />
//               </ActionIcon>
//               <Text fw={600} ta="center">24/7 Support</Text>
//               <Text size="sm" c="dimmed" ta="center">Round the clock customer service</Text>
//             </Stack>
//           </Grid.Col>
//         </Grid>
//       </Paper>
//     </Container>
//   );
// };

// export default Home;
