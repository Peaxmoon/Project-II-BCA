import React from 'react';
import {
  Paper, Stack, Group, Grid, Select, NumberInput,
  Button, TextInput
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

const FilterSidebar = ({
  // filters,
  pendingFilters,
  filterOptions,
  search,
  setSearch,
  handleFilterChange,
  handleCategoryChange,
  handleBrandChange,
  handleApplyFilters,
  handleSearchSubmit,
  clearFilters
}) => {
  return (
    <Paper radius="md" p="lg" withBorder shadow="sm">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <h3>Filters</h3>
          <Button variant="subtle" size="sm" onClick={clearFilters}>Clear All</Button>
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
              data={filterOptions.brands.map(b => ({ value: b, label: b }))}
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
          <Button variant="filled" color="teal" size="sm" onClick={handleApplyFilters}>
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
};

export default FilterSidebar;