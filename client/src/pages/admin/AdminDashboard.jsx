import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Title, Group, Button, Loader, Alert, Text, Stack } from '@mantine/core';
import { IconPlus, IconAlertCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import ProductTable from './ProductTable';
import ProductFormModal from './ProductFormModal';
import AdminLayout from './AdminLayout';

const initialForm = {
  name: '', description: '', brand: '', category: '', subcategories: [], InitialPrice: 0, isDiscounted: false, afterDiscountPrice: 0, stock: 0, sku: '', isFeatured: false, isBestseller: false, featuredImage: '', tags: [], shippingWeight: '', shippingLength: '', shippingWidth: '', shippingHeight: '', status: 'active', images: [], unit: 'piece', warranty: '', specifications: {}
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [selectedId, setSelectedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  
  // Pagination state for admin products
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12); // Show 12 products per page for admin
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch products with pagination
  const fetchProducts = async (reset = true) => {
    if (reset) {
      setLoading(true);
      setPage(1);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', reset ? 1 : page + 1);
      params.append('pageSize', pageSize);
      const res = await api.get(`/products?${params.toString()}`);
      
      if (reset) {
        setProducts(res.data.products || []);
        setPage(1);
      } else {
        setProducts(prev => [...prev, ...(res.data.products || [])]);
        setPage(prev => prev + 1);
      }
      setTotal(res.data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more products
  const handleLoadMore = async () => {
    await fetchProducts(false);
  };

  useEffect(() => { 
    if (user?.isAdmin) fetchProducts(true); 
  }, [user]); // <-- Add dependency array here

  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Title order={2} color="red">Access Denied</Title>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  // Add or update product
  const handleSave = async (formData, isEdit, id) => {
    setSaving(true);
    try {
      if (isEdit && id) {
        await api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        notifications.show({ color: 'green', title: 'Product Updated', message: 'Product updated successfully.' });
      } else {
        await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        notifications.show({ color: 'green', title: 'Product Added', message: 'Product added successfully.' });
      }
      handleCloseModal();
      fetchProducts(true); // Reset to first page after adding/editing
    } catch (err) {
      console.error('Product save error:', err.response?.data);
      
      // Handle validation errors specifically
      if (err.response?.status === 400) {
        const errorData = err.response.data;
        if (errorData.code === 'VALIDATION_ERROR' && errorData.details) {
          // Show specific validation errors
          const errorMessages = errorData.details.map(detail => 
            `${detail.field}: ${detail.message}`
          ).join('\n');
          notifications.show({ 
            color: 'red', 
            title: 'Validation Error', 
            message: errorMessages,
            autoClose: 8000
          });
        } else if (errorData.message) {
          notifications.show({ 
            color: 'red', 
            title: 'Error', 
            message: errorData.message,
            autoClose: 5000
          });
        } else {
          notifications.show({ 
            color: 'red', 
            title: 'Error', 
            message: 'Failed to save product. Please check your input.',
            autoClose: 5000
          });
        }
      } else {
        notifications.show({ 
          color: 'red', 
          title: 'Error', 
          message: err.response?.data?.message || 'Failed to save product',
          autoClose: 5000
        });
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setModalOpen(false);
    setForm(initialForm);
    setEditMode(false);
    setSelectedId(null);
  };

  // Edit product
  const handleEdit = (product) => {
    setForm({
      name: product.name || '',
      description: product.description || '',
      brand: product.brand || '',
      category: product.category || '',
      subcategories: product.subcategories || [],
      InitialPrice: product.InitialPrice || 0,
      isDiscounted: product.isDiscounted || false,
      afterDiscountPrice: product.afterDiscountPrice || 0,
      stock: product.stock || 0,
      sku: product.sku || '',
      isFeatured: product.isFeatured || false,
      isBestseller: product.isBestseller || false,
      featuredImage: product.featuredImage || '',
      tags: product.tags || [],
      shippingWeight: product.shippingInfo?.weight || '',
      shippingLength: product.shippingInfo?.dimensions?.length || '',
      shippingWidth: product.shippingInfo?.dimensions?.width || '',
      shippingHeight: product.shippingInfo?.dimensions?.height || '',
      status: product.status || 'active',
      images: [],
      unit: product.unit || 'piece',
      warranty: product.warranty || '',
      specifications: product.specifications || {}
    });
    setEditMode(true);
    setSelectedId(product._id);
    setModalOpen(true);
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setDeleteLoading(id);
    try {
      await api.delete(`/products/${id}`);
      notifications.show({ color: 'green', title: 'Product Deleted', message: 'Product deleted successfully.' });
      fetchProducts(true); // Reset to first page after deleting
    } catch (err) {
      notifications.show({ color: 'red', title: 'Error', message: err.response?.data?.message || 'Failed to delete product' });
    } finally {
      setDeleteLoading(null);
    }
  };

  // Open modal for adding new product
  const handleAddProduct = () => {
    setForm(initialForm);
    setEditMode(false);
    setSelectedId(null);
    setModalOpen(true);
  };

  return (
    <AdminLayout>
      <Title order={2} mb="lg">Admin Dashboard - Manage Products</Title>
      <Group justify="space-between" mb="md">
        <Text fw={600} size="lg">Products ({total} total)</Text>
        <Button leftSection={<IconPlus size={16} />} onClick={handleAddProduct}>Add Product</Button>
      </Group>
      {error && <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">{error}</Alert>}
      {loading ? (
        <Group justify="center" mt="xl"><Loader size="lg" /></Group>
      ) : (
        <Stack gap="lg">
          <ProductTable products={products} onEdit={handleEdit} onDelete={handleDelete} deleteLoading={deleteLoading} />
          
          {/* Load More Button */}
          {products.length < total && (
            <Group justify="center" mt="lg">
              <Button 
                onClick={handleLoadMore} 
                loading={loadingMore} 
                size="md" 
                variant="light"
                color="blue"
              >
                Load More Products ({products.length} of {total})
              </Button>
            </Group>
          )}
          
          {products.length > 0 && products.length >= total && (
            <Text ta="center" c="dimmed" size="sm">
              All {total} products loaded
            </Text>
          )}
        </Stack>
      )}
      <ProductFormModal
        opened={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        loading={saving}
        editMode={editMode}
        form={form}
        setForm={setForm}
        selectedId={selectedId}
      />
    </AdminLayout>
  );
};

export default AdminDashboard;