import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Group,
  Stack,
  Button,
  Badge,
  Image,
  Paper,
  Grid,
  Loader,
  Alert,
  NumberInput,
  Divider,
  ActionIcon,
  Tooltip,
  Rating,
  Textarea,
  Menu,
  Modal
} from '@mantine/core';
import {
  IconShoppingCart,
  IconHeart,
  IconHeartFilled,
  IconArrowLeft,
  IconAlertCircle,
  IconStar,
  IconTruck,
  IconShield,
  IconCreditCard,
  IconStarFilled,
  IconThumbUp,
  IconThumbUpFilled
} from '@tabler/icons-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import ProductCard from '../../components/common/ProductCard';
import ProductReviews from './ProductReviews';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [similarPage, setSimilarPage] = useState(1);
  const [similarTotal, setSimilarTotal] = useState(0);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [loadingMoreSimilar, setLoadingMoreSimilar] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState({ rating: 0, comment: '' });
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [likeLoading, setLikeLoading] = useState({}); // { [reviewId]: boolean }
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editReview, setEditReview] = useState(null);
  const [reviewPage, setReviewPage] = useState(1); // <-- pagination state
  const [reviewTotal, setReviewTotal] = useState(0); // <-- total reviews
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);
  const SIMILAR_PAGE_SIZE = 8;
  const REVIEWS_PAGE_SIZE = 3;

  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.error('Error fetching product:', err);
        if (err.response?.status === 404) {
          setError('Product not found. It may have been removed or the link is incorrect.');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch product details. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Move fetchSimilar outside of useEffect so it is in scope for handleLoadMoreSimilar
  const fetchSimilar = async (page = 1, append = false) => {
    if (!product) return;
    if (page === 1) setLoadingSimilar(true);
    else setLoadingMoreSimilar(true);
    try {
      const params = new URLSearchParams();
      params.append('category', product.category);
      params.append('page', page);
      params.append('pageSize', SIMILAR_PAGE_SIZE);
      params.append('exclude', product._id);
      const res = await api.get(`/products?${params.toString()}`);
      let items = (res.data.products || []).filter(p => p._id !== product._id);

      items.sort((a, b) => {
        const brandA = a.brand === product.brand ? 0 : 1;
        const brandB = b.brand === product.brand ? 0 : 1;
        if (brandA !== brandB) return brandA - brandB;
        const priceA = Math.abs((a.isDiscounted ? a.afterDiscountPrice : a.InitialPrice) - (product.isDiscounted ? product.afterDiscountPrice : product.InitialPrice));
        const priceB = Math.abs((b.isDiscounted ? b.afterDiscountPrice : b.InitialPrice) - (product.isDiscounted ? product.afterDiscountPrice : product.InitialPrice));
        return priceA - priceB;
      });

      if (append) {
        setSimilarProducts(prev => [...prev, ...items]);
      } else {
        setSimilarProducts(items);
      }
      setSimilarTotal(res.data.total ? res.data.total - 1 : items.length);
      setSimilarPage(page);
    } catch (err) {
      setSimilarProducts([]);
      setSimilarTotal(0);
      console.error('Error fetching similar products:', err);
    } finally {
      setLoadingSimilar(false);
      setLoadingMoreSimilar(false);
    }
  };

  // Fetch similar products when product changes
  useEffect(() => {
    if (product) fetchSimilar(1, false);
    // eslint-disable-next-line
  }, [product]);

  // Fetch reviews when product loads or page changes
  useEffect(() => {
    if (!product) return;
    setReviewLoading(true);
    api.get(`/products/${product._id}/reviews?page=${reviewPage}&limit=${REVIEWS_PAGE_SIZE}`, {
      headers: user?.token ? { Authorization: `Bearer ${user.token}` } : undefined,
    })
      .then(res => {
        // Use res.data.reviews and res.data.total
        const reviewArr = Array.isArray(res.data.reviews) ? res.data.reviews : res.data;
        let userHasReviewed = false;
        let userReview = { rating: 0, comment: '' };
        if (user) {
          // Always check in the full reviews array, not just the current page
          const found = reviewArr.find(r => r.user === user.id || r.user?._id === user.id);
          if (found) {
            userHasReviewed = true;
            userReview = { rating: found.rating, comment: found.comment };
          }
        }
        if (reviewPage === 1) {
          setReviews(reviewArr || []);
          setAlreadyReviewed(userHasReviewed);
          setMyReview(userReview);
        } else {
          setReviews(prev => {
            // Merge new reviews, but if user review is present, ensure alreadyReviewed is set
            const merged = [...prev, ...(reviewArr || [])];
            if (user && !userHasReviewed) {
              const found = merged.find(r => r.user === user.id || r.user?._id === user.id);
              if (found) {
                userHasReviewed = true;
                userReview = { rating: found.rating, comment: found.comment };
              }
            }
            setAlreadyReviewed(userHasReviewed);
            setMyReview(userReview);
            return merged;
          });
        }
        setReviewTotal(res.data.total || reviewArr.length || 0);
      })
      .catch(() => {
        setReviews([]);
        setAlreadyReviewed(false);
        setMyReview({ rating: 0, comment: '' });
      })
      .finally(() => setReviewLoading(false));
    // eslint-disable-next-line
  }, [product, user, reviewPage]);

  // Reset reviews when product changes
  useEffect(() => {
    setReviewPage(1);
  }, [product]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!user) {
      // Show login prompt instead of adding to cart
      alert('Please log in to add items to cart');
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(product._id, quantity);
    } catch (err) {
      console.error('ProductDetail: Error adding to cart:', err);
      // Optionally show notification/toast here
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    if (!user) {
      // Show login prompt instead of toggling wishlist
      alert('Please log in to add items to wishlist');
      return;
    }
    try {
      const isWishlisted = wishlist?.some(item =>
        typeof item === 'string' ? item === product._id : item._id === product._id
      );

      if (isWishlisted) {
        await removeFromWishlist(product);
      } else {
        await addToWishlist(product);
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  const handleLoadMoreSimilar = () => {
    fetchSimilar(similarPage + 1, true);
  };

  // Handler for loading more reviews
  const handleLoadMoreReviews = () => {
    setLoadingMoreReviews(true);
    setReviewPage(prev => prev + 1);
    setLoadingMoreReviews(false);
  };

  const isWishlisted = wishlist?.some(item =>
    typeof item === 'string' ? item === product?._id : item._id === product?._id
  );

  // Review form submit (create or update)
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewError(null);
    try {
      const payload = {
        rating: Number(myReview.rating),
        comment: myReview.comment?.trim?.() || "",
      };
      if (
        !payload.rating ||
        isNaN(payload.rating) ||
        payload.rating < 1 ||
        payload.rating > 5 ||
        !payload.comment ||
        payload.comment.length < 2
      ) {
        setReviewError("Please provide a valid rating (1-5) and a comment (at least 2 characters).");
        setReviewSubmitting(false);
        return;
      }

      // If already reviewed, update review (PUT), else create (POST)
      if (alreadyReviewed) {
        // Find the user's review id
        const myReviewObj = reviews.find(r => r.user === user.id || r.user?._id === user.id);
        if (myReviewObj && myReviewObj._id) {
          await api.put(`/products/${product._id}/reviews/${myReviewObj._id}`, payload);
          setReviews(revs =>
            revs.map(r =>
              r._id === myReviewObj._id
                ? { ...r, rating: payload.rating, comment: payload.comment }
                : r
            )
          );
          setAlreadyReviewed(true); // Ensure alreadyReviewed stays true
        }
      } else {
        await api.post(`/products/${product._id}/reviews`, payload);
        setAlreadyReviewed(true);
        setReviews(prev => [
          ...prev,
          {
            user: user.id,
            name: user.name,
            rating: payload.rating,
            comment: payload.comment,
            isVerifiedPurchaser: true,
          }
        ]);
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Like/unlike handler (no Authorization header needed)
  const handleLikeReview = async (reviewId) => {
    if (!user) {
      console.error("User is null or undefined. Check your AuthContext/provider.");
      return;
    }
    setLikeLoading(l => ({ ...l, [reviewId]: true }));
    try {
      // No Authorization header, just call the API
      await api.put(
        `/products/${product._id}/reviews/${reviewId}/like`
      );
      // Instead of refetching and updating reviews immediately,
      // do nothing here. The new order will only be reflected on page refresh.
      // Optionally, you can update just the likesCount/isLikedByUser for the clicked review:
      setReviews(revs =>
        revs.map(r =>
          r._id === reviewId
            ? {
              ...r,
              likesCount: r.isLikedByUser ? (r.likesCount || 1) - 1 : (r.likesCount || 0) + 1,
              isLikedByUser: !r.isLikedByUser,
            }
            : r
        )
      );
    } catch (err) {
      console.error("Error while liking review:", err, err?.response?.data);
    } finally {
      setLikeLoading(l => ({ ...l, [reviewId]: false }));
    }
  };

  // Scroll to review section
  const reviewSectionRef = React.useRef(null);
  const scrollToReviews = () => {
    reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handler for delete review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;
    try {
      await api.delete(`/products/${product._id}/reviews/${reviewId}`);
      setReviews(revs => revs.filter(r => r._id !== reviewId));
      setAlreadyReviewed(false); // Allow user to add a new review after deletion
      setMyReview({ rating: 0, comment: '' });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete review.");
    }
  };

  // Handler for opening edit modal
  const handleEditReview = (review) => {
    setEditReview({ ...review });
    setEditModalOpen(true);
  };

  // Handler for submitting edit review
  const handleEditReviewSubmit = async (e) => {
    e.preventDefault();
    if (!editReview) return;
    try {
      await api.put(`/products/${product._id}/reviews/${editReview._id}`, {
        rating: Number(editReview.rating),
        comment: editReview.comment,
      });
      setReviews(revs =>
        revs.map(r =>
          r._id === editReview._id
            ? { ...r, rating: Number(editReview.rating), comment: editReview.comment }
            : r
        )
      );
      setEditModalOpen(false);
      setMyReview({ rating: Number(editReview.rating), comment: editReview.comment });
      setAlreadyReviewed(true); // Ensure alreadyReviewed stays true after edit
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update review.");
    }
  };

  // Helper: is user's review in the currently displayed reviews?
  const isUserReviewInCurrentPage = () => {
    if (!user) return false;
    return reviews.some(r => r.user === user.id || r.user?._id === user.id);
  };

  // Helper: has the user already reviewed (across all pages)?
  const hasUserReviewed = React.useMemo(() => {
    if (!user) return false;
    // Check in all loaded reviews
    return reviews.some(r => r.user === user.id || r.user?._id === user.id);
  }, [user, reviews]);

  // Helper: check if user has reviewed by querying the backend (not just loaded reviews)
  const [dbUserHasReviewed, setDbUserHasReviewed] = useState(false);

  useEffect(() => {
    if (!product || !user) {
      setDbUserHasReviewed(false);
      return;
    }
    // Query backend for userOnly review
    api.get(`/products/${product._id}/reviews?userOnly=true`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => {
        const arr = Array.isArray(res.data.reviews) ? res.data.reviews : res.data;
        setDbUserHasReviewed(arr && arr.length > 0);
      })
      .catch(() => setDbUserHasReviewed(false));
  }, [product, user]);

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text>Loading product details...</Text>
        </Stack>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
          {error || 'Product not found'}
        </Alert>
        <Button
          component={Link}
          to="/products"
          variant="light"
          mt="md"
          leftSection={<IconArrowLeft size={16} />}
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  const images = product.images || [];
  const mainImage = images[selectedImage]?.url || product.featuredImage || '/images/placeholder.png';

  return (
    <Container size="lg" py="xs">
      {/* Breadcrumb */}
      <Group gap="xs" mb="lg">
        <Button
          component={Link}
          to="/products"
          variant="subtle"
          size="sm"
          leftSection={<IconArrowLeft size={16} />}
        >
          Back to Products
        </Button>
        <Text size="sm" c="dimmed">/</Text>
        <Text size="sm" c="dimmed">{product.category}</Text>
        <Text size="sm" c="dimmed">/</Text>
        <Text size="sm" fw={600}>{product.name}</Text>
      </Group>

      <Grid gutter="xs">
        {/* Product Images */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper radius="md" p="md" withBorder>
            <Stack gap="md">
              <Group align="flex-start" gap={16} >
                
                {/* noWrap was in above group 
                Thumbnails - vertical column */}
                {images.length > 1 && (
                  <Stack gap={8} align="center" style={{ width: 60 }}>
                    {images.map((img, index) => (
                      <Image
                        key={index}
                        src={img.url}
                        alt={`${product.name} ${index + 1}`}
                        width={48}
                        height={48}
                        fit="contain"
                        style={{
                          background: '#f8f9fa',
                          borderRadius: 6,
                          cursor: 'pointer',
                          border: selectedImage === index
                            ? '2.5px solid var(--mantine-color-blue-6)'
                            : '2px solid #e9ecef',
                          boxShadow: selectedImage === index
                            ? '0 0 0 2px var(--mantine-color-blue-2)'
                            : 'none',
                          opacity: selectedImage === index ? 1 : 0.85,
                          transition: 'border 0.2s, box-shadow 0.2s, opacity 0.2s',
                        }}  
                        onClick={() => setSelectedImage(index)}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = selectedImage === index ? '1' : '0.85')}
                      />
                    ))}
                  </Stack>
                )}

                {/* Main Image */}
                <div
                  style={{
                    width: 400,
                    height: 500,
                    background: '#f8f9fa',
                    borderRadius: 8,
                    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image
                    src={mainImage}
                    alt={product.name}
                    width="100%"
                    height="100%"
                    fit="cover"
                    style={{
                      objectPosition: 'center',
                      display: 'block',
                    }}
                    fallbackSrc="https://placehold.co/400x400?text=No+Image"
                  />
                </div>
              </Group>
            </Stack>
          </Paper>
        </Grid.Col>

        {/* Product Info */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="lg">
            {/* Basic Info */}
            <Stack gap="xs">
              <Group gap="xs">
                <Badge color={product.status === 'active' ? 'green' : 'yellow'}>{product.status}</Badge>
                {product.isFeatured && <Badge color="blue">Featured</Badge>}
                {product.isDiscounted && <Badge color="red">On Sale</Badge>}
              </Group>

              <Title order={1} size="2rem" fw={700}>{product.name}</Title>

              <Text size="lg" c="dimmed">{product.brand} • {product.category}</Text>

              {product.tags && product.tags.length > 0 && (
                <Group gap="xs">
                  {product.tags.slice(0, 5).map((tag, index) => (
                    <Badge
                      key={index}
                      color="blue"
                      variant="light"
                      size="sm"
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </Group>
              )}
            </Stack>
            {/* Price */}
            <Stack gap="xs">
              <Group gap="md" align="center">
                <Text size="2rem" fw={700} c={product.isDiscounted ? 'red' : undefined}>
                  रु{product.isDiscounted ? product.afterDiscountPrice : product.InitialPrice}
                </Text>
                {product.isDiscounted && (
                  <Text size="lg" c="dimmed" style={{ textDecoration: 'line-through' }}>
                    रु{product.InitialPrice}
                  </Text>
                )}
                {product.isDiscounted && (
                  <Badge color="red" size="lg">
                    {Math.round(((product.InitialPrice - product.afterDiscountPrice) / product.InitialPrice) * 100)}% OFF
                  </Badge>
                )}
              </Group>
            </Stack>

            {/* Stock Status */}
            <Group gap="md">
              <Text size="sm">
                Stock: <b>{product.stock}</b> {product.unit || 'pieces'} available
              </Text>
              {product.stock < 10 && product.stock > 0 && (
                <Badge color="orange" size="sm">Low Stock</Badge>
              )}
              {product.stock === 0 && (
                <Badge color="red" size="sm">Out of Stock</Badge>
              )}
            </Group>

            {/* Actions */}
            <Stack gap="md">
              <Group gap="md">
                <NumberInput
                  label="Quantity"
                  value={quantity}
                  onChange={setQuantity}
                  min={1}
                  max={product.stock}
                  style={{ width: 120 }}
                />
                <Button
                  size="lg"
                  radius="xl"
                  leftSection={<IconShoppingCart size={20} />}
                  onClick={handleAddToCart}
                  loading={addingToCart}
                  disabled={product.stock === 0}
                  style={{ flex: 1 }}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                <Tooltip label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}>
                  <ActionIcon
                    size="lg"
                    variant="light"
                    color={isWishlisted ? "pink" : "gray"}
                    onClick={handleWishlistToggle}
                  >
                    {isWishlisted ? <IconHeartFilled size={20} /> : <IconHeart size={20} />}
                  </ActionIcon>
                </Tooltip>
              </Group>
              <Group gap="md">
                <Button
                  variant="outline"
                  size="lg"
                  radius="xl"
                  onClick={scrollToReviews}
                  style={{ minWidth: 140 }}
                >
                  Rate & Review
                </Button>
              </Group>
            </Stack>

            {/* Features */}
            <Paper radius="md" p="md" withBorder>
              <Stack gap="md">
                <Title order={3} size="h5">Why Choose This Product?</Title>
                <Grid>
                  <Grid.Col span={6}>
                    <Group gap="sm">
                      <IconTruck size={20} color="var(--mantine-color-blue-6)" />
                      <Text size="sm">Free Shipping</Text>
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Group gap="sm">
                      <IconShield size={20} color="var(--mantine-color-green-6)" />
                      <Text size="sm">Secure Payment</Text>
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Group gap="sm">
                      <IconCreditCard size={20} color="var(--mantine-color-orange-6)" />
                      <Text size="sm">Easy Returns</Text>
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Group gap="sm">
                      <IconStar size={20} color="var(--mantine-color-yellow-6)" />
                      <Text size="sm">Quality Assured</Text>
                    </Group>
                  </Grid.Col>
                </Grid>
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>

      <Divider
        my="xl"
        size="xs"
        style={{
          borderTop: '2px solid rgba(0, 0, 0, 0.21)',
          boxShadow: '0 1px 6px rgba(0, 0, 0, 0.16)',
          opacity: 0.9,
          width: '100%',
        }}
      />


      {/* Similar Products */}
      <Stack gap="lg" mt="xl">
        <Title order={2} size="1.5rem" mb="sm">Similar Products</Title>
        {loadingSimilar ? (
          <Stack align="center" gap="md" py="xl">
            <Loader size="lg" />
            <Text>Loading similar products...</Text>
          </Stack>
        ) : similarProducts.length === 0 ? (
          <Text c="dimmed">No similar products found.</Text>
        ) : (
          <>
            <Grid gutter="md">
              {similarProducts.map((prod) => (
                <Grid.Col key={prod._id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                  <ProductCard product={prod} />
                </Grid.Col>
              ))}
            </Grid>
            {similarProducts.length < similarTotal && (
              <Group justify="center" mt="lg">
                <Button onClick={handleLoadMoreSimilar} loading={loadingMoreSimilar} size="md" variant="light">
                  Load More
                </Button>
              </Group>
            )}
          </>
        )}
      </Stack>

      <Divider
        my="xl"
        size="xs"
        style={{
          borderTop: '2px solid rgba(0, 0, 0, 0.21)',
          boxShadow: '0 1px 6px rgba(0, 0, 0, 0.16)',
          opacity: 0.9,
          width: '100%',
        }}
      />


      {/* Product Description */}
      <Paper radius="md" p="xl" withBorder shadow="sm" mt="xl">
        <Stack gap="lg">
          <Title order={2} size="1.5rem">Product Description</Title>
          <Text size="lg" style={{ lineHeight: 1.6 }}>
            {product.description}
          </Text>
        </Stack>
      </Paper>

      {/* Specifications */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <Paper radius="md" p="xl" withBorder shadow="sm" mt="lg">
          <Stack gap="lg">
            <Title order={2} size="1.5rem">Specifications</Title>
            <Grid>
              {Object.entries(product.specifications).map(([key, value]) => (
                <Grid.Col key={key} span={{ base: 12, sm: 6 }}>
                  <Group justify="space-between" p="xs" style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 8 }}>
                    <Text fw={600} size="sm">{key}</Text>
                    <Text size="sm">{value}</Text>
                  </Group>
                </Grid.Col>
              ))}
            </Grid>
          </Stack>
        </Paper>
      )}


      <ProductReviews />


      {/* Shipping Info */}
      {product.shippingInfo && (
        <Paper radius="md" p="xl" withBorder shadow="sm" mt="lg">
          <Stack gap="lg">
            <Title order={2} size="1.5rem">Shipping Information</Title>
            <Grid>
              {product.shippingInfo.weight && (
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <Text size="sm"><b>Weight:</b> {product.shippingInfo.weight}g</Text>
                </Grid.Col>
              )}
              {product.shippingInfo.dimensions && (
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <Text size="sm">
                    <b>Dimensions:</b> {product.shippingInfo.dimensions.length} × {product.shippingInfo.dimensions.width} × {product.shippingInfo.dimensions.height} cm
                  </Text>
                </Grid.Col>
              )}
              {product.warranty && (
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <Text size="sm"><b>Warranty:</b> {product.warranty}</Text>
                </Grid.Col>
              )}
            </Grid>
          </Stack>
        </Paper>
      )}


    </Container>
  );
};

export default ProductDetail;