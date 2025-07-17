import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Button,
  Stack,
  Group,
  Alert,
  Loader,
  Badge
} from '@mantine/core';
import { IconUser, IconMail, IconCheck, IconLock, IconPencil, IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    // email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [showVerifyInput, setShowVerifyInput] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  // Password change state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwords, setPasswords] = useState({ old: '', new1: '', new2: '' });
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        // email: user.email || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Call backend to update name
      const res = await api.put(`/users/change-username/${user.id}`, { newName: formData.name });
      setUser(prev => ({ ...prev, name: res.data.user.name }));
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Email verification handlers
  const handleSendVerification = async () => {
    setVerifying(true);
    setVerifyMsg('');
    setVerifyError('');
    try {
      await api.post('/users/resend-code', { email: user.email });
      setVerifyMsg('Verification code sent to your email.');
      setShowVerifyInput(true);
    } catch (err) {
      setVerifyError(err.response?.data?.message || 'Failed to send verification code.');
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyEmail = async () => {
    setVerifying(true);
    setVerifyMsg('');
    setVerifyError('');
    try {
      // Call verify endpoint
      // await api.post('/users/verify-email', { code: verifyCode });
      await api.post('/users/verify-code', { email: user.email, code: verifyCode });
      setVerifyMsg('Email verified successfully!');
      setShowVerifyInput(false);
      // Fetch latest user profile and update context
      const res = await api.get('/users/me');
      setUser(res.data);
    } catch (err) {
      setVerifyError(err.response?.data?.message || 'Verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  // Password change handler (optional, backend endpoint required)
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');
    setPasswordLoading(true);
    if (!passwords.old || !passwords.new1 || !passwords.new2) {
      setPasswordError('All password fields are required.');
      setPasswordLoading(false);
      return;
    }
    if (passwords.new1 !== passwords.new2) {
      setPasswordError('New passwords do not match.');
      setPasswordLoading(false);
      return;
    }
    try {
      await api.post('/users/change-password', {
        oldPassword: passwords.old,
        newPassword: passwords.new1
      });
      setPasswordMsg('Password changed successfully!');
      setPasswords({ old: '', new1: '', new2: '' });
      setShowChangePassword(false);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <Container size="sm" py="xl">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text>Loading profile...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Paper radius="md" p="xl" withBorder shadow="md">
        <Stack gap="lg">
          <Stack align="center" gap="xs">
            <Title order={1} size="2.5rem" fw={900} ta="center">
              My Profile
            </Title>
            <Text size="lg" c="dimmed" ta="center">
              Update your personal information
            </Text>
          </Stack>

          {/* Email Verification Status */}
          <Paper withBorder p="md" radius="md" bg="gray.0">
            <Group gap="md" align="center">
              <IconMail size={20} />
              <Text fw={600}>{user.email}</Text>
              {/* {console.log(user)} */}
              {user.isEmailVerified ? (
                <Badge color="green" leftSection={<IconCheck size={14} />}>Email Verified</Badge>
              ) : (
                <Badge color="yellow" leftSection={<IconAlertCircle size={14} />}>Not Verified</Badge>
              )}
              {!user.isEmailVerified && (
                <Button
                  size="xs"
                  color="blue"
                  loading={verifying}
                  onClick={handleSendVerification}
                  disabled={verifying}
                >
                  Verify Email
                </Button>
              )}
            </Group>
            {verifyMsg && <Alert color="green" mt="sm">{verifyMsg}</Alert>}
            {verifyError && <Alert color="red" mt="sm">{verifyError}</Alert>}
            {showVerifyInput && (
              <Group mt="sm" gap="sm" align="end">
                <TextInput
                  label="Enter Verification Code"
                  value={verifyCode}
                  onChange={e => setVerifyCode(e.target.value)}
                  size="sm"
                  style={{ maxWidth: 180 }}
                />
                <Button
                  size="sm"
                  color="green"
                  loading={verifying}
                  onClick={handleVerifyEmail}
                  disabled={verifying || !verifyCode}
                >
                  Submit Code
                </Button>
              </Group>
            )}
          </Paper>

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red">
              {error}
            </Alert>
          )}

          {success && (
            <Alert icon={<IconCheck size={16} />} color="green">
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <Group align="end" gap={4}>
                <TextInput
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  leftSection={<IconUser size={16} />}
                  required
                  readOnly={!editingName}
                  style={{ flex: 1 }}
                />
                {!editingName && (
                  <Button
                    variant="subtle"
                    px={6}
                    onClick={() => setEditingName(true)}
                    aria-label="Edit Name"
                    style={{ marginBottom: 4 }}
                  >
                    <IconPencil size={18} />
                  </Button>
                )}
              </Group>

              {editingName && (
                <Group gap="md" mt="md">
                  <Button
                    type="submit"
                    loading={loading}
                    style={{ flex: 1 }}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFormData({ ...formData, name: user.name });
                      setEditingName(false);
                    }}
                    style={{ flex: 1 }}
                  >
                    Reset
                  </Button>
                </Group>
              )}
            </Stack>
          </form>

          {/* Change Password Section */}
          <Paper withBorder p="md" radius="md" bg="gray.0">
            <Group gap="md" align="center">
              <IconLock size={20} />
              <Text fw={600}>Change Password</Text>
              <Button
                size="xs"
                variant={showChangePassword ? "filled" : "outline"}
                color="blue"
                onClick={() => setShowChangePassword(v => !v)}
              >
                {showChangePassword ? "Cancel" : "Change Password"}
              </Button>
            </Group>
            {showChangePassword && (
              <form onSubmit={handleChangePassword}>
                <Stack gap="sm" mt="sm">
                  <TextInput
                    label="Current Password"
                    type="password"
                    value={passwords.old}
                    onChange={e => setPasswords(p => ({ ...p, old: e.target.value }))}
                    required
                  />
                  <TextInput
                    label="New Password"
                    type="password"
                    value={passwords.new1}
                    onChange={e => setPasswords(p => ({ ...p, new1: e.target.value }))}
                    required
                  />
                  <TextInput
                    label="Confirm New Password"
                    type="password"
                    value={passwords.new2}
                    onChange={e => setPasswords(p => ({ ...p, new2: e.target.value }))}
                    required
                  />
                  <Button type="submit" loading={passwordLoading}>
                    Save Password
                  </Button>
                  {passwordMsg && <Alert color="green">{passwordMsg}</Alert>}
                  {passwordError && <Alert color="red">{passwordError}</Alert>}
                </Stack>
              </form>
            )}
          </Paper>

          {/* User Info Display */}
          <Stack gap="md" mt="lg">
            <Title order={3} size="h4">Account Information</Title>
            <Group gap="md">
              <Text size="sm" fw={600}>Role:</Text>
              <Text size="sm">{user.role === 'admin' ? 'Admin' : 'Customer'}</Text>
            </Group>
            <Group gap="md">
              <Text size="sm" fw={600}>Member Since:</Text>
              <Text size="sm">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</Text>
            </Group>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Profile;
