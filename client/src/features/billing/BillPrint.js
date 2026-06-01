import dayjs from 'dayjs';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmt = (d) => dayjs(d).format('DD MMM YYYY, hh:mm A');

/** A4 invoice layout. */
export function BillPrintA4({ data }) {
  if (!data) return null;
  const { shop, bill } = data;
  return (
    <div
      style={{
        width: '210mm',
        minHeight: '148mm',
        padding: '18mm 16mm',
        boxSizing: 'border-box',
        fontFamily: 'Arial, sans-serif',
        color: '#14302F',
        fontSize: 13,
      }}
    >
      <div style={{ textAlign: 'center', borderBottom: '2px solid #0E6E73', paddingBottom: 10 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#0E6E73', letterSpacing: 0.5 }}>
          {shop.name}
        </div>
        {shop.address && <div style={{ fontSize: 12 }}>{shop.address}</div>}
        {shop.phone && <div style={{ fontSize: 12 }}>Ph: {shop.phone}</div>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '16px 0' }}>
        <div>
          <div><strong>Bill No:</strong> {bill.billNumber}</div>
          <div><strong>Date:</strong> {fmt(bill.createdAt)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {bill.customerName && <div><strong>Customer:</strong> {bill.customerName}</div>}
          {bill.customerPhone && <div><strong>Phone:</strong> {bill.customerPhone}</div>}
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
        <thead>
          <tr style={{ background: '#F3EBDD' }}>
            {['S.No', 'Design Code', 'Design Name', 'Qty', 'Price/Pc', 'Discount', 'Total'].map(
              (h, i) => (
                <th
                  key={h}
                  style={{
                    border: '1px solid #cbb',
                    padding: '6px 8px',
                    textAlign: i >= 3 ? 'right' : 'left',
                  }}
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {bill.items.map((it, idx) => (
            <tr key={idx}>
              <td style={cell()}>{idx + 1}</td>
              <td style={cell()}>{it.designCode}</td>
              <td style={cell()}>{it.designName}</td>
              <td style={cell('right')}>{it.quantity}</td>
              <td style={cell('right')}>{inr(it.sellingPrice)}</td>
              <td style={cell('right')}>{inr(it.discount)}</td>
              <td style={cell('right')}>{inr(it.itemTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 14, marginLeft: 'auto', width: 260 }}>
        <Line label="Sub-total" value={inr(bill.subTotal)} />
        <Line label="Discount" value={`- ${inr(bill.overallDiscount)}`} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '2px solid #0E6E73',
            marginTop: 6,
            paddingTop: 6,
            fontSize: 16,
            fontWeight: 800,
            color: '#0E6E73',
          }}
        >
          <span>Final Amount</span>
          <span>{inr(bill.finalAmount)}</span>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 40, fontSize: 12, color: '#666' }}>
        Thank you for shopping with us! 🙏
      </div>
    </div>
  );
}

/** Thermal layout — 80mm single column. */
export function BillPrintThermal({ data }) {
  if (!data) return null;
  const { shop, bill } = data;
  const dash = '--------------------------------';
  return (
    <div
      style={{
        width: '80mm',
        padding: '4mm',
        boxSizing: 'border-box',
        fontFamily: 'monospace',
        fontSize: 11,
        color: '#000',
        lineHeight: 1.4,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{shop.name}</div>
        {shop.address && <div>{shop.address}</div>}
        {shop.phone && <div>Ph: {shop.phone}</div>}
      </div>
      <div>{dash}</div>
      <div>Bill: {bill.billNumber}</div>
      <div>{fmt(bill.createdAt)}</div>
      {bill.customerName && <div>Cust: {bill.customerName}</div>}
      {bill.customerPhone && <div>Ph: {bill.customerPhone}</div>}
      <div>{dash}</div>
      {bill.items.map((it, idx) => (
        <div key={idx} style={{ marginBottom: 4 }}>
          <div>{it.designCode} - {it.designName}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>
              {it.quantity} x {inr(it.sellingPrice)}
              {it.discount ? ` -${inr(it.discount)}` : ''}
            </span>
            <span>{inr(it.itemTotal)}</span>
          </div>
        </div>
      ))}
      <div>{dash}</div>
      <Row l="Sub-total" r={inr(bill.subTotal)} />
      <Row l="Discount" r={`-${inr(bill.overallDiscount)}`} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}>
        <span>TOTAL</span>
        <span>{inr(bill.finalAmount)}</span>
      </div>
      <div>{dash}</div>
      <div style={{ textAlign: 'center' }}>Thank you! Visit again</div>
    </div>
  );
}

const cell = (align = 'left') => ({
  border: '1px solid #ddd',
  padding: '5px 8px',
  textAlign: align,
});

function Line({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Row({ l, r }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span>{l}</span>
      <span>{r}</span>
    </div>
  );
}