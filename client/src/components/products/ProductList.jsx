// ...existing code...

import React from 'react';
import {
  Grid, Stack, Loader, Text, Paper, ActionIcon,
  Title, Group, Button, Alert
} from '@mantine/core';
import { IconAlertCircle, IconPackage } from '@tabler/icons-react';
import ProductCard from '../common/ProductCard';

const ProductList = ({
  products,
  loading,
  error,
  total,
  filters,
  clearFilters,
  handleLoadMore,
  loadingMore
}) => {
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
              : "No products are available at the moment. Please check back later!"}
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
        {products.map(product => (
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
};

export default ProductList;
