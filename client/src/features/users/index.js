import { useState } from 'react';
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ROLES } from '../../config/apiConfig.js';
import {
  useUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeactivateUserMutation,
} from './services/usersQueries.js';

const { Title } = Typography;

const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.BILLING_EXECUTIVE]: 'Billing Executive',
};

export default function Users() {
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: users = [], isLoading } = useUsersQuery();
  const createUser = useCreateUserMutation();
  const updateUser = useUpdateUserMutation();
  const deactivateUser = useDeactivateUserMutation();

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ role: ROLES.BILLING_EXECUTIVE });
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    form.setFieldsValue({
      name: user.name,
      username: user.username,
      role: user.role,
      password: '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        const payload = { id: editing._id, ...values };
        if (!payload.password) delete payload.password;
        await updateUser.mutateAsync(payload);
        message.success('User updated');
      } else {
        await createUser.mutateAsync(values);
        message.success('User created');
      }
      setModalOpen(false);
    } catch (err) {
      if (err?.errorFields) return; // form validation error
      const msg = err?.response?.data?.message || 'Something went wrong';
      message.error(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const handleDeactivate = async (user) => {
    try {
      await deactivateUser.mutateAsync(user._id);
      message.success('User deactivated');
    } catch {
      message.error('Could not deactivate user');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Username', dataIndex: 'username', key: 'username' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === ROLES.ADMIN ? 'geekblue' : 'green'}>
          {ROLE_LABELS[role] || role}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active) => (
        <Tag color={active ? 'success' : 'default'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, user) => (
        <Space>
          <Button size="small" onClick={() => openEdit(user)}>
            Edit
          </Button>
          <Popconfirm
            title="Deactivate this user?"
            onConfirm={() => handleDeactivate(user)}
            okText="Deactivate"
            okButtonProps={{ danger: true }}
            disabled={!user.isActive}
          >
            <Button size="small" danger disabled={!user.isActive}>
              Deactivate
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space
        style={{
          width: '100%',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          User Management
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Add User
        </Button>
      </Space>

      <Table
        rowKey="_id"
        loading={isLoading}
        columns={columns}
        dataSource={users}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editing ? 'Edit User' : 'Add User'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={createUser.isPending || updateUser.isPending}
        okText={editing ? 'Save' : 'Create'}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Full Name"
            name="name"
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input placeholder="e.g. Priyanka" />
          </Form.Item>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, min: 3, message: 'Min 3 characters' }]}
          >
            <Input placeholder="e.g. priyanka" />
          </Form.Item>
          <Form.Item
            label={editing ? 'New Password (leave blank to keep)' : 'Password'}
            name="password"
            rules={
              editing
                ? []
                : [{ required: true, message: 'Password is required' }]
            }
            extra="Min 8 chars, with an uppercase letter and a number"
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Role is required' }]}
          >
            <Select
              options={[
                { value: ROLES.ADMIN, label: 'Admin' },
                {
                  value: ROLES.BILLING_EXECUTIVE,
                  label: 'Billing Executive',
                },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}