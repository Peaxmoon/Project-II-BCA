import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Grid, Text, Group, Stack, Title, Divider, ActionIcon } from '@mantine/core';
import { 
  IconMail,
  IconPhone,
  IconMapPin,
  IconTruck,
  IconShield,
  IconCreditCard,
  IconHeadset
} from '@tabler/icons-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { label: 'All Products', to: '/products' },
      { label: 'Featured Products', to: '/products?featured=true' },
      { label: 'Best Sellers', to: '/products?sort=bestseller' },
      { label: 'New Arrivals', to: '/products?sort=newest' },
      { label: 'Deals & Offers', to: '/products?discounted=true' },
    ],
    categories: [
      { label: 'TV & Audio', to: '/products?category=TV%20%26%20Audio' },
      { label: 'Mobile Phones', to: '/products?category=Mobile%20Phones' },
      { label: 'Kitchen Appliances', to: '/products?category=Kitchen%20Appliances' },
      { label: 'Laptops', to: '/products?category=Laptops' },
      { label: 'Refrigerators', to: '/products?category=Refrigerators' },
    ],
    support: [
      { label: 'Track Order', to: '/track-order' },
      { label: 'Contact Us', to: '/contact' },
      { label: 'Help Center', to: '/help' },
      { label: 'Returns & Exchanges', to: '/returns' },
      { label: 'Shipping Info', to: '/shipping' },
    ],
    company: [
      { label: 'About Us', to: '/about' },
      { label: 'Careers', to: '/careers' },
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Blog', to: '/blog' },
    ],
  };

  const features = [
    { icon: IconTruck, title: 'Free Shipping', desc: 'On orders over रु1000' },
    { icon: IconShield, title: 'Secure Payment', desc: '100% secure checkout' },
    { icon: IconCreditCard, title: 'Easy Returns', desc: '30 day return policy' },
    { icon: IconHeadset, title: '24/7 Support', desc: 'Dedicated support' },
  ];

  return (
    <footer style={{ background: 'var(--mantine-color-gray-0)', borderTop: '1px solid var(--mantine-color-gray-3)' }}>
      {/* Features Section */}
      <Container size="lg" py="xl">
        <Grid gutter="xl">
          {features.map((feature, index) => (
            <Grid.Col key={index} span={{ base: 12, sm: 6, md: 3 }}>
              <Group gap="sm" align="flex-start">
                <ActionIcon size="lg" variant="light" color="blue" radius="xl">
                  <feature.icon size={20} />
                </ActionIcon>
                <Stack gap={4}>
                  <Text fw={600} size="sm">{feature.title}</Text>
                  <Text size="xs" c="dimmed">{feature.desc}</Text>
                </Stack>
              </Group>
            </Grid.Col>
          ))}
        </Grid>
      </Container>

      <Divider />

      {/* Main Footer Content */}
      <Container size="lg" py="xl">
        <Grid gutter="xl">
          {/* Company Info */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              <Group gap="sm">
                <Text size="xl" fw={900} span role="img" aria-label="logo">🛒</Text>
                <Text size="xl" fw={900} color="blue.7">Electomart</Text>
              </Group>
              <Text size="sm" c="dimmed" maw={300}>
                Your trusted destination for premium home appliances and cutting-edge gadgets. 
                Quality products, competitive prices, and exceptional service.
              </Text>
              <Stack gap="xs">
                <Group gap="sm">
                  <IconPhone size={16} color="var(--mantine-color-blue-6)" />
                  <Text size="sm">9814339304</Text>
                </Group>
                <Group gap="sm">
                  <IconMail size={16} color="var(--mantine-color-blue-6)" />
                  <Text size="sm">support@electomart.com</Text>
                </Group>
                <Group gap="sm">
                  <IconMapPin size={16} color="var(--mantine-color-blue-6)" />
                  <Text size="sm">Inaruwa, Nepal</Text>
                </Group>
              </Stack>
              <Group gap="xs">
                <ActionIcon variant="light" color="blue" size="md" radius="xl">
                  <IconMail size={18} />
                </ActionIcon>
                <ActionIcon variant="light" color="blue" size="md" radius="xl">
                  <IconPhone size={18} />
                </ActionIcon>
                <ActionIcon variant="light" color="blue" size="md" radius="xl">
                  <IconMapPin size={18} />
                </ActionIcon>
                <ActionIcon variant="light" color="blue" size="md" radius="xl">
                  <IconTruck size={18} />
                </ActionIcon>
              </Group>
            </Stack>
          </Grid.Col>

          {/* Shop Links */}
          <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
            <Stack gap="md">
              <Title order={4} size="h6">Shop</Title>
              {footerLinks.shop.map((link) => (
                <Text key={link.label} size="sm" component={Link} to={link.to} c="dimmed" style={{ textDecoration: 'none' }}>
                  {link.label}
                </Text>
              ))}
            </Stack>
          </Grid.Col>

          {/* Categories */}
          <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
            <Stack gap="md">
              <Title order={4} size="h6">Categories</Title>
              {footerLinks.categories.map((link) => (
                <Text key={link.label} size="sm" component={Link} to={link.to} c="dimmed" style={{ textDecoration: 'none' }}>
                  {link.label}
                </Text>
              ))}
            </Stack>
          </Grid.Col>

          {/* Support */}
          <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
            <Stack gap="md">
              <Title order={4} size="h6">Support</Title>
              {footerLinks.support.map((link) => (
                <Text key={link.label} size="sm" component={Link} to={link.to} c="dimmed" style={{ textDecoration: 'none' }}>
                  {link.label}
                </Text>
              ))}
            </Stack>
          </Grid.Col>

          {/* Company */}
          <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
            <Stack gap="md">
              <Title order={4} size="h6">Company</Title>
              {footerLinks.company.map((link) => (
                <Text key={link.label} size="sm" component={Link} to={link.to} c="dimmed" style={{ textDecoration: 'none' }}>
                  {link.label}
                </Text>
              ))}
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>

      <Divider />

      {/* Bottom Footer */}
      <Container size="lg" py="md">
        <Group justify="space-between" align="center">
          <Text size="sm" c="dimmed">
            &copy; {currentYear} Electomart. All rights reserved.
          </Text>
          <Group gap="md">
            <Text size="sm" component={Link} to="/privacy" c="dimmed" style={{ textDecoration: 'none' }}>
              Privacy Policy
            </Text>
            <Text size="sm" component={Link} to="/terms" c="dimmed" style={{ textDecoration: 'none' }}>
              Terms of Service
            </Text>
          </Group>
        </Group>
      </Container>
  </footer>
  );
};

export default Footer; 