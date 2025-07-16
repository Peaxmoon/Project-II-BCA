// --- Filters Sidebar Component ---
function FiltersSidebar({
  filterOptions,
  pendingFilters,
  handleCategoryChange,
  handleBrandChange,
  handleFilterChange,
  handleApplyFilters,
  clearFilters,
  search,
  setSearch,
  handleSearchSubmit
}) {
  return (
    <Paper radius="md" p="lg" withBorder shadow="sm">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={3} size="h4">Filters</Title>
          <Button variant="subtle" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </Group>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Select
              label="Category"
              placeholder="All Categories"
              data={filterOptions.categories.map(cat => ({ value: cat, label: cat }))}
              value={pendingFilters.category}
              onChange={handleCategoryChange}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Select
              label="Brand"
              placeholder="All Brands"
              data={filterOptions.brands.map(brand => ({ value: brand, label: brand }))}
              value={pendingFilters.brand}
              onChange={handleBrandChange}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <NumberInput
              label="Min Price (रु)"
              placeholder="Min"
              value={pendingFilters.minPrice}
              onChange={value => handleFilterChange('minPrice', value)}
              min={0}
              max={filterOptions.priceRange.max}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <NumberInput
              label="Max Price (रु)"
              placeholder="Max"
              value={pendingFilters.maxPrice}
              onChange={value => handleFilterChange('maxPrice', value)}
              min={0}
              max={filterOptions.priceRange.max}
            />
          </Grid.Col>
        </Grid>
        <Group gap="sm">
          <Button 
            variant={pendingFilters.isDiscounted ? "filled" : "outline"} 
            color="red" 
            size="sm"
            onClick={() => handleFilterChange('isDiscounted', !pendingFilters.isDiscounted)}
          >
            Discounted Only
          </Button>
          <Button 
            variant={pendingFilters.isFeatured ? "filled" : "outline"} 
            color="blue" 
            size="sm"
            onClick={() => handleFilterChange('isFeatured', !pendingFilters.isFeatured)}
          >
            Featured Only
          </Button>
          <Button 
            variant="filled"
            color="teal"
            size="sm"
            onClick={handleApplyFilters}
          >
            Apply Filters
          </Button>
        </Group>
        <form onSubmit={handleSearchSubmit}>
          <TextInput
            icon={<IconSearch size={16} />}
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            mt="md"
            autoComplete="off"
          />
        </form>
      </Stack>
    </Paper>
  );
}

// --- Product List Component ---
function ProductList({
  loading,
  error,
  products,
  total,
  handleLoadMore,
  loadingMore,
  filters,
  clearFilters
}) {
  if (loading) {
    return (
      <Stack align="center" gap="md" py="xl">
        <Loader size="lg" />
        <Text>Loading products...</Text>
      </Stack>
    );
  }
  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
        {error}
      </Alert>
    );
  }
  if (products.length === 0) {
    return (
      <Paper p="xl" withBorder>
        <Stack align="center" gap="md">
          <ActionIcon size="xl" variant="light" color="gray" radius="xl">
            <IconPackage size={48} />
          </ActionIcon>
          <Title order={3} size="h4" ta="center">
            No Products Found
          </Title>
          <Text ta="center" c="dimmed" maw={500}>
            {Object.values(filters).some(f => f) 
              ? "No products match your current filters. Try adjusting your search criteria."
              : "No products are available in our store at the moment. Please check back later!"
            }
          </Text>
          {Object.values(filters).some(f => f) && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </Stack>
      </Paper>
    );
  }
  return (
    <>
      <Grid gutter="md">
        {products.map((product) => (
          <Grid.Col key={product._id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <ProductCard product={product} />
          </Grid.Col>
        ))}
      </Grid>
      {products.length < total && (
        <Group justify="center" mt="lg">
          <Button onClick={handleLoadMore} loading={loadingMore} size="md" variant="light">
            Load More
          </Button>
        </Group>
      )}
    </>
  );
}