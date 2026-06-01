import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Table,
  Typography,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { useSuppliers } from '../suppliers/services/suppliersQueries.js';
import { usePurchases, useCreatePurchase } from './services/purchaseQueries.js';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const inr = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export default function Purchase() {
  const [form] = Form.useForm();
  const [supplierId, setSupplierId] = useState(null);
  const [filters, setFilters] = useState({});

  const { data: suppliers = [] } = useSuppliers();
  const { data: history = [], isLoading } = usePurchases(filters);
  const createPurchase = useCreatePurchase();

  const activeSuppliers = useMemo(
    () => suppliers.filter((s) => s.status === 'active'),
    [suppliers],
  );
  const selectedSupplier = useMemo(
    () => suppliers.find((s) => s._id === supplierId),
    [suppliers, supplierId],
  );
  const designOptions = useMemo(
    () =>
      (selectedSupplier?.purchaseVariants || [])
        .filter((pv) => pv.status === 'active')
        .map((pv) => ({
          value: pv.designId,
          label: `${pv.designCode}  ·  ${inr(pv.specificPrice)}`,
          price: pv.specificPrice,
        })),
    [selectedSupplier],
  );

  const onSupplierChange = (id) => {
    setSupplierId(id);
    form.setFieldsValue({ designId: undefined, pricePerPiece: undefined });
  };
  const onDesignChange = (designId) => {
    const opt = designOptions.find((o) => o.value === designId);
    form.setFieldsValue({ pricePerPiece: opt?.price });
  };

  const handleSubmit = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    try {
      const res = await createPurchase.mutateAsync({
        supplierId: values.supplierId,
        designId: values.designId,
        quantity: values.quantity,
        pricePerPiece: values.pricePerPiece,
        purchaseDate: values.purchaseDate
          ? values.purchaseDate.format('YYYY-MM-DD')
          : undefined,
        invoiceRef: values.invoiceRef || undefined,
      });
      message.success(
        `Stock added: ${res.designCode} +${res.quantity} (${inr(res.totalValue)})`,
      );
      form.resetFields();
      form.setFieldsValue({ purchaseDate: dayjs() });
      setSupplierId(null);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not save purchase';
      message.error(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const qty = Form.useWatch('quantity', form);
  const price = Form.useWatch('pricePerPiece', form);
  const lineTotal = qty && price ? qty * price : 0;

  const columns = [
    {
      title: 'Date',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      render: (d) => dayjs(d).format('DD MMM YYYY'),
    },
    { title: 'Design', dataIndex: 'designCode', key: 'designCode',
      render: (c) => <Text code>{c}</Text> },
    { title: 'Supplier', dataIndex: 'supplierId', key: 'supplier',
      render: (s) => s?.name || '—' },
    { title: 'Qty', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Price/Pc', dataIndex: 'pricePerPiece', key: 'price', render: inr },
    { title: 'Total', dataIndex: 'totalValue', key: 'total',
      render: (t) => <strong>{inr(t)}</strong> },
    { title: 'Invoice', dataIndex: 'invoiceRef', key: 'invoice', render: (i) => i || '—' },
    { title: 'By', dataIndex: 'createdBy', key: 'createdBy',
      render: (u) => u?.name || '—' },
  ];

  return (
    <div style={{ padding: 32 }}>
      <Title level={3} style={{ marginTop: 0 }}>
        Purchase · Inventory IN
      </Title>

      <Card style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ purchaseDate: dayjs() }}
        >
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Supplier"
                name="supplierId"
                rules={[{ required: true, message: 'Select a supplier' }]}
              >
                <Select
                  placeholder="Select supplier"
                  onChange={onSupplierChange}
                  options={activeSuppliers.map((s) => ({
                    value: s._id,
                    label: s.name,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Design"
                name="designId"
                rules={[{ required: true, message: 'Select a design' }]}
                extra={!supplierId ? 'Select a supplier first' : undefined}
              >
                <Select
                  placeholder="Select design"
                  disabled={!supplierId}
                  onChange={onDesignChange}
                  options={designOptions}
                  notFoundContent="This supplier has no active designs"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Quantity (pieces)"
                name="quantity"
                rules={[{ required: true, message: 'Enter quantity' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="10" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Purchase Price (₹ / piece)"
                name="pricePerPiece"
                rules={[{ required: true, message: 'Enter price' }]}
                extra="Auto-filled from supplier. Editing updates the master price + logs an audit entry."
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Purchase Date" name="purchaseDate">
                <DatePicker style={{ width: '100%' }} format="DD MMM YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Invoice / Ref (optional)" name="invoiceRef">
                <Input placeholder="INV-1234" />
              </Form.Item>
            </Col>
          </Row>

          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text strong style={{ fontSize: 16 }}>
              Total Value: {inr(lineTotal)}
            </Text>
            <Button
              type="primary"
              size="large"
              loading={createPurchase.isPending}
              onClick={handleSubmit}
            >
              Save Purchase
            </Button>
          </Space>
        </Form>
      </Card>

      <Space style={{ marginBottom: 12 }} wrap>
        <Text strong>History</Text>
        <Select
          allowClear
          placeholder="Filter by supplier"
          style={{ width: 220 }}
          options={suppliers.map((s) => ({ value: s._id, label: s.name }))}
          onChange={(v) => setFilters((f) => ({ ...f, supplierId: v }))}
        />
        <RangePicker
          format="DD MMM YYYY"
          onChange={(range) =>
            setFilters((f) => ({
              ...f,
              startDate: range?.[0]?.format('YYYY-MM-DD'),
              endDate: range?.[1]?.format('YYYY-MM-DD'),
            }))
          }
        />
      </Space>

      <Table
        rowKey="_id"
        loading={isLoading}
        columns={columns}
        dataSource={history}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}