import React from 'react';
import { Container, Title, Text, List, Paper, Stack, Grid, ActionIcon, Card, Group, Button } from '@mantine/core';
import { 
  IconShoppingCart, 
  IconShield, 
  IconTruck, 
  IconHeadset, 
  IconCreditCard, 
  IconStar,
  IconDeviceMobile,
  IconSettings,
  IconPalette,
  IconUsers,
  IconChartBar
} from '@tabler/icons-react';

const Features = () => {
  const features = [
    {
      icon: IconShoppingCart,
      title: 'Easy Shopping Experience',
      description: 'Intuitive interface with fast indexed search, advanced filtering, and wishlist functionality.',
      color: 'blue'
    },
    {
      icon: IconShield,
      title: 'Secure Transactions',
      description: 'Bank-level security with encrypted payments and data protection.',
      color: 'green'
    },
    {
      icon: IconTruck,
      title: 'Fast & Reliable Delivery',
      description: 'Quick delivery across Nepal with real-time tracking and multiple shipping options.',
      color: 'orange'
    },
    {
      icon: IconHeadset,
      title: '24/7 Customer Support',
      description: 'Round-the-clock support via phone, email, and live chat.',
      color: 'red'
    },
    {
      icon: IconCreditCard,
      title: 'Flexible Payment Options',
      description: 'Multiple payment methods including cards, digital wallets, and cash on delivery.',
      color: 'purple'
    },
    {
      icon: IconStar,
      title: 'Quality Assurance',
      description: 'Authentic products from authorized dealers with warranty coverage.',
      color: 'yellow'
    },
    {
      icon: IconDeviceMobile,
      title: 'Mobile-First Design',
      description: 'Optimized for all devices with responsive design and mobile app features.',
      color: 'cyan'
    },
    {
      icon: IconUsers,
      title: 'User Management',
      description: 'Personalized accounts with order history, preferences, and profile management.',
      color: 'pink'
    }
  ];

  const highlights = [
    'Wide selection of top brands and latest gadgets',
    'Secure and fast checkout process',
    'Personalized recommendations and wishlist',
    'Order tracking and easy returns',
    'Responsive customer support and hotline',
    'Admin dashboard for product management',
    'Mobile-friendly, modern UI with dark mode',
    'Real-time inventory management',
    'Multi-language support',
    'Advanced search and filtering',
    'Product reviews and ratings',
    'Loyalty program and rewards'
  ];

  return (
    <Container size="lg" py="xl">
      {/* Hero Section */}
      <Paper radius="md" p="xl" withBorder shadow="md" mb="xl" 
        style={{ 
          background: 'linear-gradient(135deg, var(--mantine-color-green-6) 0%, var(--mantine-color-teal-6) 100%)',
          color: 'white'
        }}>
        <Stack align="center" gap="xs">
          <Title order={1} size="2.5rem" fw={900} ta="center">
            Electomart Features
          </Title>
          <Text size="lg" ta="center" maw={600} style={{ opacity: 0.9 }}>
            Discover what makes Electomart the best place for home appliances and gadgets. 
            We combine cutting-edge technology with exceptional service to deliver an unmatched shopping experience.
          </Text>
        </Stack>
      </Paper>

      {/* Main Features Grid */}
      <Title order={2} size="1.8rem" fw={700} ta="center" mb="lg">
        Our Key Features
      </Title>
      <Grid gutter="xl" mb="xl">
        {features.map((feature, index) => (
          <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
              <Stack align="center" gap="md" ta="center">
                <ActionIcon size="xl" variant="light" color={feature.color} radius="xl">
                  <feature.icon size={28} />
                </ActionIcon>
                <Title order={3} size="h5">{feature.title}</Title>
                <Text size="sm" c="dimmed">{feature.description}</Text>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {/* Feature Highlights */}
      <Paper radius="md" p="xl" withBorder shadow="md" mb="xl">
        <Title order={2} size="1.8rem" fw={700} ta="center" mb="lg">
          What Makes Us Special
        </Title>
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md">
              <Title order={3} size="h4" color="blue.7">Shopping Experience</Title>
              <List size="lg" spacing="md">
                {highlights.slice(0, 6).map((highlight, index) => (
                  <List.Item key={index}>
                    <Text>{highlight}</Text>
                  </List.Item>
                ))}
              </List>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md">
              <Title order={3} size="h4" color="green.7">Technical Features</Title>
              <List size="lg" spacing="md">
                {highlights.slice(6).map((highlight, index) => (
                  <List.Item key={index}>
                    <Text>{highlight}</Text>
                  </List.Item>
                ))}
              </List>
            </Stack>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Technology Stack */}
      <Paper radius="md" p="xl" withBorder shadow="md" mb="xl">
        <Title order={2} size="1.8rem" fw={700} ta="center" mb="lg">
          Built with Modern Technology
        </Title>
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Stack align="center" gap="sm">
              <ActionIcon size="xl" variant="light" color="blue" radius="xl">
                <IconDeviceMobile size={24} />
              </ActionIcon>
              <Text fw={600}>React Frontend</Text>
              <Text size="sm" c="dimmed" ta="center">Modern, responsive UI</Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Stack align="center" gap="sm">
              <ActionIcon size="xl" variant="light" color="green" radius="xl">
                <IconSettings size={24} />
              </ActionIcon>
              <Text fw={600}>Node.js Backend</Text>
              <Text size="sm" c="dimmed" ta="center">Scalable API</Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Stack align="center" gap="sm">
              <ActionIcon size="xl" variant="light" color="orange" radius="xl">
                <IconChartBar size={24} />
              </ActionIcon>
              <Text fw={600}>MongoDB Database</Text>
              <Text size="sm" c="dimmed" ta="center">Flexible data storage</Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Stack align="center" gap="sm">
              <ActionIcon size="xl" variant="light" color="purple" radius="xl">
                <IconPalette size={24} />
              </ActionIcon>
              <Text fw={600}>Mantine UI</Text>
              <Text size="sm" c="dimmed" ta="center">Beautiful components</Text>
            </Stack>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Call to Action */}
      <Paper radius="md" p="xl" withBorder shadow="md" 
        style={{ 
          background: 'linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-purple-6) 100%)',
          color: 'white'
        }}>
        <Stack align="center" gap="md">
          <Title order={2} size="1.8rem" fw={700} ta="center">
            Ready to Experience Electomart?
          </Title>
          <Text size="lg" ta="center" maw={600} style={{ opacity: 0.9 }}>
            Join thousands of satisfied customers who trust Electomart for their home appliance needs.
          </Text>
          <Group gap="md">
            <Button size="lg" radius="xl" variant="white" color="dark">
              Start Shopping
            </Button>
            <Button size="lg" radius="xl" variant="outline" color="white">
              Learn More
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Features;