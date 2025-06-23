import React, { useState } from 'react';
import { Card, Image, Text, Group, Badge, Stack, Tooltip, ActionIcon, Transition } from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { IconHeart, IconHeartFilled, IconStar, IconStarFilled, IconMessageCircle2 } from '@tabler/icons-react';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';

// Add a new prop: compact (for cart view)
const ProductCard = ({
  product,
  children,
  showStatus = true,
  showStock = true,
  showTags = true,
  showView = true,
  compact = false, // NEW: compact mode for cart
}) => {
  const {
    _id,
    name,
    brand,
    category,
    InitialPrice,
    afterDiscountPrice,
    isDiscounted,
    stock,
    status,
    tags,
    images,
    featuredImage,
  } = product;

  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const navigate = useNavigate();

  const imgSrc = images?.[0]?.url || featuredImage || '/images/placeholder.png';
  const isWishlisted = wishlist?.some(item =>
    typeof item === 'string' ? item === _id : item._id === _id
  );

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlistLoading(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(product);
      } else {
        await addToWishlist(product);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCartLoading(true);
    try {
      await addToCart(_id, 1);
    } catch (error) {
      console.error('ProductCard: Error adding to cart:', error);
    } finally {
      setIsCartLoading(false);
    }
  };

  const handleCardClick = (e) => {
    if (e.target.closest('.wishlist-action')) return;
    navigate(`/products/${_id}`);
  };

  const numReviews = product.numReviews ?? (product.reviews ? product.reviews.length : 0);
  const rating = product.rating ?? (
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / product.reviews.length
      : 0
  );

  // --- COMPACT CARD FOR CART ---
  if (compact) {
    return (
      <Card
        shadow="xs"
        padding="xs"
        radius="md"
        withBorder
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          minHeight: 80,
          maxHeight: 100,
          width: '100%',
          background: '#fcfcfd',
        }}
      >
        <Image
          src={imgSrc}
          width={60}
          height={60}
          fit="contain"
          alt={name}
          style={{
            borderRadius: 8,
            background: '#f8f9fa',
            objectFit: 'contain',
            minWidth: 60,
            maxWidth: 60,
          }}
          fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='%23f8f9fa'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='10' fill='%236c757d'%3ENo Image%3C/text%3E%3C/svg%3E"
        />
        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Group gap={6} align="center">
            <Text fw={600} size="sm" lineClamp={1} style={{ cursor: 'pointer', minWidth: 0 }} onClick={handleCardClick}>
              {name}
            </Text>
            {showStatus && status && (
              <Badge color={status === 'active' ? 'green' : status === 'inactive' ? 'yellow' : 'gray'} size="xs">
                {status}
              </Badge>
            )}
          </Group>
          <Text size="xs" c="dimmed" lineClamp={1} style={{ minWidth: 0 }}>
            {brand} &bull; {category}
          </Text>
          <Group gap={6} align="center">
            <Text size="sm" fw={700} c={isDiscounted ? 'red' : undefined}>
              रु{isDiscounted ? afterDiscountPrice : InitialPrice}
            </Text>
            {isDiscounted && (
              <Text size="xs" c="dimmed" style={{ textDecoration: 'line-through' }}>
                रु{InitialPrice}
              </Text>
            )}
          </Group>
          {showStock && (
            <Text size="xs" c="dimmed">
              Stock: <b>{stock}</b>
            </Text>
          )}
        </Stack>
        {children}
      </Card>
    );
  }

  // --- DEFAULT PRODUCT CARD ---
  return (
    <Card 
      shadow="sm" 
      padding="lg" 
      radius="md" 
      withBorder 
      style={{ 
        width: 260,
        minWidth: 220,
        maxWidth: 280,
        height: 430,
        minHeight: 410,
        maxHeight: 440,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: isHovered ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: isHovered ? '0 12px 32px rgba(255, 0, 128, 0.10), 0 8px 25px rgba(0,0,0,0.15)' : undefined,
        margin: '0 auto',
        position: 'relative',
        overflow: 'visible',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Wishlist Button - top left, large, lively, appears on hover */}
      <Transition mounted={isHovered} transition="pop" duration={200}>
        {(styles) => (
          <div
            className="wishlist-action"
            style={{
              ...styles,
              position: 'absolute',
              top: 12,
              left: 12,
              zIndex: 2,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.95)',
              boxShadow: '0 2px 12px rgba(255,0,128,0.10)',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Tooltip label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"} position="right" withArrow>
              <ActionIcon
                size={38}
                variant={isWishlisted ? "filled" : "light"}
                color="pink"
                radius="xl"
                loading={isWishlistLoading}
                onClick={handleWishlistToggle}
                style={{
                  transition: 'all 0.2s',
                  boxShadow: isWishlisted ? '0 0 0 2px #f06595' : undefined,
                  background: isWishlisted ? 'linear-gradient(135deg, #f06595 0%, #fa5252 100%)' : undefined,
                  color: isWishlisted ? 'white' : '#f06595'
                }}
              >
                {isWishlisted ? <IconHeartFilled size={26} /> : <IconHeart size={26} />}
              </ActionIcon>
            </Tooltip>
          </div>
        )}
      </Transition>

      <Card.Section 
        style={{ 
          height: 170, 
          minHeight: 170,
          maxHeight: 170,
          overflow: 'hidden', 
          background: '#f8f9fa', 
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Image
          src={imgSrc}
          height={150}
          alt={name}
          fit="contain"
          style={{ objectFit: 'contain', width: '100%', height: 150, maxWidth: 180, margin: '0 auto' }}
          fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='180' viewBox='0 0 300 180'%3E%3Crect width='300' height='180' fill='%23f8f9fa'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='16' fill='%236c757d'%3ENo Image%3C/text%3E%3C/svg%3E"
        />
        
        {/* Discount Percentage Badge */}
        {isDiscounted && InitialPrice > 0 && (
          <Badge
            color="red"
            size="md"
            variant="filled"
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 2,
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: 0.5,
              boxShadow: '0 2px 8px rgba(255,0,0,0.08)'
            }}
          >
            {Math.round(((InitialPrice - afterDiscountPrice) / InitialPrice) * 100)}% OFF
          </Badge>
        )}
      </Card.Section>
      
      <Group justify="space-between" mt="md" mb="xs">
        <Tooltip label={name}>
          <Text fw={600} lineClamp={1} style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</Text>
        </Tooltip>
        {showStatus && status && (
          <Badge color={status === 'active' ? 'green' : status === 'inactive' ? 'yellow' : 'gray'}>{status}</Badge>
        )}
      </Group>
      
      <Text size="sm" c="dimmed" mb="xs" lineClamp={1} style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{brand} &bull; {category}</Text>
      
      {/* Star Rating and Reviews */}
      <Group gap={4} mb="xs">
        {/* Render stars based on rating */}
        {[1,2,3,4,5].map(i => (
          i <= Math.round(rating)
            ? <IconStarFilled key={i} size={16} color="#fab005" />
            : <IconStar key={i} size={16} color="#fab005" />
        ))}
        <Text size="xs" c="dimmed" ml={4}>
          {numReviews} review{numReviews === 1 ? '' : 's'}
        </Text>
        <ActionIcon
          size="sm"
          variant="light"
          color="blue"
          component={Link}
          to={`/products/${_id}/reviews`}
          title="View all reviews"
          style={{ marginLeft: 8 }}
          onClick={e => e.stopPropagation()}
        >
          <IconMessageCircle2 size={16} />
        </ActionIcon>
      </Group>

      <Stack gap={2} mb="xs">
        {showStock && <Text size="sm">Stock: <b>{stock}</b></Text>}
        <Group gap={6} align="center">
          <Text size="sm" fw={700} c={isDiscounted ? 'red' : undefined}>
            रु{isDiscounted ? afterDiscountPrice : InitialPrice}
          </Text>
          {isDiscounted && (
            <Text size="sm" c="dimmed" style={{ textDecoration: 'line-through' }}>रु{InitialPrice}</Text>
          )}
        </Group>
      </Stack>
      
      {showTags && tags && tags.length > 0 && (
        <Group gap={4} mb="xs">
          {tags.slice(0, 3).map((tag, i) => (
            <Badge key={i} color="blue" variant="light" size="xs">{tag}</Badge>
          ))}
        </Group>
      )}
      
      {/* Remove Details and Add to Cart buttons from front card */}
      {/* <Group gap="xs" mt="sm" justify="space-between">
        {children || (
          <>
            ...Details and Add to Cart buttons...
          </>
        )}
      </Group> */}
    </Card>
  );
};

export default ProductCard;