import { useState } from 'react';
import {
  Button,
  Drawer,
  Empty,
  Form,
  InputNumber,
  Input,
  Modal,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import DesignPicker from './DesignPicker.js';
import {
  useAddPurchaseVariant,
  useUpdatePurchaseVariant,
  useSupplierAuditLog,
} from './services/suppliersQueries.js';

const { Text } = Typography;

const inr = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');

export default function SupplierDrawer({ supplier, open, onClose }) {
  const [addOpen, setAddOpen] = useState(false);
  const [addForm] = Form.useForm();
  const [editPv, setEditPv] = useState(null);
  const [editForm] = Form.useForm();

  const addPv = useAddPurchaseVariant();
  const updatePv = useUpdatePurchaseVariant();
  const audit = useSupplierAuditLog(supplier?._id, open);

  if (!supplier) return null;

  const submitAdd = async () => {
    let values;
    try {
      values = await addForm.validateFields();
    } catch {
      return;
    }
    try {
      await addPv.mutateAsync({
        id: supplier._id,
        designId: values.designId,
        specificPrice: values.specificPrice,
      });
      message.success('Design linked to supplier');
      setAddOpen(false);
      addForm.resetFields();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not add design';
      message.error(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const submitEdit = async () => {
    let values;
    try {
      values = await editForm.validateFields();
    } catch {
      return;
    }
    try {
      await updatePv.mutateAsync({
        id: supplier._id,
        pvId: editPv._id,
        specificPrice: values.specificPrice,
        reason: values.reason,
      });
      message.success('Price updated (audit entry recorded)');
      setEditPv(null);
    } catch {
      message.error('Could not update price');
    }
  };

  const togglePvStatus = async (pv) => {
    try {
      await updatePv.mutateAsync({
        id: supplier._id,
        pvId: pv._id,
        status: pv.status === 'active' ? 'inactive' : 'active',
      });
      message.success('Status updated');
    } catch {
      message.error('Could not update status');
    }
  };

  const pvColumns = [
    { title: 'Design Code', dataIndex: 'designCode', key: 'designCode',
      render: (c) => <Text code>{c}</Text> },
    { title: 'Purchase Price', dataIndex: 'specificPrice', key: 'price',
      render: (p) => <strong>{inr(p)}</strong> },
    { title: 'Effective From', dataIndex: 'effectiveFrom', key: 'eff',
      render: fmtDate },
    { title: 'Status', dataIndex: 'status', key: 'status',
      render: (s) => (
        <Tag color={s === 'active' ? 'success' : 'default'}>
          {s === 'active' ? 'Active' : 'Inactive'}
        </Tag>
      ) },
    { title: 'Actions', key: 'actions',
      render: (_, pv) => (
        <Space>
          <Button size="small" onClick={() => { setEditPv(pv); editForm.setFieldsValue({ specificPrice: pv.specificPrice, reason: '' }); }}>
            Edit price
          </Button>
          <Button size="small" danger={pv.status === 'active'} onClick={() => togglePvStatus(pv)}>
            {pv.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
        </Space>
      ) },
  ];

  const auditColumns = [
    { title: 'When', dataIndex: 'createdAt', key: 'createdAt',
      render: (d) => new Date(d).toLocaleString('en-IN') },
    { title: 'Design', dataIndex: 'designCode', key: 'designCode',
      render: (c) => <Text code>{c}</Text> },
    { title: 'Old', dataIndex: 'oldPrice', key: 'oldPrice', render: inr },
    { title: 'New', dataIndex: 'newPrice', key: 'newPrice',
      render: (p) => <strong>{inr(p)}</strong> },
    { title: 'Changed By', dataIndex: 'changedBy', key: 'changedBy',
      render: (u) => u?.name || u?.username || '—' },
    { title: 'Reason', dataIndex: 'reason', key: 'reason', render: (r) => r || '—' },
  ];

  return (
    <Drawer
      title={supplier.name}
      width={760}
      open={open}
      onClose={onClose}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddOpen(true)}>
          Add design
        </Button>
      }
    >
      <Text type="secondary">
        {supplier.address}
        {supplier.contact ? ` · ${supplier.contact}` : ''}
      </Text>

      <Tabs
        style={{ marginTop: 12 }}
        items={[
          {
            key: 'designs',
            label: `Supplied Designs (${supplier.purchaseVariants?.length || 0})`,
            children:
              supplier.purchaseVariants?.length ? (
                <Table
                  rowKey="_id"
                  size="small"
                  columns={pvColumns}
                  dataSource={supplier.purchaseVariants}
                  pagination={false}
                />
              ) : (
                <Empty description="No designs linked yet" />
              ),
          },
          {
            key: 'audit',
            label: 'Price Audit Log',
            children: (
              <Table
                rowKey="_id"
                size="small"
                loading={audit.isLoading}
                columns={auditColumns}
                dataSource={audit.data || []}
                pagination={{ pageSize: 8 }}
                locale={{ emptyText: 'No price changes recorded' }}
              />
            ),
          },
        ]}
      />

      <Modal
        title="Add a design to this supplier"
        open={addOpen}
        onOk={submitAdd}
        onCancel={() => setAddOpen(false)}
        okText="Add"
        confirmLoading={addPv.isPending}
        destroyOnHidden
      >
        <Form form={addForm} layout="vertical">
          <Form.Item
            label="Design"
            name="designId"
            rules={[{ required: true, message: 'Pick a design' }]}
          >
            <DesignPicker />
          </Form.Item>
          <Form.Item
            label="Purchase Price (₹ per piece)"
            name="specificPrice"
            rules={[{ required: true, message: 'Enter a price' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="1200" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Edit price · ${editPv?.designCode || ''}`}
        open={!!editPv}
        onOk={submitEdit}
        onCancel={() => setEditPv(null)}
        okText="Save"
        confirmLoading={updatePv.isPending}
        destroyOnHidden
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            label="New Purchase Price (₹ per piece)"
            name="specificPrice"
            rules={[{ required: true, message: 'Enter a price' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Reason (optional)" name="reason">
            <Input.TextArea rows={2} placeholder="e.g. Supplier rate revision" />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: 12 }}>
            A price change is recorded in the audit log automatically.
          </Text>
        </Form>
      </Modal>
    </Drawer>
  );
}