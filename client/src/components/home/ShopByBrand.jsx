import React from "react";
import { Group, Card, Text, Box, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";

const BRAND_LOGOS = {
  "LG": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/LG_logo_%282015%29.svg/2560px-LG_logo_%282015%29.svg.png",
  "Samsung": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/2560px-Samsung_Logo.svg.png",
  "Whirlpool": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Whirlpool_Corporation_Logo.svg/2560px-Whirlpool_Corporation_Logo.svg.png",
  "Xiaomi": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Xiaomi_logo_%282021-%29.svg/2560px-Xiaomi_logo_%282021-%29.svg.png",
  "Philips": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Philips_logo_new.svg/2560px-Philips_logo_new.svg.png",
  "Dell": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Dell_Logo.png/2560px-Dell_Logo.png"
};

const ShopByBrand = () => {
  const navigate = useNavigate();

  return (
    <Box my="xl">
      <Title order={2} size="h2" fw={700} ta="center" mb="xl">
        Shop By Brand
      </Title>
      <Group justify="center" grow wrap>
        {Object.entries(BRAND_LOGOS).map(([brand, logo]) => (
          <Card
            key={brand}
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{
              cursor: 'pointer',
              maxWidth: 200,
              margin: '10px',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}
            onClick={() => navigate(`/products?brand=${encodeURIComponent(brand)}`)}
          >
            <Card.Section p="md">
              <img 
                src={logo} 
                alt={brand}
                style={{
                  width: '100%',
                  height: '60px',
                  objectFit: 'contain'
                }}
              />
            </Card.Section>
            <Text ta="center" fw={500} mt="sm">
              {brand}
            </Text>
          </Card>
        ))}
      </Group>
    </Box>
  );
};

export default ShopByBrand;
