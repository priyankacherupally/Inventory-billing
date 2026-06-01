import { useMemo, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import SupplierDrawer from './SupplierDrawer.js';
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
} from './services/suppliersQueries.js';

const { Title } = Typography;

export default function Suppliers() {
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [manageId, setManageId] = useState(null);

  const { data: suppliers = [], isLoading } = useSuppliers();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();

  const managed = useMemo(
    () => suppliers.find((s) => s._id === manageId) || null,
    [suppliers, manageId],
  );

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };
  const openEdit = (s) => {
    setEditing(s);
    form.setFieldsValue({ name: s.name, address: s.address, contact: s.contact });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    try {
      if (editing) {
        await updateSupplier.mutateAsync({ id: editing._id, ...values });
        message.success('Supplier updated');
      } else {
        await createSupplier.mutateAsync(values);
        message.success('Supplier created');
      }
      setModalOpen(false);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Something went wrong';
      message.error(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const toggleStatus = async (s) => {
    try {
      await updateSupplier.mutateAsync({
        id: s._id,
        status: s.status === 'active' ? 'inactive' : 'active',
      });
      message.success('Status updated');
    } catch {
      message.error('Could not update status');
    }
  };

  const columns = [
    { title: 'Supplier', dataIndex: 'name', key: 'name' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
    { title: 'Contact', dataIndex: 'contact', key: 'contact', render: (c) => c || '—' },
    {
      title: 'Designs',
      key: 'pvCount',
      render: (_, s) => s.purchaseVariants?.length || 0,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s) => (
        <Tag color={s === 'active' ? 'success' : 'default'}>
          {s === 'active' ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, s) => (
        <Space>
          <Button type="primary" size="small" onClick={() => setManageId(s._id)}>
            Manage
          </Button>
          <Button size="small" onClick={() => openEdit(s)}>
            Edit
          </Button>
          <Button
            size="small"
            danger={s.status === 'active'}
            onClick={() => toggleStatus(s)}
          >
            {s.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 32 }}>
      <Space
        style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Suppliers
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Add Supplier
        </Button>
      </Space>

      <Table
        rowKey="_id"
        loading={isLoading}
        columns={columns}
        dataSource={suppliers}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editing ? 'Edit Supplier' : 'Add Supplier'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editing ? 'Save' : 'Create'}
        confirmLoading={createSupplier.isPending || updateSupplier.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Supplier Name"
            name="name"
            rules={[{ required: true, min: 2, message: 'Name is required' }]}
          >
            <Input placeholder="e.g. Kanchi Silks Pvt Ltd" />
          </Form.Item>
          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true, min: 2, message: 'Address is required' }]}
          >
            <Input placeholder="e.g. Kanchipuram, TN" />
          </Form.Item>
          <Form.Item label="Contact Number" name="contact">
            <Input placeholder="e.g. +91 90000 11111" />
          </Form.Item>
        </Form>
      </Modal>

      <SupplierDrawer
        supplier={managed}
        open={!!manageId}
        onClose={() => setManageId(null)}
      />
    </div>
  );
}