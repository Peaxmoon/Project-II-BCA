import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container, Title, Text, Stack, Paper, Group, Loader, Alert, Button, Textarea, Rating, Badge
} from '@mantine/core';
import { IconStarFilled, IconStar } from '@tabler/icons-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

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

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
        setReviews(res.data.reviews || []);
        if (user) {
          const found = res.data.reviews?.find(r => r.user === user.id || r.user?._id === user.id);
          if (found) {
            setAlreadyReviewed(true);
            setMyReview({ rating: found.rating, comment: found.comment });
          }
        }
      } catch (err) {
        setError('Failed to load product reviews.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    // eslint-disable-next-line
  }, [id, user]);

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
        ...prev,
        {
          user: user.id,
          name: user.name,
          rating: payload.rating,
          comment: payload.comment,
          isVerifiedPurchaser: true, // Assume backend tags this, but for instant UI
        }
      ]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

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
            {product.numReviews || reviews.length} review{(product.numReviews || reviews.length) === 1 ? '' : 's'}
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
        {reviews.length === 0 ? (
          <Text c="dimmed">No reviews yet. Be the first to review this product!</Text>
        ) : (
          reviews.map((review, idx) => (
            <Paper key={idx} p="md" withBorder>
              <Group gap="xs" align="center">
                <Text fw={600}>{review.name || 'Anonymous'}</Text>
                {review.isVerifiedPurchaser && (
                  <Badge color="green" size="xs">Verified Purchaser</Badge>
                )}
                <Rating value={review.rating} readOnly size="sm" />
              </Group>
              <Text size="sm" mt={4}>{review.comment}</Text>
            </Paper>
          ))
        )}
      </Stack>
    </Container>
  );
};

export default ProductReviews;
