import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Title, 
  Text, 
  Button, 
  Stack, 
  Group,
  ActionIcon
} from '@mantine/core';
import { IconHome, IconArrowLeft, IconMoodEmpty } from '@tabler/icons-react';

const NotFound = () => (
  <Container size="sm" py="xl">
    <Paper radius="md" p="xl" withBorder shadow="md">
      <Stack align="center" gap="lg">
        <ActionIcon size="xl" variant="light" color="gray" radius="xl">
          <IconMoodEmpty size={48} />
        </ActionIcon>
        
        <Stack align="center" gap="xs">
          <Title order={1} size="3rem" fw={900} ta="center">
            404
          </Title>
          <Title order={2} size="1.8rem" fw={700} ta="center">
            Page Not Found
          </Title>
          <Text size="lg" c="dimmed" ta="center" maw={500}>
            Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </Text>
        </Stack>

        <Group gap="md" mt="md">
          <Button 
            component={Link} 
            to="/" 
            size="lg" 
            radius="xl"
            leftSection={<IconHome size={18} />}
          >
            Go Home
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            radius="xl"
            leftSection={<IconArrowLeft size={18} />}
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </Group>

        <Stack align="center" gap="xs" mt="lg">
          <Text size="sm" c="dimmed" ta="center">
            Or try these popular pages:
          </Text>
          <Group gap="sm">
            <Button component={Link} to="/products" variant="subtle" size="sm">
              Products
            </Button>
            <Button component={Link} to="/features" variant="subtle" size="sm">
              Features
            </Button>
            <Button component={Link} to="/cart" variant="subtle" size="sm">
              Cart
            </Button>
          </Group>
        </Stack>
      </Stack>
    </Paper>
  </Container>
);

export default NotFound;
