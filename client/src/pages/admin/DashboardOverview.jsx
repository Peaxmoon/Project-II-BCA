import React, { useEffect, useState } from 'react';
import { 
  Title, 
  Text, 
  Paper, 
  Grid, 
  Group, 
  Stack, 
  Card, 
  Badge, 
  Loader, 
  Alert,
  ActionIcon,
  Button
} from '@mantine/core';
import { 
  IconUsers, 
  IconShoppingCart, 
  IconPackage, 
  IconCurrencyDollar,
  IconTrendingUp,
  IconAlertCircle,
  IconArrowRight
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AdminLayout from './AdminLayout';
const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Fetch basic stats
      const [usersRes, productsRes, ordersRes] = await Promise.all([
        api.get('/users'),
        api.get('/products?page=1&pageSize=1'), // Only need total count
        api.get('/orders')
      ]);

      const totalUsers = usersRes.data.length;
      const totalProducts = productsRes.data.total || 0; // Use total from API
      const totalOrders = ordersRes.data.length;
      const totalRevenue = ordersRes.data.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

      // Get recent orders (last 5)
      const recentOrders = ordersRes.data.slice(0, 5);

      // Get all products for low stock (fetch all, or just enough for dashboard)
      // If you expect more than 1000 products, use a higher pageSize or implement a backend endpoint for low stock
      const allProductsRes = await api.get('/products?page=1&pageSize=1000');
      const lowStockProducts = allProductsRes.data.products?.filter(p => p.stock < 10) || [];

      setStats({
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        recentOrders,
        lowStockProducts
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: IconUsers,
      color: 'blue',
      link: '/admin/users'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts, // <-- Use stats.totalProducts directly
      icon: IconPackage,
      color: 'green',
      link: '/admin/products'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: IconShoppingCart,
      color: 'orange',
      link: '/admin/orders'
    },
    {
      title: 'Total Revenue',
      value: `रु${stats.totalRevenue.toLocaleString()}`,
      icon: IconCurrencyDollar,
      color: 'purple',
      link: '/admin/orders'
    }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <Group justify="center" mt="xl">
          <Loader size="lg" />
        </Group>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Title order={1} size="2rem" fw={700} mb="lg">
        Admin Dashboard
      </Title>
      
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mb="lg">
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid gutter="lg" mb="xl">
        {statCards.map((stat, index) => (
          <Grid.Col key={index} span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" align="flex-start">
                <Stack gap="xs">
                  <Text size="sm" c="dimmed" fw={500}>
                    {stat.title}
                  </Text>
                  <Text size="xl" fw={700} c={`${stat.color}.7`}>
                    {stat.value}
                  </Text>
                </Stack>
                <ActionIcon 
                  variant="light" 
                  color={stat.color} 
                  size="lg" 
                  radius="xl"
                  component={Link}
                  to={stat.link}
                >
                  <stat.icon size={20} />
                </ActionIcon>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      <Grid gutter="lg">
        {/* Recent Orders */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper radius="md" p="lg" withBorder shadow="sm">
            <Group justify="space-between" mb="md">
              <Title order={3} size="h4">Recent Orders</Title>
              <Button 
                variant="subtle" 
                size="sm" 
                component={Link} 
                to="/admin/orders"
                rightSection={<IconArrowRight size={14} />}
              >
                View All
              </Button>
            </Group>
            <Stack gap="sm">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order, index) => (
                  <Group key={index} justify="space-between" p="xs" style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: '8px' }}>
                    <Stack gap={4}>
                      <Text size="sm" fw={500}>Order #{order._id?.slice(-6) || 'N/A'}</Text>
                      <Text size="xs" c="dimmed">{order.orderItems?.length || 0} items</Text>
                    </Stack>
                    <Stack gap={4} align="flex-end">
                      <Text size="sm" fw={600}>रु{order.totalPrice || 0}</Text>
                      <Badge size="xs" color={order.orderStatus === 'delivered' ? 'green' : 'blue'}>
                        {order.orderStatus || 'processing'}
                      </Badge>
                    </Stack>
                  </Group>
                ))
              ) : (
                <Text size="sm" c="dimmed" ta="center" py="md">
                  No recent orders
                </Text>
              )}
            </Stack>
          </Paper>
        </Grid.Col>

        {/* Low Stock Products */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper radius="md" p="lg" withBorder shadow="sm">
            <Group justify="space-between" mb="md">
              <Title order={3} size="h4">Low Stock Alert</Title>
              <Button 
                variant="subtle" 
                size="sm" 
                component={Link} 
                to="/admin/products"
                rightSection={<IconArrowRight size={14} />}
              >
                Manage Products
              </Button>
            </Group>
            <Stack gap="sm">
              {stats.lowStockProducts.length > 0 ? (
                stats.lowStockProducts.map((product, index) => (
                  <Group key={index} justify="space-between" p="xs" style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: '8px' }}>
                    <Stack gap={4}>
                      <Text size="sm" fw={500} lineClamp={1}>{product.name}</Text>
                      <Text size="xs" c="dimmed">{product.brand}</Text>
                    </Stack>
                    <Badge size="xs" color="red">
                      {product.stock} left
                    </Badge>
                  </Group>
                ))
              ) : (
                <Text size="sm" c="dimmed" ta="center" py="md">
                  All products have sufficient stock
                </Text>
              )}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Quick Actions */}
      <Paper radius="md" p="lg" withBorder shadow="sm" mt="lg">
        <Title order={3} size="h4" mb="md">Quick Actions</Title>
        <Group gap="md">
          <Button 
            component={Link} 
            to="/admin/products" 
            leftSection={<IconPackage size={16} />}
            variant="light"
          >
            Add New Product
          </Button>
          <Button 
            component={Link} 
            to="/admin/orders" 
            leftSection={<IconShoppingCart size={16} />}
            variant="light"
          >
            View Orders
          </Button>
          <Button 
            component={Link} 
            to="/admin/users" 
            leftSection={<IconUsers size={16} />}
            variant="light"
          >
            Manage Users
          </Button>
        </Group>
      </Paper>
    </AdminLayout>
  );
};

export default DashboardOverview;