import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container, Title, Text, Stack, Paper, Group, Loader, Alert, Button, Textarea, Rating, Badge, Menu, Modal, ActionIcon
} from '@mantine/core';
import { IconStarFilled, IconStar, IconThumbUp, IconThumbUpFilled } from '@tabler/icons-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const REVIEWS_PAGE_SIZE = 3;

const ProductReviews = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState({ rating: 0, comment: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [likeLoading, setLikeLoading] = useState({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editReview, setEditReview] = useState(null);

  // Fetch product and reviews
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        setError('Failed to load product reviews.' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Fetch reviews paginated
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/products/${id}/reviews?page=${reviewPage}&limit=${REVIEWS_PAGE_SIZE}`, {
      headers: user?.token ? { Authorization: `Bearer ${user.token}` } : undefined,
    })
      .then(res => {
        const reviewArr = Array.isArray(res.data.reviews) ? res.data.reviews : res.data;
        let userHasReviewed = false;
        let userReview = { rating: 0, comment: '' };
        if (user) {
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
          setReviews(prev => [...prev, ...(reviewArr || [])]);
        }
        setReviewTotal(res.data.total || reviewArr.length || 0);
      })
      .catch(() => {
        setReviews([]);
        setAlreadyReviewed(false);
        setMyReview({ rating: 0, comment: '' });
      })
      .finally(() => setLoading(false));
  }, [id, user, reviewPage]);

  // Review submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        rating: Number(myReview.rating),
        comment: myReview.comment?.trim?.() || "",
      };
      if (
        !payload.rating ||
        payload.rating < 1 ||
        payload.rating > 5 ||
        !payload.comment ||
        payload.comment.length < 2
      ) {
        setError("Please provide a valid rating (1-5) and a comment (at least 2 characters).");
        setSubmitting(false);
        return;
      }
      await api.post(`/products/${id}/reviews`, payload);
      setAlreadyReviewed(true);
      setReviews(prev => [
        {
          user: user.id,
          name: user.name,
          rating: payload.rating,
          comment: payload.comment,
          isVerifiedPurchaser: true,
        },
        ...prev,
      ]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  // Like/unlike review
  const handleLikeReview = async (reviewId) => {
    if (!user) return;
    setLikeLoading(l => ({ ...l, [reviewId]: true }));
    try {
      await api.put(`/products/${id}/reviews/${reviewId}/like`);
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
      // Optionally handle error
      setError(err.response?.data?.message || "Failed to like/unlike review.");
    } finally {
      setLikeLoading(l => ({ ...l, [reviewId]: false }));
    }
  };

  // Edit review
  const handleEditReview = (review) => {
    setEditReview({ ...review });
    setEditModalOpen(true);
  };
  const handleEditReviewSubmit = async (e) => {
    e.preventDefault();
    if (!editReview) return;
    try {
      await api.put(`/products/${id}/reviews/${editReview._id}`, {
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
      setAlreadyReviewed(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update review.");
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;
    try {
      await api.delete(`/products/${id}/reviews/${reviewId}`);
      setReviews(revs => revs.filter(r => r._id !== reviewId));
      setAlreadyReviewed(false);
      setMyReview({ rating: 0, comment: '' });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete review.");
    }
  };

  // Load more reviews
  const handleLoadMoreReviews = () => {
    setLoadingMore(true);
    setReviewPage(prev => prev + 1);
    setLoadingMore(false);
  };

  // User review on top, add (you)
  const sortedReviews = useMemo(() => {
    if (!user) return reviews;
    const idx = reviews.findIndex(r => r.user === user.id || r.user?._id === user.id);
    if (idx === -1) return reviews;
    const userReview = { ...reviews[idx], name: `${reviews[idx].name} (you)` };
    return [userReview, ...reviews.filter((_, i) => i !== idx)];
  }, [reviews, user]);

  if (loading) {
    return (
      <Container size="sm" py="xl">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text>Loading reviews...</Text>
        </Stack>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container size="sm" py="xl">
        <Alert color="red" title="Error">{error || 'Product not found.'}</Alert>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Title order={2} mb="md">{product.name} - Reviews</Title>
      <Paper p="md" mb="lg" withBorder>
        <Group gap="xs" align="center">
          <Text fw={700} size="lg">
            {product.rating?.toFixed(1) || 0} / 5
          </Text>
          {[1,2,3,4,5].map(i => (
            i <= Math.round(product.rating)
              ? <IconStarFilled key={i} size={18} color="#fab005" />
              : <IconStar key={i} size={18} color="#fab005" />
          ))}
          <Text size="sm" c="dimmed" ml={8}>
            {product.numReviews || reviewTotal || reviews.length} review{(product.numReviews || reviewTotal || reviews.length) === 1 ? '' : 's'}
          </Text>
        </Group>
      </Paper>

      {/* Review Form */}
      {user && !alreadyReviewed && (
        <Paper p="md" mb="lg" withBorder>
          <form onSubmit={handleSubmit}>
            <Stack gap="sm">
              <Text fw={600}>Leave a Review</Text>
              <Rating
                value={myReview.rating}
                onChange={value => setMyReview(r => ({ ...r, rating: value }))}
                size="lg"
                required
              />
              <Textarea
                placeholder="Write your review..."
                value={myReview.comment}
                onChange={e => setMyReview(r => ({ ...r, comment: e.target.value }))}
                minRows={3}
                required
              />
              <Button type="submit" loading={submitting} disabled={submitting || !myReview.rating || !myReview.comment}>
                Submit Review
              </Button>
              {error && <Alert color="red">{error}</Alert>}
            </Stack>
          </form>
        </Paper>
      )}

      {/* Reviews List */}
      <Stack gap="md">
        {sortedReviews.length === 0 ? (
          <Text c="dimmed">No reviews yet. Be the first to review this product!</Text>
        ) : (
          sortedReviews.map((review, idx) => (
            <Paper key={review._id || idx} p="md" withBorder>
              <Group gap="xs" align="center">
                <Text fw={600}>{review.name || 'Anonymous'}</Text>
                {review.isVerifiedPurchaser && (
                  <Badge color="green" size="xs">Verified Purchaser</Badge>
                )}
                <Rating value={review.rating} readOnly size="sm" />
                <Group gap={4} ml="auto">
                  <ActionIcon
                    variant={review.isLikedByUser ? "filled" : "light"}
                    color={review.isLikedByUser ? "blue" : "gray"}
                    size="sm"
                    onClick={() => handleLikeReview(review._id)}
                    loading={!!likeLoading[review._id]}
                    disabled={!user}
                    title={review.isLikedByUser ? "Unlike" : "Like"}
                  >
                    {review.isLikedByUser ? <IconThumbUpFilled size={18} /> : <IconThumbUp size={18} />}
                  </ActionIcon>
                  <Text size="xs" fw={600}>{review.likesCount || 0}</Text>
                  {user && (review.user === user.id || review.user?._id === user.id) && (
                    <Menu withinPortal position="bottom-end" shadow="md">
                      <Menu.Target>
                        <ActionIcon size="sm" variant="subtle" color="gray" style={{ marginLeft: 8 }}>
                          <span style={{ fontSize: 20, fontWeight: 700 }}>⋮</span>
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item onClick={() => handleEditReview(review)}>Update</Menu.Item>
                        <Menu.Item color="red" onClick={() => handleDeleteReview(review._id)}>Delete</Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  )}
                </Group>
              </Group>
              <Text size="sm" mt={4}>{review.comment}</Text>
            </Paper>
          ))
        )}
        {sortedReviews.length < reviewTotal && (
          <Button
            onClick={handleLoadMoreReviews}
            loading={loadingMore}
            size="sm"
            variant="light"
            style={{ alignSelf: 'flex-start' }}
          >
            Load More Reviews
          </Button>
        )}
      </Stack>
      {/* Edit Review Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Update Your Review"
        centered
        size="sm"
      >
        {editReview && (
          <form onSubmit={handleEditReviewSubmit}>
            <Stack gap="sm">
              <Rating
                value={editReview.rating}
                onChange={value => setEditReview(r => ({ ...r, rating: value }))}
                size="lg"
                required
              />
              <Textarea
                placeholder="Write your review..."
                value={editReview.comment}
                onChange={e => setEditReview(r => ({ ...r, comment: e.target.value }))}
                minRows={3}
                required
              />
              <Button type="submit" loading={submitting} disabled={submitting || !editReview.rating || !editReview.comment}>
                Update Review
              </Button>
            </Stack>
          </form>
        )}
      </Modal>
    </Container>
  );
};

export default ProductReviews;
