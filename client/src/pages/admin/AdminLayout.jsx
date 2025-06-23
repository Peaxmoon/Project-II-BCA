import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AppShell, Group, Text, Button, Stack, ActionIcon, Menu, Divider, Container } from '@mantine/core';
import { 
  IconLayoutDashboard, 
  IconBox, 
  IconClipboardList, 
  IconUsers, 
  IconLogout, 
  IconUser, 
  IconSettings,
  IconShoppingCart
} from '@tabler/icons-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const navLinks = [
  { label: 'Dashboard', icon: IconLayoutDashboard, to: '/admin' },
  { label: 'Products', icon: IconBox, to: '/admin/products' },
  { label: 'Orders', icon: IconClipboardList, to: '/admin/orders' },
  { label: 'Users', icon: IconUsers, to: '/admin/users' },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActivePage = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 280, breakpoint: 'sm', collapsed: { mobile: true } }}
      padding="md"
    >
      {/* Header */}
      <AppShell.Header p="md">
        <Group justify="space-between" align="center" h="100%">
          <Group gap="sm">
            <Text size="xl" fw={900} span role="img" aria-label="logo">🛒</Text>
            <Text size="xl" fw={900} color="blue.7">Electomart Admin</Text>
          </Group>
          <Group gap="xs">
            <Button 
              variant="subtle" 
              leftSection={<IconShoppingCart size={16} />}
              onClick={() => navigate('/')}
              size="sm"
            >
              View Store
            </Button>
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="light" size="lg">
                  <IconUser size={20} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Admin Panel</Menu.Label>
                <Menu.Item leftSection={<IconUser size={16} />}>
                  {user?.name || 'Admin User'}
                </Menu.Item>
                <Menu.Item leftSection={<IconUser size={16} />} c="dimmed">
                  {user?.email || 'admin@electomart.com'}
                </Menu.Item>
                <Divider my="xs" />
                <Menu.Item leftSection={<IconLogout size={16} />} color="red" onClick={handleLogout}>
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      {/* Sidebar */}
      <AppShell.Navbar p="md">
        <AppShell.Section>
          <Text size="lg" fw={700} mb="lg" c="dimmed">
            Admin Panel
          </Text>
        </AppShell.Section>
        
        <AppShell.Section grow>
          <Stack gap="xs">
            {navLinks.map((link) => {
              const isActive = isActivePage(link.to);
              return (
                <Button
                  key={link.label}
                  component={Link}
                  to={link.to}
                  variant={isActive ? "filled" : "subtle"}
                  color={isActive ? "blue" : "gray"}
                  leftSection={<link.icon size={18} />}
                  justify="flex-start"
                  fullWidth
                  style={{ 
                    fontWeight: isActive ? 700 : 600,
                    height: 48
                  }}
                >
                  {link.label}
                </Button>
              );
            })}
          </Stack>
        </AppShell.Section>

        <AppShell.Section>
          <Divider mb="md" />
          <Stack gap="xs">
            <Text size="sm" c="dimmed" fw={500}>Quick Stats</Text>
            <Group gap="xs">
              <Text size="xs" c="dimmed">Role: Admin</Text>
            </Group>
            <Group gap="xs">
              <Text size="xs" c="dimmed">Status: Active</Text>
            </Group>
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main>
        <Container size="xl">
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};

export default AdminLayout; 