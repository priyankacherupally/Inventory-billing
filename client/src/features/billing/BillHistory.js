import { useEffect, useRef, useState } from 'react';
import { Button, DatePicker, Dropdown, Space, Table, Typography } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useReactToPrint } from 'react-to-print';
import { useBills } from './services/billingQueries.js';
import { billingService } from './services/billingService.js';
import { BillPrintA4, BillPrintThermal } from './BillPrint.js';

const { RangePicker } = DatePicker;
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function BillHistory() {
  const [filters, setFilters] = useState({});
  const { data: bills = [], isLoading } = useBills(filters);

  const [printData, setPrintData] = useState(null);
  const [pending, setPending] = useState(null); // 'a4' | 'thermal'
  const a4Ref = useRef(null);
  const thermalRef = useRef(null);
  const printA4 = useReactToPrint({ contentRef: a4Ref });
  const printThermal = useReactToPrint({ contentRef: thermalRef });

  useEffect(() => {
    if (printData && pending) {
      (pending === 'a4' ? printA4 : printThermal)();
      setPending(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printData, pending]);

  const doPrint = async (billId, format) => {
    const pd = await billingService.getPrintData(billId);
    setPrintData(pd);
    setPending(format);
  };

  const columns = [
    { title: 'Bill No', dataIndex: 'billNumber', key: 'billNumber' },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d) => dayjs(d).format('DD MMM YYYY, hh:mm A'),
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (c) => c || '—',
    },
    { title: 'Items', key: 'items', render: (_, b) => b.items?.length || 0 },
    { title: 'Final', dataIndex: 'finalAmount', key: 'finalAmount',
      render: (v) => <strong>{inr(v)}</strong> },
    { title: 'By', dataIndex: 'createdBy', key: 'createdBy',
      render: (u) => u?.name || '—' },
    {
      title: 'Print',
      key: 'print',
      render: (_, b) => (
        <Dropdown
          menu={{
            items: [
              { key: 'a4', label: 'A4', onClick: () => doPrint(b._id, 'a4') },
              { key: 'thermal', label: 'Thermal', onClick: () => doPrint(b._id, 'thermal') },
            ],
          }}
        >
          <Button size="small" icon={<PrinterOutlined />}>
            Print
          </Button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <Typography.Text strong>Filter:</Typography.Text>
        <RangePicker
          format="DD MMM YYYY"
          onChange={(range) =>
            setFilters({
              startDate: range?.[0]?.format('YYYY-MM-DD'),
              endDate: range?.[1]?.format('YYYY-MM-DD'),
            })
          }
        />
      </Space>

      <Table
        rowKey="_id"
        loading={isLoading}
        columns={columns}
        dataSource={bills}
        pagination={{ pageSize: 10 }}
        expandable={{
          expandedRowRender: (b) => (
            <Table
              size="small"
              rowKey={(r, i) => i}
              pagination={false}
              columns={[
                { title: 'Code', dataIndex: 'designCode' },
                { title: 'Name', dataIndex: 'designName' },
                { title: 'Qty', dataIndex: 'quantity' },
                { title: 'Price', dataIndex: 'sellingPrice', render: inr },
                { title: 'Discount', dataIndex: 'discount', render: inr },
                { title: 'Total', dataIndex: 'itemTotal', render: inr },
              ]}
              dataSource={b.items}
            />
          ),
        }}
      />

      <div style={{ position: 'fixed', left: -10000, top: 0 }}>
        <div ref={a4Ref}>
          <BillPrintA4 data={printData} />
        </div>
        <div ref={thermalRef}>
          <BillPrintThermal data={printData} />
        </div>
      </div>
    </div>
  );
}