import React, { useState } from 'react';
import { Card, Image, Badge, Button, Group, Text, Grid, Stack, Tooltip, Modal, Divider } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';

const CARD_HEIGHT = 370;
const IMAGE_HEIGHT = 160;

const ProductTable = ({ products, onEdit, onDelete, deleteLoading }) => {
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openDetails = (product) => {
    setSelected(product);
    setModalOpen(true);
  };

  const closeDetails = () => {
    setSelected(null);
    setModalOpen(false);
  };

  return (
    <>
      <Grid gutter="xl">
        {products.map(product => (
          <Grid.Col key={product._id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              style={{ minHeight: CARD_HEIGHT, maxHeight: CARD_HEIGHT, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <Card.Section style={{ height: IMAGE_HEIGHT, overflow: 'hidden', cursor: 'pointer' }} onClick={() => openDetails(product)}>
                <Image
                  src={product.images?.[0]?.url || '/images/placeholder.png'}
                  height={IMAGE_HEIGHT}
                  alt={product.name}
                  fit="contain"
                  style={{ objectFit: 'contain', width: '100%', height: IMAGE_HEIGHT, background: '#f8f9fa' }}
                  fallbackSrc="https://placehold.co/300x180?text=No+Image"
                />
              </Card.Section>
              <Group justify="space-between" mt="md" mb="xs">
                <Text fw={600} lineClamp={1} style={{ cursor: 'pointer' }} onClick={() => openDetails(product)}>{product.name}</Text>
                <Badge color={product.status === 'active' ? 'green' : product.status === 'inactive' ? 'yellow' : 'gray'}>{product.status}</Badge>
              </Group>
              <Text size="sm" c="dimmed" mb="xs" lineClamp={1}>{product.brand} &bull; {product.category}</Text>
              <Stack gap={2} mb="xs">
                <Text size="sm">Stock: <b>{product.stock}</b></Text>
                {/* Price Section - clearer and more professional */}
                <Group gap={6} align="center">
                  <Text size="sm" fw={700} c={product.isDiscounted ? 'red' : undefined}>
                    रु{product.isDiscounted ? product.afterDiscountPrice : product.InitialPrice}
                  </Text>
                  {product.isDiscounted && (
                    <>
                      <Text size="xs" c="dimmed" td="line-through">
                        रु{product.InitialPrice}
                      </Text>
                      <Badge color="red" size="xs" variant="light" ml={4}>
                        After Discount
                      </Badge>
                    </>
                  )}
                </Group>
                {/* Show discount percent if discounted */}
                {product.isDiscounted && product.InitialPrice > 0 && (
                  <Text size="xs" c="red">
                    {Math.round(((product.InitialPrice - product.afterDiscountPrice) / product.InitialPrice) * 100)}% OFF
                  </Text>
                )}
              </Stack>
              <Group gap="xs" mt="sm" justify="end">
                <Tooltip label="Edit Product" withArrow><Button size="xs" variant="light" color="blue" leftSection={<IconEdit size={14} />} onClick={() => onEdit(product)}>Edit</Button></Tooltip>
                <Tooltip label="Delete Product" withArrow><Button size="xs" variant="light" color="red" leftSection={<IconTrash size={14} />} loading={deleteLoading === product._id} onClick={() => onDelete(product._id)}>Delete</Button></Tooltip>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
      <Modal opened={modalOpen} onClose={closeDetails} title={selected?.name || 'Product Details'} size="lg" centered>
        {selected && (
          <Stack>
            <Group align="flex-start" gap="xl">
              <Image
                src={selected.images?.[0]?.url || '/images/placeholder.png'}
                width={180}
                height={180}
                fit="contain"
                alt={selected.name}
                fallbackSrc="https://placehold.co/300x180?text=No+Image"
                style={{ background: '#f8f9fa', borderRadius: 8 }}
              />
              <Stack gap={2} style={{ flex: 1 }}>
                <Text fw={700} size="lg">{selected.name}</Text>
                <Text size="sm" c="dimmed">{selected.brand} &bull; {selected.category}</Text>
                <Text size="sm">SKU: {selected.sku || '-'}</Text>
                <Group gap={4}>
                  <Text size="sm">Status:</Text>
                  <Badge color={selected.status === 'active' ? 'green' : selected.status === 'inactive' ? 'yellow' : 'gray'}>{selected.status}</Badge>
                </Group>
                <Text size="sm">Stock: <b>{selected.stock}</b></Text>
                {/* Price details in modal */}
                <Group gap={6} align="center">
                  <Text size="sm" fw={700} c={selected.isDiscounted ? 'red' : undefined}>
                    रु{selected.isDiscounted ? selected.afterDiscountPrice : selected.InitialPrice}
                  </Text>
                  {selected.isDiscounted && (
                    <>
                      <Text size="xs" c="dimmed" td="line-through">
                        रु{selected.InitialPrice}
                      </Text>
                      <Badge color="red" size="xs" variant="light" ml={4}>
                        After Discount
                      </Badge>
                    </>
                  )}
                </Group>
                {selected.isDiscounted && selected.InitialPrice > 0 && (
                  <Text size="xs" c="red">
                    {Math.round(((selected.InitialPrice - selected.afterDiscountPrice) / selected.InitialPrice) * 100)}% OFF
                  </Text>
                )}
                <Text size="sm">Featured: {selected.isFeatured ? 'Yes' : 'No'}</Text>
                <Text size="sm">Tags: {selected.tags?.join(', ') || '-'}</Text>
                <Text size="sm">Subcategories: {selected.subcategories?.join(', ') || '-'}</Text>
                <Text size="sm">Created: {new Date(selected.createdAt).toLocaleString()}</Text>
                <Text size="sm">Updated: {new Date(selected.updatedAt).toLocaleString()}</Text>
              </Stack>
            </Group>
            <Divider my="sm" label="Description" labelPosition="center" />
            <Text size="sm">{selected.description}</Text>
            <Divider my="sm" label="Images" labelPosition="center" />
            <Group>
              {selected.images?.length > 0 ? selected.images.map((img, i) => (
                <Image key={i} src={img.url} width={80} height={80} fit="contain" alt={`Product image ${i + 1}`} style={{ background: '#f8f9fa', borderRadius: 6 }} />
              )) : <Text size="sm" c="dimmed">No images</Text>}
            </Group>
            <Divider my="sm" label="Shipping Info" labelPosition="center" />
            <Group gap={8}>
              <Text size="sm">Weight: {selected.shippingInfo?.weight || '-'} g</Text>
              <Text size="sm">Dimensions: {selected.shippingInfo?.dimensions ? `${selected.shippingInfo.dimensions.length} x ${selected.shippingInfo.dimensions.width} x ${selected.shippingInfo.dimensions.height} cm` : '-'}</Text>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  );
};

export default ProductTable;