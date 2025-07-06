import React, { useRef, useEffect, useState } from "react";
import { Group, Button, Card, Text, Box, ActionIcon, ThemeIcon } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconDeviceTv, IconDeviceMobile, IconToolsKitchen2, IconDeviceLaptop, IconFridge, IconWashMachine, IconWindmill, IconDeviceWatch } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Map categories to Tabler icons and colors
const CATEGORY_ICONS = {
  "TV & Audio": { icon: IconDeviceTv, color: "blue" },
  "Mobile Phones": { icon: IconDeviceMobile, color: "blue" },
  "Kitchen Appliances": { icon: IconToolsKitchen2, color: "blue" },
  "Laptops": { icon: IconDeviceLaptop, color: "blue" },
  "Refrigerators": { icon: IconFridge, color: "blue" },
  "Washing Machines": { icon: IconWashMachine, color: "blue" },
  "Air Conditioners": { icon: IconWindmill, color: "blue" },
  "Small Gadgets": { icon: IconDeviceWatch, color: "blue" },
};

const fetchCategories = async () => {
  // Fetch from backend
  const res = await axios.get("/api/products/categories");
  return res.data.categories || [];
};

const ShopByCategory = () => {
  const [categories, setCategories] = useState([]);
  const [scrollIndex, setScrollIndex] = useState(0);
  const carouselRef = useRef(null);
  const navigate = useNavigate();
  const visibleCount = 6; // Number of categories visible at once
  const autoScrollInterval = 3500; // ms

  // Duplicate categories for seamless looping
  const [loopedCategories, setLoopedCategories] = useState([]);
  useEffect(() => {
    // Fetch categories from backend
    fetchCategories().then((cats) => {
      setCategories(cats);
      setLoopedCategories([
        ...cats.slice(-visibleCount),
        ...cats,
        ...cats.slice(0, visibleCount),
      ]);
      setScrollIndex(visibleCount); // Start at the "real" first
    });
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (categories.length <= visibleCount) return;
    const interval = setInterval(() => {
      setScrollIndex((prev) => prev + 1);
    }, autoScrollInterval);
    return () => clearInterval(interval);
  }, [categories, visibleCount]);

  // Scroll to the current index
  useEffect(() => {
    if (!carouselRef.current || loopedCategories.length === 0) return;
    const cardWidth = carouselRef.current.firstChild?.offsetWidth || 180;
    carouselRef.current.scrollTo({
      left: scrollIndex * cardWidth,
      behavior: "smooth",
    });
    // Infinite loop effect: when reaching the duplicated end/start, reset index instantly
    if (scrollIndex === 0) {
      setTimeout(() => {
        setScrollIndex(categories.length);
        carouselRef.current.scrollTo({
          left: categories.length * cardWidth,
          behavior: "auto",
        });
      }, 0); // no animation
    } else if (scrollIndex === categories.length + visibleCount) {
      setTimeout(() => {
        setScrollIndex(visibleCount);
        carouselRef.current.scrollTo({
          left: visibleCount * cardWidth,
          behavior: "auto",
        });
      }, 0); // no animation
    }
    // eslint-disable-next-line
  }, [scrollIndex, loopedCategories.length]);

  const handlePrev = () => {
    setScrollIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    setScrollIndex((prev) => prev + 1);
  };

  return (
    <Box my="lg">
      <Group justify="space-between" mb="md">
        <Text fw={700} size="xl">Shop by Category</Text>
      </Group>
      <Box style={{ position: "relative" }}>
        <Button
          variant="light"
          color="gray"
          style={{
            position: "absolute",
            left: -24, // Move button further left outside carousel
            top: "50%",
            zIndex: 10, // Ensure above all
            transform: "translateY(-50%)",
            borderRadius: "50%",
            width: 48,
            height: 48,
            boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
            transition: "background 0.2s, transform 0.15s, box-shadow 0.2s",
            background: "#f8fafc",
            cursor: "pointer",
            border: "2px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = "#e3e8ef";
            e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
            e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,0,0,0.18)";
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = "#f8fafc";
            e.currentTarget.style.transform = "translateY(-50%) scale(1)";
            e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.12)";
          }}
          onMouseDown={e => {
            e.currentTarget.style.transform = "translateY(-50%) scale(0.96)";
          }}
          onMouseUp={e => {
            e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
          }}
          onClick={handlePrev}
          disabled={categories.length <= visibleCount}
        >
          <IconChevronLeft size={28} />
        </Button>
        <Box
          ref={carouselRef}
          style={{
            overflowX: "auto",
            display: "flex",
            gap: 16,
            scrollBehavior: "smooth",
            padding: "0 48px",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {loopedCategories.map((cat, idx) => {
            const iconData = CATEGORY_ICONS[cat] || { icon: IconDeviceTv, color: "gray" };
            return (
              <Card
                key={cat + idx}
                shadow="sm"
                padding="md"
                radius="md"
                style={{
                  minWidth: 160,
                  maxWidth: 180,
                  flex: "0 0 160px",
                  cursor: "pointer",
                  border: "1px solid #eee",
                  background: "#fff",
                  transition: "transform 0.2s",
                  alignItems: "center",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
                onClick={() => navigate(`/products?category=${encodeURIComponent(cat)}`)}
              >
                <ThemeIcon
                  size={56}
                  radius="xl"
                  variant="light"
                  color={iconData.color}
                  style={{ margin: "16px auto 8px auto" }}
                >
                  <iconData.icon size={32} />
                </ThemeIcon>
                <Text align="center" mt="sm" fw={600} size="md" lineClamp={2}>
                  {cat}
                </Text>
              </Card>
            );
          })}
        </Box>
        <Button
          variant="light"
          color="gray"
          style={{
            position: "absolute",
            right: -24, // Move button further right outside carousel
            top: "50%",
            zIndex: 10, // Ensure above all
            transform: "translateY(-50%)",
            borderRadius: "50%",
            width: 48,
            height: 48,
            boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
            transition: "background 0.2s, transform 0.15s, box-shadow 0.2s",
            background: "#f8fafc",
            cursor: "pointer",
            border: "2px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = "#e3e8ef";
            e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
            e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,0,0,0.18)";
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = "#f8fafc";
            e.currentTarget.style.transform = "translateY(-50%) scale(1)";
            e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.12)";
          }}
          onMouseDown={e => {
            e.currentTarget.style.transform = "translateY(-50%) scale(0.96)";
          }}
          onMouseUp={e => {
            e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
          }}
          onClick={handleNext}
          disabled={categories.length <= visibleCount}
        >
          <IconChevronRight size={28} />
        </Button>
      </Box>
    </Box>
  );
};


export default ShopByCategory;
