import React, { useEffect, useState } from 'react';
import { Container, Stack, Group, Title, Paper, Badge, Text, Select, Loader, Alert, Button, ActionIcon, Grid } from '@mantine/core';
import api from '../../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import FiltersSidebar from '../../components/products/FilterSidebar';
import ProductList from '../../components/products/ProductList';

const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    isDiscounted: false,
    isFeatured: false
  });
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 0 }
  });
  const [sortBy, setSortBy] = useState('');
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pendingFilters, setPendingFilters] = useState(filters);

  // Debounced values for filters/search/sort
  const debouncedFilters = useDebounce(filters, 400);
  const debouncedSortBy = useDebounce(sortBy, 400);
  const debouncedSearch = useDebounce(search, 400);

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const res = await api.get('/products/filters');
        setFilterOptions(res.data);
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };
    fetchFilterOptions();
  }, []);

  // Fetch products (only when filters/search/sort applied)
  useEffect(() => {
    let ignore = false;
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      setPage(1);
      try {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.brand) params.append('brand', filters.brand);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.isDiscounted) params.append('isDiscounted', 'true');
        if (filters.isFeatured) params.append('isFeatured', 'true');
        if (sortBy) params.append('sort', sortBy);
        params.append('page', 1);
        params.append('pageSize', pageSize);
        if (search) params.append('keyword', search);

        const res = await api.get(`/products?${params.toString()}`);
        if (!ignore) {
          setProducts(res.data.products || []);
          setTotal(res.data.total || 0);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || 'Failed to fetch products. Please try again later.');
          setProducts([]);
          setTotal(0);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchProducts();
    return () => { ignore = true; };
  }, [filters, sortBy, search, pageSize]);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keyword = params.get('keyword') || '';
    const category = params.get('category') || '';
    const brand = params.get('brand') || '';
    if (keyword !== search) setSearch(keyword);
    if (category !== filters.category) {
      setFilters(f => ({ ...f, category }));
      setPendingFilters(f => ({ ...f, category }));
    }
    if (brand !== filters.brand) {
      setFilters(f => ({ ...f, brand }));
      setPendingFilters(f => ({ ...f, brand }));
    }
    // eslint-disable-next-line
  }, [location.search]);

  // When user selects a category, update URL (like navbar)
  const handleCategoryChange = (value) => {
    setPendingFilters(prev => ({ ...prev, category: value }));
    const params = new URLSearchParams(location.search);
    if (value) {
      params.set('category', value);
    } else {
      params.delete('category');
    }
    navigate(`/products?${params.toString()}`);
  };

  // When user selects a brand, update URL
  const handleBrandChange = (value) => {
    setPendingFilters(prev => ({ ...prev, brand: value }));
    const params = new URLSearchParams(location.search);
    if (value) {
      params.set('brand', value);
    } else {
      params.delete('brand');
    }
    navigate(`/products?${params.toString()}`);
  };

  // Load more products
  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      if (debouncedFilters.category) params.append('category', debouncedFilters.category);
      if (debouncedFilters.brand) params.append('brand', debouncedFilters.brand);
      if (debouncedFilters.minPrice) params.append('minPrice', debouncedFilters.minPrice);
      if (debouncedFilters.maxPrice) params.append('maxPrice', debouncedFilters.maxPrice);
      if (debouncedFilters.isDiscounted) params.append('isDiscounted', 'true');
      if (debouncedFilters.isFeatured) params.append('isFeatured', 'true');
      if (debouncedSortBy) params.append('sort', debouncedSortBy);
      if (debouncedSearch) params.append('keyword', debouncedSearch);
      params.append('page', page + 1);
      params.append('pageSize', pageSize);
      const res = await api.get(`/products?${params.toString()}`);
      setProducts(prev => [...prev, ...(res.data.products || [])]);
      setPage(prev => prev + 1);
      setTotal(res.data.total || total);
    } catch (err) {
      console.error('Error loading more products:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // When filter inputs change, update pendingFilters only
  const handleFilterChange = (field, value) => {
    setPendingFilters(prev => ({ ...prev, [field]: value }));
  };

  // Apply filters button
  const handleApplyFilters = () => {
    setFilters(pendingFilters);
  };

  // When sort or search changes, apply immediately
  useEffect(() => {
    setFilters(prev => ({ ...prev }));
  }, [sortBy, search]);

  // Clear all filters
  const clearFilters = () => {
    const cleared = {
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      isDiscounted: false,
      isFeatured: false
    };
    setPendingFilters(cleared);
    setFilters(cleared);
    setSortBy('');
    setSearch('');
  };

  // Add this function to handle search form submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(location.search);
    if (search) {
      params.set('keyword', search);
    } else {
      params.delete('keyword');
    }
    navigate(`/products?${params.toString()}`);
  };

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
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Paper radius="md" p="xl" withBorder shadow="md" 
          style={{ 
            background: 'linear-gradient(135deg, var(--mantine-color-green-6) 0%, var(--mantine-color-teal-6) 100%)',
            color: 'white'
          }}>
          <Stack align="center" gap="xs">
            <Title order={1} size="2.5rem" fw={900} ta="center">
              All Products
            </Title>
            <Text size="lg" ta="center" maw={600} style={{ opacity: 0.9 }}>
              Discover our complete collection of home appliances and gadgets
            </Text>
            {products.length > 0 && (
              <Badge size="lg" variant="white" color="dark">
                {products.length} {products.length === 1 ? 'product' : 'products'} found
              </Badge>
            )}
          </Stack>
        </Paper>

        {/* Filters Sidebar */}
        <FiltersSidebar
          filterOptions={filterOptions}
          pendingFilters={pendingFilters}
          handleCategoryChange={handleCategoryChange}
          handleBrandChange={handleBrandChange}
          handleFilterChange={handleFilterChange}
          handleApplyFilters={handleApplyFilters}
          clearFilters={clearFilters}
          search={search}
          setSearch={setSearch}
          handleSearchSubmit={handleSearchSubmit}
        />

        {/* Sort and Results */}
        <Group justify="space-between" align="center">
          <Text size="sm" c="dimmed">
            {products.length} {products.length === 1 ? 'product' : 'products'} found
          </Text>
          <Select
            label="Sort by"
            placeholder="Sort products"
            data={[
              { value: 'newest', label: 'Newest First' },
              { value: 'price_asc', label: 'Price: Low to High' },
              { value: 'price_desc', label: 'Price: High to Low' },
              { value: 'name_asc', label: 'Name: A to Z' },
              { value: 'name_desc', label: 'Name: Z to A' },
              { value: 'rating', label: 'Highest Rated' }
            ]}
            value={sortBy}
            onChange={setSortBy}
            style={{ width: 200 }}
          />
        </Group>

        {/* Product List */}
        <ProductList
          loading={loading}
          error={error}
          products={products}
          total={total}
          handleLoadMore={handleLoadMore}
          loadingMore={loadingMore}
          filters={filters}
          clearFilters={clearFilters}
        />
      </Stack>
    </Container>
  );
};

export default Products;
