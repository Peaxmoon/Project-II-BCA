import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, TextInput, PasswordInput, Button, Title, Text, Alert, Stack } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Container
      size="xs"
      py="xl"
      style={{
        height: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Paper radius="md" p="xl" withBorder shadow="md" style={{ width: "100%", maxWidth: "400px" }}>
        <Title order={2} ta="center" mb="lg">
          Login to Your Account
        </Title>
        
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
            />
            <Button type="submit" loading={loading} fullWidth>
              Login
            </Button>
          </Stack>
        </form>

        <Text ta="center" mt="md">
          Don&apos;t have an account?{' '}
          <Text component="a" href="/register" c="blue" style={{ textDecoration: 'none' }}>
            Register here
          </Text>
        </Text>
      </Paper>
    </Container>
  );
};

export default Login;
