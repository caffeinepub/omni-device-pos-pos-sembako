import { formatCurrency, formatDateTime } from '../../i18n/format';

interface ReceiptTemplateProps {
  transaction: any;
  width: '58mm' | '80mm';
}

export function ReceiptTemplate({ transaction, width }: ReceiptTemplateProps) {
  const widthClass = width === '58mm' ? 'w-[58mm]' : 'w-[80mm]';

  return (
    <div className={`${widthClass} mx-auto bg-white text-black p-4 font-mono text-xs print:p-0`}>
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold">POS SEMBAKO</h1>
        <p className="text-xs">Jl. Contoh No. 123</p>
        <p className="text-xs">Telp: 021-12345678</p>
      </div>

      <div className="border-t border-b border-dashed border-black py-2 mb-2">
        <div className="flex justify-between">
          <span>No:</span>
          <span>#{transaction.id}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{formatDateTime(transaction.timestamp)}</span>
        </div>
      </div>

      <div className="mb-2">
        {transaction.items.map((item: any, index: number) => (
          <div key={index} className="mb-1">
            <div className="flex justify-between">
              <span className="flex-1">{item.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>{item.quantity} x {formatCurrency(item.price)}</span>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-black pt-2">
        <div className="flex justify-between mb-1">
          <span>Subtotal:</span>
          <span>{formatCurrency(transaction.subtotal || transaction.total)}</span>
        </div>
        {transaction.discount > 0 && (
          <div className="flex justify-between mb-1">
            <span>Discount:</span>
            <span>-{formatCurrency(transaction.discount)}</span>
          </div>
        )}
        {transaction.tax > 0 && (
          <div className="flex justify-between mb-1">
            <span>Tax:</span>
            <span>{formatCurrency(transaction.tax)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-base border-t border-black pt-1">
          <span>TOTAL:</span>
          <span>{formatCurrency(transaction.total)}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black mt-2 pt-2">
        <div className="text-xs">
          <p className="font-semibold mb-1">Payment:</p>
          {transaction.payments.map((payment: any, index: number) => (
            <div key={index} className="flex justify-between">
              <span>Method {index + 1}:</span>
              <span>{formatCurrency(payment.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-4 text-xs">
        <p>Thank you for your purchase!</p>
        <p>Please come again</p>
      </div>
    </div>
  );
}
