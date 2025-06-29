import React, { useEffect, useState } from 'react';
import { 
  Title, 
  Text, 
  Paper, 
  Table, 
  Badge, 
  Group, 
  Button, 
  Select, 
  Stack, 
  Loader, 
  Alert,
  ActionIcon,
  Modal,
  TextInput,
  Menu
} from '@mantine/core';
import { IconAlertCircle, IconEye, IconTrash, IconMenu2 } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import api from '../../services/api';
import AdminLayout from './AdminLayout';

const roleOptions = [
  { value: 'customer', label: 'Customer' },
  { value: 'admin', label: 'Admin' }
];

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editModal, setEditModal] = useState(false);

  // Role editing state
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [confirmRoleModal, setConfirmRoleModal] = useState(false);
  const [pendingRoleUserId, setPendingRoleUserId] = useState(null);

  // Delete confirmation state
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [pendingDeleteUserId, setPendingDeleteUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Start editing role
  const handleEditRole = (user) => {
    setEditingUserId(user._id);
    setSelectedRole(user.role);
  };

  // When admin selects a new role, show confirmation
  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setPendingRoleUserId(editingUserId);
    setConfirmRoleModal(true);
  };

  // Confirm role update
  const handleConfirmRole = async () => {
    try {
      await api.put(`/users/${pendingRoleUserId}/role`, { role: selectedRole });
      notifications.show({ color: 'green', title: 'User Updated', message: 'User role updated successfully.' });
      setEditingUserId(null);
      setConfirmRoleModal(false);
      setPendingRoleUserId(null);
      fetchUsers();
    } catch (err) {
      notifications.show({ color: 'red', title: 'Error', message: err.response?.data?.message || 'Failed to update user' });
    }
  };

  // Cancel role update
  const handleCancelRole = () => {
    setConfirmRoleModal(false);
    setPendingRoleUserId(null);
    setEditingUserId(null);
  };

  // Start delete confirmation
  const handleDeleteUser = (userId) => {
    setPendingDeleteUserId(userId);
    setConfirmDeleteModal(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/users/${pendingDeleteUserId}`);
      notifications.show({ color: 'green', title: 'User Deleted', message: 'User deleted successfully.' });
      setConfirmDeleteModal(false);
      setPendingDeleteUserId(null);
      fetchUsers();
    } catch (err) {
      notifications.show({ color: 'red', title: 'Error', message: err.response?.data?.message || 'Failed to delete user' });
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setConfirmDeleteModal(false);
    setPendingDeleteUserId(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <Group justify="center" mt="xl">
          <Loader size="lg" />
        </Group>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
          {error}
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Title order={2} mb="lg">Users Management</Title>
      
      <Paper radius="md" p="xl" withBorder shadow="sm">
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={600} size="lg">All Users ({users.length})</Text>
            <Button variant="light" onClick={fetchUsers}>Refresh</Button>
          </Group>

          {users.length === 0 ? (
            <Text ta="center" c="dimmed" py="xl">No users found</Text>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Role</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Joined</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {users.map((user) => (
                  <Table.Tr key={user._id}>
                    <Table.Td>
                      <Text size="sm" fw={600}>{user.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{user.email}</Text>
                    </Table.Td>
                    <Table.Td>
                      {editingUserId === user._id ? (
                        <Select
                          data={roleOptions}
                          value={selectedRole}
                          onChange={handleRoleChange}
                          styles={{ input: { minHeight: 28 } }}
                          withinPortal
                        />
                      ) : (
                        <Text size="sm">
                          {user.role === 'admin' ? 'Admin' : 'Customer'}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Badge color={user.isEmailVerified ? 'green' : 'yellow'} size="sm">
                        {user.isEmailVerified ? 'Verified' : 'Pending'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{new Date(user.createdAt).toLocaleDateString()}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Menu withinPortal position="bottom-end" shadow="md">
                        <Menu.Target>
                          <ActionIcon size="sm" variant="light" color="gray">
                            <IconMenu2 size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEye size={14} />}
                            onClick={() => {
                              setSelectedUser(user);
                              setEditModal(true);
                            }}
                          >
                            View Details
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconMenu2 size={14} />}
                            onClick={() => handleEditRole(user)}
                          >
                            Edit Role
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            Delete User
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Paper>

      {/* User Details Modal */}
      <Modal 
        opened={editModal} 
        onClose={() => setEditModal(false)} 
        title="User Details"
        size="md"
      >
        {selectedUser && (
          <Stack gap="md">
            <TextInput label="Name" value={selectedUser.name} readOnly />
            <TextInput label="Email" value={selectedUser.email} readOnly />
            <TextInput label="Role" value={selectedUser.role === 'admin' ? 'Admin' : 'Customer'} readOnly />
            <TextInput label="Status" value={selectedUser.isEmailVerified ? 'Verified' : 'Pending'} readOnly />
            <TextInput label="Joined" value={new Date(selectedUser.createdAt).toLocaleString()} readOnly />
            <TextInput label="Last Updated" value={new Date(selectedUser.updatedAt).toLocaleString()} readOnly />
          </Stack>
        )}
      </Modal>

      {/* Confirm Role Change Modal */}
      <Modal
        opened={confirmRoleModal}
        onClose={handleCancelRole}
        title="Confirm Role Change"
        centered
      >
        <Text>Are you sure you want to change this user's role to <b>{selectedRole}</b>?</Text>
        <Group mt="md" justify="flex-end">
          <Button variant="default" onClick={handleCancelRole}>Cancel</Button>
          <Button color="red" onClick={handleConfirmRole}>Confirm</Button>
        </Group>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        opened={confirmDeleteModal}
        onClose={handleCancelDelete}
        title="Confirm Delete User"
        centered
      >
        <Text>Are you sure you want to delete this user? This action cannot be undone.</Text>
        <Group mt="md" justify="flex-end">
          <Button variant="default" onClick={handleCancelDelete}>Cancel</Button>
          <Button color="red" onClick={handleConfirmDelete}>Delete</Button>
        </Group>
      </Modal>
    </AdminLayout>
  );
};

export default UsersManagement;