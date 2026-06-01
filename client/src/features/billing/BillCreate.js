import { useMemo, useRef, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Divider,
  Input,
  InputNumber,
  Result,
  Row,
  Segmented,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  DeleteOutlined,
  PlusOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { useReactToPrint } from 'react-to-print';
import { useActiveDesigns, useCreateBill } from './services/billingQueries.js';
import { billingService } from './services/billingService.js';
import { BillPrintA4, BillPrintThermal } from './BillPrint.js';

const { Title, Text } = Typography;
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const blankItem = (key) => ({
  key,
  designId: undefined,
  quantity: 1,
  sellingPrice: undefined,
  discountMode: '₹',
  discountValue: 0,
});

const discountAmount = (base, mode, value) =>
  mode === '%' ? Math.round((base * (value || 0)) / 100) : value || 0;

export default function BillCreate() {
  const keyRef = useRef(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState([blankItem(0)]);
  const [overallMode, setOverallMode] = useState('₹');
  const [overallValue, setOverallValue] = useState(0);
  const [printData, setPrintData] = useState(null);

  const { data: designs = [] } = useActiveDesigns();
  const createBill = useCreateBill();

  const a4Ref = useRef(null);
  const thermalRef = useRef(null);
  const printA4 = useReactToPrint({ contentRef: a4Ref });
  const printThermal = useReactToPrint({ contentRef: thermalRef });

  const designMap = useMemo(
    () => new Map(designs.map((d) => [d._id, d])),
    [designs],
  );
  const designOptions = useMemo(
    () =>
      designs.map((d) => ({
        value: d._id,
        label: `${d.code} — ${d.name}  (${d.totalStock} in stock)`,
        disabled: d.totalStock <= 0,
      })),
    [designs],
  );

  const setItem = (key, patch) =>
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  const addItem = () => {
    keyRef.current += 1;
    setItems((prev) => [...prev, blankItem(keyRef.current)]);
  };
  const removeItem = (key) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.key !== key) : prev));

  const rows = items.map((it) => {
    const base = (it.quantity || 0) * (it.sellingPrice || 0);
    const disc = discountAmount(base, it.discountMode, it.discountValue);
    const total = Math.max(0, base - disc);
    const stock = it.designId ? designMap.get(it.designId)?.totalStock ?? 0 : null;
    const overStock = stock != null && it.quantity > stock;
    return { ...it, base, disc, total, stock, overStock };
  });

  const subTotal = rows.reduce((s, r) => s + r.total, 0);
  const overallDisc = discountAmount(subTotal, overallMode, overallValue);
  const finalAmount = Math.max(0, subTotal - overallDisc);

  const anyOverStock = rows.some((r) => r.overStock);
  const valid =
    rows.length > 0 &&
    rows.every((r) => r.designId && r.quantity > 0 && r.sellingPrice >= 0) &&
    !anyOverStock;

  const handleSave = async () => {
    if (!valid) {
      message.error('Fix item rows before saving (design, qty, price, stock).');
      return;
    }
    try {
      const created = await createBill.mutateAsync({
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        items: rows.map((r) => ({
          designId: r.designId,
          quantity: r.quantity,
          sellingPrice: r.sellingPrice,
          discount: r.disc,
        })),
        overallDiscount: overallDisc,
      });
      const pd = await billingService.getPrintData(created._id);
      setPrintData(pd);
      message.success(`Bill ${created.billNumber} saved`);
    } catch (err) {
      const data = err?.response?.data;
      if (data?.shortfalls) {
        message.error(
          `Insufficient stock: ${data.shortfalls
            .map((s) => `${s.designCode || 'item'} (have ${s.available}, need ${s.requested})`)
            .join('; ')}`,
        );
      } else {
        const msg = data?.message || 'Could not save bill';
        message.error(Array.isArray(msg) ? msg.join(', ') : msg);
      }
    }
  };

  const resetForm = () => {
    keyRef.current += 1;
    setItems([blankItem(keyRef.current)]);
    setCustomerName('');
    setCustomerPhone('');
    setOverallValue(0);
    setOverallMode('₹');
    setPrintData(null);
  };

  // --- Post-save view with print actions ---
  if (printData) {
    return (
      <>
        <Result
          status="success"
          title={`Bill ${printData.bill.billNumber} saved`}
          subTitle={`Final amount ${inr(printData.bill.finalAmount)} · ${printData.bill.items.length} item(s)`}
          extra={[
            <Button key="a4" type="primary" icon={<PrinterOutlined />} onClick={printA4}>
              Print A4
            </Button>,
            <Button key="thermal" icon={<PrinterOutlined />} onClick={printThermal}>
              Print Thermal
            </Button>,
            <Button key="new" onClick={resetForm}>
              New Bill
            </Button>,
          ]}
        />
        <div style={{ position: 'fixed', left: -10000, top: 0 }}>
          <div ref={a4Ref}>
            <BillPrintA4 data={printData} />
          </div>
          <div ref={thermalRef}>
            <BillPrintThermal data={printData} />
          </div>
        </div>
      </>
    );
  }

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>
        New Bill
      </Title>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Text type="secondary">Customer Name (optional)</Text>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Walk-in customer"
            />
          </Col>
          <Col xs={24} md={12}>
            <Text type="secondary">Phone (optional)</Text>
            <Input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="9876543210"
            />
          </Col>
        </Row>
      </Card>

      <Card
        size="small"
        title="Items"
        style={{ marginBottom: 16 }}
        extra={
          <Button icon={<PlusOutlined />} onClick={addItem} size="small">
            Add item
          </Button>
        }
      >
        {/* Header */}
        <Row gutter={8} style={{ fontWeight: 600, fontSize: 12, marginBottom: 8 }}>
          <Col span={7}>Design</Col>
          <Col span={3}>Qty</Col>
          <Col span={4}>Selling Price</Col>
          <Col span={5}>Discount</Col>
          <Col span={4}>Total</Col>
        </Row>
        {rows.map((r) => (
          <Row gutter={8} key={r.key} align="top" style={{ marginBottom: 10 }}>
            <Col span={7}>
              <Select
                showSearch
                optionFilterProp="label"
                style={{ width: '100%' }}
                placeholder="Select design"
                value={r.designId}
                options={designOptions}
                onChange={(v) => setItem(r.key, { designId: v })}
              />
              {r.stock != null && (
                <Tag
                  color={r.overStock ? 'error' : 'default'}
                  style={{ marginTop: 4 }}
                >
                  {r.stock} in stock
                </Tag>
              )}
            </Col>
            <Col span={3}>
              <InputNumber
                min={1}
                style={{ width: '100%' }}
                value={r.quantity}
                status={r.overStock ? 'error' : undefined}
                onChange={(v) => setItem(r.key, { quantity: v || 0 })}
              />
            </Col>
            <Col span={4}>
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                value={r.sellingPrice}
                placeholder="0"
                onChange={(v) => setItem(r.key, { sellingPrice: v ?? undefined })}
              />
            </Col>
            <Col span={5}>
              <Space.Compact style={{ width: '100%' }}>
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  value={r.discountValue}
                  onChange={(v) => setItem(r.key, { discountValue: v || 0 })}
                />
                <Segmented
                  options={['₹', '%']}
                  value={r.discountMode}
                  onChange={(v) => setItem(r.key, { discountMode: v })}
                />
              </Space.Compact>
            </Col>
            <Col span={4}>
              <Space>
                <Text strong>{inr(r.total)}</Text>
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => removeItem(r.key)}
                  disabled={items.length === 1}
                />
              </Space>
            </Col>
          </Row>
        ))}
      </Card>

      <Row justify="end">
        <Col xs={24} md={10}>
          <Card size="small">
            <div style={summaryRow}>
              <span>Sub-total</span>
              <strong>{inr(subTotal)}</strong>
            </div>
            <div style={summaryRow}>
              <span>Overall Discount</span>
              <Space.Compact>
                <InputNumber
                  min={0}
                  value={overallValue}
                  onChange={(v) => setOverallValue(v || 0)}
                  style={{ width: 110 }}
                />
                <Segmented
                  options={['₹', '%']}
                  value={overallMode}
                  onChange={setOverallMode}
                />
              </Space.Compact>
            </div>
            <div style={summaryRow}>
              <span>Discount applied</span>
              <span>- {inr(overallDisc)}</span>
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div style={{ ...summaryRow, fontSize: 18 }}>
              <strong>Final Amount</strong>
              <strong style={{ color: '#0E6E73' }}>{inr(finalAmount)}</strong>
            </div>
            <Button
              type="primary"
              size="large"
              block
              style={{ marginTop: 12 }}
              loading={createBill.isPending}
              onClick={handleSave}
            >
              Save & Print
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

const summaryRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '6px 0',
};