import React, { useState, useEffect } from 'react';
import {
  Modal, Stack, Group, TextInput, NumberInput, Checkbox, Select, MultiSelect, Divider, FileInput, Button, Alert, Tooltip, Textarea, Text, ActionIcon, Image, Title, Box, Paper, rem
} from '@mantine/core';
import { IconInfoCircle, IconPhoto, IconUpload, IconX, IconPlus, IconTrash } from '@tabler/icons-react';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import api from '../../services/api';

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
];

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

const ProductFormModal = ({ opened, onClose, onSave, loading, editMode, form, setForm, selectedId }) => {
  const [formError, setFormError] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [tagInputValue, setTagInputValue] = useState(''); // State for tag input value

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await api.get('/products/categories');
        setCategoryOptions(res.data.categories || []);
        setUnitOptions(res.data.units || []);
        setSubcategoryOptions(res.data.subcategories || []); // Add this line if your API provides subcategories
      } catch (err) {
        setCategoryOptions([]);
        setUnitOptions([]);
        setSubcategoryOptions([]);
        console.error('Error fetching product options:', err, err.response?.data?.message || err.message);
      }
    };
    fetchOptions();
  }, []);

  // Track if form has changes
  useEffect(() => {
    const initialForm = {
      name: '', description: '', brand: '', category: '', subcategories: [], 
      InitialPrice: 0, isDiscounted: false, afterDiscountPrice: 0, stock: 0, 
      sku: '', isFeatured: false, isBestseller: false, tags: [], 
      shippingWeight: '', shippingLength: '', shippingWidth: '', shippingHeight: '', 
      status: 'active', images: [], unit: 'piece', warranty: '', specifications: {}
    };

    const hasFormChanges = Object.keys(form).some(key => {
      if (key === 'subcategories' || key === 'tags') {
        return form[key]?.length > 0;
      }
      if (key === 'specifications') {
        return Object.keys(form[key] || {}).length > 0;
      }
      if (key === 'images') {
        return form[key]?.length > 0;
      }
      return form[key] !== initialForm[key];
    });

    setHasChanges(hasFormChanges);
  }, [form]);

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSpecAdd = () => {
    if (specKey && specValue) {
      setForm(f => ({ ...f, specifications: { ...f.specifications, [specKey]: specValue } }));
      setSpecKey('');
      setSpecValue('');
    }
  };

  const handleSpecRemove = (key) => {
    setForm(f => {
      const specs = { ...f.specifications };
      delete specs[key];
      return { ...f, specifications: specs };
    });
  };

  const validateForm = () => {
    if (!form.name || !form.description || !form.brand || !form.category || !form.InitialPrice || !form.stock) {
      return 'Please fill all required fields (name, description, brand, category, price, stock).';
    }
    if (form.isDiscounted && (!form.afterDiscountPrice || form.afterDiscountPrice >= form.InitialPrice)) {
      return 'Discounted price must be less than original price.';
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    const errMsg = validateForm();
    if (errMsg) {
      setFormError(errMsg);
      return;
    }
    const formData = new FormData();
    formData.append('name', form.name.trim());
    formData.append('description', form.description.trim());
    formData.append('brand', form.brand.trim());
    formData.append('category', form.category);
    formData.append('InitialPrice', form.InitialPrice.toString());
    formData.append('stock', form.stock.toString());
    formData.append('isDiscounted', form.isDiscounted.toString());
    if (form.isDiscounted && form.afterDiscountPrice) {
      formData.append('afterDiscountPrice', form.afterDiscountPrice.toString());
    }
    formData.append('isFeatured', form.isFeatured.toString());
    formData.append('isBestseller', form.isBestseller ? 'true' : 'false');
    formData.append('status', form.status);
    formData.append('unit', form.unit);
    if (form.sku) formData.append('sku', form.sku.trim());
    if (form.warranty) formData.append('warranty', form.warranty.trim());
    if (form.subcategories && form.subcategories.length > 0) {
      form.subcategories.forEach((sub, i) => formData.append(`subcategories[${i}]`, sub));
    }
    if (form.tags && form.tags.length > 0) {
      form.tags.forEach((tag, i) => formData.append(`tags[${i}]`, tag));
    }
    if (form.shippingWeight) formData.append('shippingWeight', form.shippingWeight.toString());
    if (form.shippingLength) formData.append('shippingLength', form.shippingLength.toString());
    if (form.shippingWidth) formData.append('shippingWidth', form.shippingWidth.toString());
    if (form.shippingHeight) formData.append('shippingHeight', form.shippingHeight.toString());
    if (form.images && form.images.length > 0) {
      for (let img of form.images) {
        if (img instanceof File) {
          formData.append('images', img);
        }
      }
    }
    if (form.specifications && Object.keys(form.specifications).length > 0) {
      Object.entries(form.specifications).forEach(([key, value]) => {
        if (key && value) {
          formData.append(`specifications[${key}]`, value.toString());
        }
      });
    }
    onSave(formData, editMode, selectedId);
  };

  const handleClose = () => {
    if (hasChanges) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const confirmClose = () => {
    setShowConfirmClose(false);
    setHasChanges(false);
    onClose();
  };

  const cancelClose = () => {
    setShowConfirmClose(false);
  };

  // 1. Add a helper for field-level error display
  const FieldError = ({ error }) => error ? (
    <Text size="xs" color="red" mt={2}>{error}</Text>
  ) : null;

  // Prevent accidental close: handle overlay click and escape
  const handleModalClose = (eventSource = 'overlayOrEscape') => {
    if (hasChanges) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  // Update subcategory options dynamically when category changes
  useEffect(() => {
    if (form.category && SUBCATEGORIES[form.category]) {
      setSubcategoryOptions(SUBCATEGORIES[form.category]);
      // Remove subcategories not in the new options
      setForm(f => ({
        ...f,
        subcategories: (f.subcategories || []).filter(sub => SUBCATEGORIES[form.category].includes(sub))
      }));
    } else {
      setSubcategoryOptions([]);
      setForm(f => ({ ...f, subcategories: [] }));
    }
    // eslint-disable-next-line
  }, [form.category]);

  // Handler for tag input keydown (space or enter to add tag)
  const handleTagInputKeyDown = (event) => {
    if (
      (event.key === ' ' || event.key === 'Enter') &&
      tagInputValue.trim() !== ''
    ) {
      event.preventDefault();
      const newTag = tagInputValue.trim();
      if (
        !form.tags.includes(newTag) &&
        newTag.length <= 50 &&
        form.tags.length < 20
      ) {
        setForm(f => ({ ...f, tags: [...f.tags, newTag] }));
      }
      setTagInputValue('');
    }
  };

  return (
    <>
      <Modal 
        opened={opened} 
        onClose={handleModalClose} // Use custom close handler
        title={editMode ? "Edit Product" : "Add New Product"}
        size="lg"
        centered
        closeOnClickOutside={false} // Prevent default close on overlay click
        closeOnEscape={false}       // Prevent default close on escape
      >
        <form onSubmit={handleSubmit} autoComplete="off">
          <Stack gap="md">
            <Group grow>
              <TextInput
                label="Product Name"
                placeholder="e.g. Cordless Drill Machine"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
              <TextInput
                label="Brand"
                placeholder="e.g. DrillPro"
                value={form.brand}
                onChange={e => setForm({ ...form, brand: e.target.value })}
                required
              />
            </Group>
            <Textarea
              label="Description"
              placeholder="Describe the product..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              minRows={3}
              autosize
              required
            />
            <Group grow>
              <Select
                label="Category"
                placeholder="Select category"
                data={categoryOptions.map(cat => ({ value: cat, label: cat }))}
                value={form.category || ''}
                onChange={val => handleChange('category', val)}
                required
              />
              <MultiSelect
                label="Subcategories"
                placeholder="Select subcategories"
                data={subcategoryOptions.map(sub => ({ value: sub, label: sub }))}
                value={form.subcategories || []}
                onChange={val => handleChange('subcategories', val)}
                searchable
                clearable
                creatable
                getCreateLabel={query => `+ Create "${query}"`}
                onCreate={query => {
                  const newSub = query.trim();
                  if (newSub) {
                    setSubcategoryOptions(prev => [...prev, newSub]);
                    handleChange('subcategories', [...(form.subcategories || []), newSub]);
                    return newSub;
                  }
                  return '';
                }}
                disabled={!form.category}
              />
            </Group>
            <Group grow>
              <NumberInput
                label="Initial Price"
                placeholder="e.g. 100"
                value={form.InitialPrice}
                onChange={value => setForm({ ...form, InitialPrice: value })}
                min={0}
                required
                prefix="रु"
              />
              <NumberInput
                label="Stock"
                placeholder="e.g. 10"
                value={form.stock}
                onChange={value => setForm({ ...form, stock: value })}
                min={0}
                required
              />
            </Group>
            <Group grow>
              <Checkbox 
                label="Discounted?" 
                checked={form.isDiscounted || false} 
                onChange={e => handleChange('isDiscounted', e.target.checked)} 
                style={{ alignSelf: 'end' }}
              />
              {form.isDiscounted && (
                <NumberInput
                  label="After Discount Price"
                  placeholder="e.g. 80"
                  value={form.afterDiscountPrice}
                  onChange={value => setForm({ ...form, afterDiscountPrice: value })}
                  min={0}
                  required
                  prefix="रु"
                />
              )}
            </Group>
            <Group grow>
              <Checkbox 
                label="Featured?" 
                checked={form.isFeatured || false} 
                onChange={e => handleChange('isFeatured', e.target.checked)} 
              />
              <Checkbox 
                label="Bestseller?" 
                checked={form.isBestseller || false} 
                onChange={e => handleChange('isBestseller', e.target.checked)} 
              />
            </Group>
            <Group grow>
              <TextInput
                label="SKU"
                placeholder="e.g. CDM-1004"
                value={form.sku}
                onChange={e => setForm({ ...form, sku: e.target.value })}
                required
              />
              <Select
                label="Unit"
                placeholder="e.g. piece, set, box"
                data={unitOptions.map(unit => ({ value: unit, label: unit }))}
                value={form.unit}
                onChange={val => handleChange('unit', val)}
                required
              />
            </Group>
            <Group grow>
              <TextInput
                label="Warranty"
                placeholder="e.g. 2 years"
                value={form.warranty}
                onChange={e => setForm({ ...form, warranty: e.target.value })}
              />
              <Select 
                label="Status" 
                data={statusOptions} 
                value={form.status || 'active'} 
                onChange={val => handleChange('status', val)} 
                required 
              />
            </Group>
            <Divider label="Shipping Info" labelPosition="center" my="sm" />
            <Group grow>
              <NumberInput
                label="Shipping Weight (g)"
                value={form.shippingWeight}
                onChange={value => setForm({ ...form, shippingWeight: value })}
                min={0}
              />
              <NumberInput
                label="Shipping Length (cm)"
                value={form.shippingLength}
                onChange={value => setForm({ ...form, shippingLength: value })}
                min={0}
              />
              <NumberInput
                label="Shipping Width (cm)"
                value={form.shippingWidth}
                onChange={value => setForm({ ...form, shippingWidth: value })}
                min={0}
              />
              <NumberInput
                label="Shipping Height (cm)"
                value={form.shippingHeight}
                onChange={value => setForm({ ...form, shippingHeight: value })}
                min={0}
              />
            </Group>
            <Divider label="Images" labelPosition="center" my="sm" />
            <FileInput
              label="Gallery Images"
              placeholder="Upload gallery images"
              value={form.images}
              onChange={files => setForm({ ...form, images: files })}
              accept="image/*"
              multiple
            />
            <Divider label="Specifications" labelPosition="center" my="sm" />
            <Group align="flex-end" gap="xs">
              <TextInput 
                label="Key" 
                placeholder="e.g. Power" 
                value={specKey}
                onChange={e => setSpecKey(e.target.value)}
                style={{ flex: 1 }}
              />
              <TextInput 
                label="Value" 
                placeholder="e.g. 500W" 
                value={specValue}
                onChange={e => setSpecValue(e.target.value)}
                style={{ flex: 1 }}
              />
              <Button leftSection={<IconPlus size={14} />} onClick={handleSpecAdd} variant="light" size="xs" disabled={!specKey || !specValue}>Add</Button>
            </Group>
            <Group gap="xs" mt={8}>
              {Object.entries(form.specifications || {}).map(([key, value]) => (
                <Paper key={key} withBorder p="xs" radius="sm" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f4f6fa' }}>
                  <Text size="sm" fw={600}>{key}:</Text>
                  <Text size="sm">{value}</Text>
                  <ActionIcon color="red" size="xs" onClick={() => handleSpecRemove(key)}><IconTrash size={12} /></ActionIcon>
                </Paper>
              ))}
            </Group>
            <Group grow>
              <MultiSelect
                label="Tags"
                placeholder="Type and press enter to add tag"
                data={form.tags.map(tag => ({ value: tag, label: tag }))}
                value={form.tags}
                onChange={tags => setForm(f => ({ ...f, tags }))}
                searchable
                clearable
                creatable
                getCreateLabel={query => `+ Create "${query}"`}
                onCreate={query => {
                  const newTag = query.trim();
                  if (newTag) {
                    const updated = [...form.tags, newTag];
                    setForm(f => ({ ...f, tags: updated }));
                    return newTag;
                  }
                  return '';
                }}
              />
            </Group>
            <Button type="submit" size="md" fullWidth loading={loading} mt="md">
              {editMode ? 'Update' : 'Add'} Product
            </Button>
            {formError && <Alert color="red" mt="md">{formError}</Alert>}
          </Stack>
        </form>
      </Modal>
      <Modal 
        opened={showConfirmClose} 
        onClose={cancelClose}
        title="Discard Changes?"
        centered
        size="sm"
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        <Stack gap="md">
          <Text>
            You have unsaved changes. Are you sure you want to discard them?
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" onClick={cancelClose}>
              Keep Editing
            </Button>
            <Button color="red" onClick={confirmClose}>
              Discard Changes
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default ProductFormModal;