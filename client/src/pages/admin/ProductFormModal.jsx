import React, { useState, useEffect } from 'react';
import {
  Modal, Stack, Group, TextInput, NumberInput, Checkbox, Select, Divider, FileInput, Button, Alert, Tooltip, Textarea, Text, ActionIcon, Image, Title, Box, Paper, rem
} from '@mantine/core';
import { IconInfoCircle, IconPhoto, IconUpload, IconX, IconPlus, IconTrash } from '@tabler/icons-react';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import api from '../../services/api';

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
];

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
  const [customCategoryInput, setCustomCategoryInput] = useState(''); // State for custom category input
  const [customSubcategoryInput, setCustomSubcategoryInput] = useState(''); // State for custom subcategory input

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await api.get('/products/categories');
        setCategoryOptions(res.data.categories || []);
        setUnitOptions(res.data.units || []);
        if (res.data.subcategories) {
          setSubcategoryOptions(res.data.subcategories);
        }
      } catch (err) {
        console.error('Error fetching options:', err);
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

    // Also check custom fields
    const hasCustomFieldChanges = 
      (form.category === 'Others' && customCategoryInput.trim()) ||
      (form.category === 'Others' && customSubcategoryInput.trim());

    setHasChanges(hasFormChanges || hasCustomFieldChanges);
  }, [form, customCategoryInput, customSubcategoryInput]);

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

    // Validate file names
    const hasLongFileName = form.images?.some(img => {
      if (img instanceof File && img.name.length > 100) {
        setFormError('File name too long. Please rename your files to be shorter than 100 characters.');
        return true;
      }
      return false;
    });

    if (hasLongFileName) return;

    // Validate subcategory
    if (form.category && form.category !== 'Others' && (!form.subcategories || form.subcategories.length === 0)) {
      setFormError('Please select a subcategory');
      return;
    }

    // Validate custom category
    if (form.category === 'Others' && !customCategoryInput.trim()) {
      setFormError('Please enter a custom category name');
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name.trim());
    formData.append('description', form.description.trim());
    formData.append('brand', form.brand.trim());
    formData.append('category', form.category);
    // Add custom category if category is "Others"
    if (form.category === 'Others' && customCategoryInput.trim()) {
      formData.append('customCategory', customCategoryInput.trim());
    }
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
    // Handle subcategories correctly
    if (form.subcategories && form.subcategories.length > 0) {
      formData.append('subcategories', form.subcategories[0]);
    }
    if (form.tags && form.tags.length > 0) {
      form.tags.forEach((tag, i) => formData.append(`tags[${i}]`, tag));
    }
    if (form.shippingWeight) formData.append('shippingWeight', form.shippingWeight.toString());
    if (form.shippingLength) formData.append('shippingLength', form.shippingLength.toString());
    if (form.shippingWidth) formData.append('shippingWidth', form.shippingWidth.toString());
    if (form.shippingHeight) formData.append('shippingHeight', form.shippingHeight.toString());
    // Sanitize file names when adding to FormData
    if (form.images && form.images.length > 0) {
      form.images.forEach((img, index) => {
        if (img instanceof File) {
          // Create a shorter file name if needed
          const extension = img.name.split('.').pop();
          const newFileName = `product_image_${index}.${extension}`;
          const newFile = new File([img], newFileName, { type: img.type });
          formData.append('images', newFile);
        } else if (img.url) {
          formData.append('existingImages[]', img.url);
        }
      });
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
    if (form.category) {
      if (form.category === 'Others') {
        setForm(f => ({ ...f, subcategories: [] }));
      } else {
        // Get subcategories for selected category
        const subs = subcategoryOptions[form.category] || [];
        // Reset subcategories when category changes
        setForm(f => ({
          ...f,
          subcategories: []
        }));
      }
    }
  }, [form.category, subcategoryOptions]);

  // Reset custom inputs when modal opens/closes
  useEffect(() => {
    if (!opened) {
      setCustomCategoryInput('');
      setCustomSubcategoryInput('');
    } else if (editMode && form.category === 'Others') {
      // Populate custom fields when editing a product with "Others" category
      setCustomCategoryInput(form.customCategory || '');
      setCustomSubcategoryInput(form.customSubcategories?.[0] || '');
    }
  }, [opened, editMode, form.category, form.customCategory, form.customSubcategories]);

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
                placeholder="Product Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
              <TextInput
                label="Brand"
                placeholder="Brand Name"
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
                searchable={false}
                clearable={false}
              />
              <Select
                label="Subcategory"
                placeholder="Select subcategory"
                data={[
                  ...(form.category === 'Others' 
                    ? [{ value: 'Others', label: 'Others' }]
                    : (subcategoryOptions[form.category] || []).map(sub => ({ 
                        value: sub, 
                        label: sub 
                      }))
                  )
                ]}
                value={form.subcategories?.[0] || ''}
                onChange={(value) => {
                  setForm(prev => ({
                    ...prev,
                    subcategories: value ? [value] : []
                  }));
                }}
                searchable={false}
                clearable={false}
                disabled={!form.category}
              />
            </Group>
            {form.category === 'Others' && (
              <TextInput
                label="Custom Category"
                placeholder="Enter custom category name"
                value={customCategoryInput}
                onChange={(e) => setCustomCategoryInput(e.target.value)}
                required
              />
            )}
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
                searchable={false}
                clearable={false}
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
                searchable={false}
                clearable={false}
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
              value={null}
              onChange={files => {
                const existingImages = Array.isArray(form.images) ? form.images : [];
                const newFiles = files.filter(
                  f => !existingImages.some(
                    ef => ef instanceof File && ef.name === f.name && ef.size === f.size
                  )
                );
                setForm(f => ({
                  ...f,
                  images: [...existingImages, ...newFiles]
                }));
              }}
              accept="image/*"
              multiple
            />
            <Group gap="xs" mt={8}>
              {Array.isArray(form.images) && form.images.map((img, idx) => (
                <Paper key={idx} p={2} radius="sm" withBorder style={{ position: 'relative', display: 'inline-block' }}>
                  <Image
                    src={img instanceof File ? URL.createObjectURL(img) : img.url}
                    alt={`Image ${idx + 1}`}
                    width={48}
                    height={48}
                    fit="cover"
                    radius="sm"
                    style={{ objectFit: 'cover', borderRadius: 6 }}
                  />
                  <ActionIcon
                    color="red"
                    size="sm"
                    style={{ position: 'absolute', top: 2, right: 2, zIndex: 2 }}
                    onClick={() => {
                      setForm(f => ({
                        ...f,
                        images: f.images.filter((_, i) => i !== idx)
                      }));
                    }}
                    title="Remove image"
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </Paper>
              ))}
            </Group>

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
              <Group align="flex-end" gap="xs">
                <TextInput
                  label="Tag"
                  placeholder="Type tag and press Add (max 50 chars)"
                  value={tagInputValue}
                  onChange={e => setTagInputValue(e.target.value)}
                  style={{ flex: 1 }}
                  maxLength={50}
                />
                <Button
                  leftSection={<IconPlus size={14} />}
                  onClick={() => {
                    const newTag = tagInputValue.trim().toLowerCase();
                    if (
                      newTag &&
                      !form.tags.includes(newTag) &&
                      newTag.length <= 50 &&
                      form.tags.length < 20
                    ) {
                      setForm(f => ({ ...f, tags: [...f.tags, newTag] }));
                      setTagInputValue('');
                    }
                  }}
                  variant="light"
                  size="xs"
                  disabled={
                    !tagInputValue.trim() ||
                    form.tags.includes(tagInputValue.trim().toLowerCase()) ||
                    tagInputValue.trim().length > 50 ||
                    form.tags.length >= 20
                  }
                >
                  Add
                </Button>
              </Group>
              <Group gap="xs" mt={8}>
                {form.tags.map(tag => (
                  <Paper
                    key={tag}
                    withBorder
                    p="xs"
                    radius="sm"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: '#e7f0fd'
                    }}
                  >
                    <Text size="sm" fw={600}>#{tag}</Text>
                    <ActionIcon
                      color="red"
                      size="xs"
                      onClick={() => setForm(f => ({
                        ...f,
                        tags: f.tags.filter(t => t !== tag)
                      }))}
                    >
                      <IconTrash size={12} />
                    </ActionIcon>
                  </Paper>
                ))}
              </Group>
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