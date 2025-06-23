import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, TextInput, PasswordInput, Button, Title, Text, Alert } from '@mantine/core';
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
    <Container size="sm" py="xl">
      <Paper radius="md" p="xl" withBorder shadow="md">
        <Title order={2} ta="center" mb="lg">
          Login to Your Account
        </Title>
        
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextInput
            label="Email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            mb="md"
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            required
            mb="lg"
          />
          <Button type="submit" fullWidth loading={loading}>
            Login
          </Button>
        </form>

        <Text ta="center" mt="md">
          Don't have an account?{' '}
          <Text component="a" href="/register" c="blue" style={{ textDecoration: 'none' }}>
            Register here
          </Text>
        </Text>
      </Paper>
    </Container>
  );
};

export default Login;
