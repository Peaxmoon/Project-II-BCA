import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Group, Box, Text, ActionIcon, Badge, Menu, Button, Divider, TextInput, Paper, Container, Modal
} from '@mantine/core';
import {
  IconShoppingCart, IconUser, IconHeart, IconChevronDown, IconSearch, IconLogout, IconLogin, IconUserCircle, IconList, IconHome, IconPackage, IconStar, IconPhone, IconLayoutDashboard, IconTruck,
  IconDeviceTv,
  IconDeviceMobile,
  IconToolsKitchen2,
  IconDeviceLaptop,
  IconFridge,
  IconWashMachine,
  IconWindmill,
  IconDeviceWatch,
} from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import api from '../../services/api';

// Consistent category icons/colors (same as ShopByCategory)
const CATEGORY_ICONS = {
  "TV & Audio": { icon: IconDeviceTv, color: "blue" },
  "Mobile Phones": { icon: IconDeviceMobile, color: "green" },
  "Kitchen Appliances": { icon: IconToolsKitchen2, color: "orange" },
  "Laptops": { icon: IconDeviceLaptop, color: "purple" },
  "Refrigerators": { icon: IconFridge, color: "cyan" },
  "Washing Machines": { icon: IconWashMachine, color: "pink" },
  "Air Conditioners": { icon: IconWindmill, color: "teal" },
  "Small Gadgets": { icon: IconDeviceWatch, color: "gray" },
};

// Example subcategories for each main category
const SUBCATEGORIES = {
  "TV & Audio": [
    "LED TVs",
    "Smart TVs",
    "Home Theaters",
    "Soundbars",
    "Bluetooth Speakers"
  ],
  "Mobile Phones": [
    "Smartphones",
    "Feature Phones",
    "Android Phones",
    "iPhones",
    "Accessories"
  ],
  "Kitchen Appliances": [
    "Microwaves",
    "Blenders",
    "Coffee Makers",
    "Toasters",
    "Food Processors"
  ],
  "Laptops": [
    "Gaming Laptops",
    "Ultrabooks",
    "Business Laptops",
    "2-in-1 Laptops",
    "MacBooks"
  ],
  "Refrigerators": [
    "Single Door",
    "Double Door",
    "Side by Side",
    "Mini Fridges",
    "Deep Freezers"
  ],
  "Washing Machines": [
    "Front Load",
    "Top Load",
    "Semi Automatic",
    "Fully Automatic",
    "Dryers"
  ],
  "Air Conditioners": [
    "Split AC",
    "Window AC",
    "Portable AC",
    "Inverter AC",
    "Air Coolers"
  ],
  "Small Gadgets": [
    "Smart Watches",
    "Fitness Bands",
    "Earbuds",
    "Power Banks",
    "Chargers"
  ]
};

const hotline = '9814339304';

const navLinks = [
  { label: 'Home', icon: IconHome, to: '/' },
  { label: 'Products', icon: IconPackage, to: '/products' },
  { label: 'Features', icon: IconStar, to: '/features' },
  { label: 'Track Order', icon: IconTruck, to: '/track-order' },
];

const DoubleNavbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const searchTimeout = React.useRef();

  // Debounced search
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setSearchLoading(true);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await api.get(`/products/search?q=${encodeURIComponent(search)}`);
        setSearchResults(res.data || []);
        setShowDropdown(true);
      } catch {
        setSearchResults([]);
        setShowDropdown(false);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(searchTimeout.current);
  }, [search]);

  // Fetch categories from backend on mount (consistent with Products page)
  useEffect(() => {
    api.get('/products/filters')
      .then(res => {
        if (Array.isArray(res.data.categories)) setCategories(res.data.categories);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    setLogoutModalOpen(false); // Close the modal first
    await logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(search)}`);
      setShowDropdown(false);
    }
  };

  const handleResultClick = (id) => {
    navigate(`/products/${id}`);
    setShowDropdown(false);
    setSearch('');
  };

  // Improved active page detection
  const isActivePage = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Get navigation links based on user role
  const getNavLinks = () => {
    if (user?.role === 'admin') {
      return [...navLinks, { label: 'Admin', icon: IconLayoutDashboard, to: '/admin' }];
    }
    return navLinks;
  };

  return (
    <>
      {/* Top Navbar */}
      <Paper 
        shadow="xs" 
        radius={0} 
        p={0} 
        style={{ 
          borderBottom: '1px solid #e9ecef', 
          background: 'var(--mantine-color-body)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)', // subtle shadow for depth
        }}
      >
        <Container size="lg" py={10} /* increased from 4 to 10 for more space */>
          <Group justify="space-between" align="center">
            {/* Logo */}
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text size="xl" fw={900} span role="img" aria-label="logo">🛒</Text>
              <Text size="xl" fw={900} color="blue.7">Electomart</Text>
            </Link>
            {/* Main Nav Links */}
            <Group gap="md" visibleFrom="sm">
              {getNavLinks().map(link => {
                const isActive = isActivePage(link.to);
                const isAdminLink = link.to === '/admin';
                return (
                  <Button
                    key={link.label}
                    component={Link}
                    to={link.to}
                    variant={isActive ? "filled" : "subtle"}
                    color={isActive ? "blue" : isAdminLink ? "red" : "gray"}
                    leftSection={<link.icon size={18} />}
                    size="sm"
                    style={{ 
                      fontWeight: isActive ? 700 : 600, 
                      textDecoration: isActive ? 'underline' : 'none',
                      position: 'relative',
                      transform: isActive ? 'translateY(-1px)' : 'translateY(0)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {link.label}
                    {isActive && (
                      <div style={{
                        position: 'absolute',
                        bottom: -4,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '20px',
                        height: '3px',
                        backgroundColor: isAdminLink ? 'var(--mantine-color-red-6)' : 'var(--mantine-color-blue-6)',
                        borderRadius: '2px'
                      }} />
                    )}
                  </Button>
                );
              })}
            </Group>
            {/* Right Icons */}
            <Group gap="xs">
              {/* Wishlist */}
              <ActionIcon 
                variant={location.pathname === '/wishlist' ? "light" : "subtle"} 
                color={location.pathname === '/wishlist' ? "pink" : "gray"}
                size="lg" 
                component={Link} 
                to="/wishlist" 
                title="Wishlist" 
                style={{
                  position: 'relative',
                  padding: 6,
                  minWidth: 44,
                  minHeight: 44,
                  boxSizing: 'content-box',
                  overflow: 'visible',
                }}
              >
                <IconHeart size={22} />
                {(wishlist?.length || 0) > 0 && (
                  <Badge
                    size="xs"
                    variant="filled"
                    color="pink"
                    pos="absolute"
                    top={5}
                    right={-4}
                    style={{
                      minWidth: 22,
                      height: 22,
                      width: 22,
                      borderRadius: "50%",
                      fontSize: 12,
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid #fff",
                      boxShadow: "0 2px 8px rgba(255,0,128,0.12)",
                      fontWeight: 700,
                      zIndex: 10,
                    }}
                  >
                    {wishlist?.length || 0}
                  </Badge>
                )}
              </ActionIcon>
              {/* Cart */}
              <ActionIcon 
                variant={location.pathname === '/cart' ? "light" : "subtle"} 
                color={location.pathname === '/cart' ? "red" : "gray"}
                size="lg" 
                component={Link} 
                to="/cart" 
                title="Cart" 
                style={{
                  position: 'relative',
                  padding: 6,
                  minWidth: 44,
                  minHeight: 44,
                  boxSizing: 'content-box',
                  overflow: 'visible',
                }}
              >
                <IconShoppingCart size={22} />
                {(cartItems?.length || 0) > 0 && (
                  <Badge
                    size="xs"
                    variant="filled"
                    color="red"
                    pos="absolute"
                    top={2}
                    right={-7}
                    style={{
                      minWidth: 22,
                      height: 22,
                      width: 22,
                      borderRadius: "50%",
                      fontSize: 12,
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid #fff",
                      boxShadow: "0 2px 8px rgba(255,0,0,0.12)",
                      fontWeight: 700,
                    }}
                  >
                    {cartItems?.length || 0}
                  </Badge>
                )}
              </ActionIcon>
              {/* Account */}
              <Menu shadow="md" width={180} position="bottom-end">
                <Menu.Target>
                  <ActionIcon 
                    variant={location.pathname.startsWith('/profile') || location.pathname.startsWith('/orders') ? "light" : "subtle"} 
                    color={location.pathname.startsWith('/profile') || location.pathname.startsWith('/orders') ? "blue" : "gray"}
                    size="lg" 
                    title="Account"
                  >
                    <IconUserCircle size={22} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  {!user ? (
                    <>
                      <Menu.Item leftSection={<IconLogin size={16} />} onClick={() => navigate('/login')}>Login</Menu.Item>
                      <Menu.Item leftSection={<IconUser size={16} />} onClick={() => navigate('/register')}>Register</Menu.Item>
                    </>
                  ) : (
                    <>
                      <Menu.Item leftSection={<IconUser size={16} />} onClick={() => navigate('/profile')}>Profile</Menu.Item>
                      <Menu.Item leftSection={<IconList size={16} />} onClick={() => navigate('/orders')}>Orders</Menu.Item>
                      {user.role === 'admin' && (
                        <>
                          <Divider my="xs" />
                          <Menu.Item leftSection={<IconLayoutDashboard size={16} />} onClick={() => navigate('/admin')}>Admin Dashboard</Menu.Item>
                        </>
                      )}
                      <Divider my="xs" />
                      <Menu.Item leftSection={<IconLogout size={16} />} color="red" onClick={() => setLogoutModalOpen(true)}>Logout</Menu.Item>
                    </>
                  )}
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </Container>
      </Paper>
      {/* Bottom Navbar */}
      <Paper shadow="xs" radius={0} p={0} style={{ borderBottom: '1px solid #e9ecef', background: '#f8fafd' }}>
        <Container size="lg" py={6}>
          <Group justify="space-between" align="center">
            {/* Categories Dropdown */}
            <Menu shadow="md" width={260} position="bottom-start">
              <Menu.Target>
                <Button variant="light" leftSection={<IconChevronDown size={16} />} size="sm">
                  Categories
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {categories.map(cat => {
                  const iconData = CATEGORY_ICONS[cat] || { icon: IconDeviceTv, color: "gray" };
                  return (
                    <Menu.Item
                      key={cat}
                      leftSection={<iconData.icon size={18} color={`var(--mantine-color-${iconData.color}-6)`} />}
                      // Use encodeURIComponent for navigation, matching Products filter logic
                      onClick={() => {
                        // Always update URL with category param, removing keyword if present
                        const params = new URLSearchParams(window.location.search);
                        params.set('category', cat);
                        params.delete('keyword');
                        navigate(`/products?${params.toString()}`);
                        setShowDropdown && setShowDropdown(false); // if dropdown state exists
                      }}
                    >
                      {cat}
                    </Menu.Item>
                  );
                })}
              </Menu.Dropdown>
            </Menu>
            {/* Search Bar */}
            <Box style={{ flex: 1, maxWidth: 500, margin: '0 2rem', position: 'relative' }}>
              <form onSubmit={handleSearch} autoComplete="off">
                <TextInput
                  placeholder="Search for products, brands, etc."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  leftSection={<IconSearch size={18} />}
                  radius="md"
                  size="md"
                  style={{ width: '100%' }}
                  onFocus={() => { if (searchResults.length) setShowDropdown(true); }}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  autoComplete="off"
                />
                {/* Search Dropdown */}
                {showDropdown && search && (
                  <Paper
                    withBorder
                    shadow="md"
                    style={{
                      position: 'absolute',
                      top: 48,
                      left: 0,
                      right: 0,
                      zIndex: 100,
                      background: 'white',
                      maxHeight: 350,
                      overflowY: 'auto',
                    }}
                  >
                    {searchLoading ? (
                      <Box p="md"><Text size="sm">Searching...</Text></Box>
                    ) : searchResults.length === 0 ? (
                      <Box p="md"><Text size="sm" c="dimmed">No results found.</Text></Box>
                    ) : (
                      <>
                        {searchResults.map(item => (
                          <Box
                            key={item._id}
                            p="sm"
                            style={{ cursor: 'pointer', borderBottom: '1px solid #f1f3f5' }}
                            onMouseDown={() => handleResultClick(item._id)}
                          >
                            <Group gap="sm" align="center">
                              {item.featuredImage && (
                                <img src={item.featuredImage} alt={item.name} width={36} height={36} style={{ objectFit: 'cover', borderRadius: 6 }} />
                              )}
                              <Box>
                                <Text fw={600} size="sm">{item.name}</Text>
                                <Text size="xs" c="dimmed">{item.brand} • {item.category}</Text>
                                <Text size="xs" c="dimmed" lineClamp={1}>{item.description}</Text>
                              </Box>
                            </Group>
                          </Box>
                        ))}
                        {/* See all results link */}
                        <Box
                          p="sm"
                          style={{
                            cursor: 'pointer',
                            background: '#f8fafc',
                            textAlign: 'center',
                            borderTop: '1px solid #f1f3f5'
                          }}
                          onMouseDown={() => {
                            navigate(`/products?keyword=${encodeURIComponent(search)}`);
                            setShowDropdown(false);
                          }}
                        >
                          <Text size="sm" color="blue" fw={600}>
                            See all results for "{search}"
                          </Text>
                        </Box>
                      </>
                    )}
                  </Paper>
                )}
              </form>
            </Box>
            {/* Hotline */}
            <Group gap={4} align="center">
              <IconPhone size={18} color="blue" />
              <Text size="sm" fw={600} color="blue.7">{hotline}</Text>
            </Group>
          </Group>
        </Container>
      </Paper>

      {/* Confirmation Modal */}
      <Modal
        opened={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        title="Confirm Logout"
        centered
      >
        <Text>Are you sure you want to log out?</Text>
        <Group mt="md" justify="flex-end">
          <Button variant="default" onClick={() => setLogoutModalOpen(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleLogout}>
            Logout
          </Button>
        </Group>
      </Modal>
    </>
  );
};

export default DoubleNavbar;