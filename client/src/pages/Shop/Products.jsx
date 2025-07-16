import React, { useEffect, useState } from 'react';
import { Container, Stack, Group, Title, Paper, Badge, Text, Select } from '@mantine/core';
import api from '../../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import FiltersSidebar from './FilterSidebar';
import ProductList from './ProductList';

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

  // --- NEW: Listen for search param in URL and update search/filter state ---
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keyword = params.get('keyword') || '';
    const category = params.get('category') || '';
    const brand = params.get('brand') || '';
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
