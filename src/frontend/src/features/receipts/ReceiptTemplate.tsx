import { formatCurrency, formatDateTime } from '../../i18n/format';
import { t } from '../../i18n/t';

interface ReceiptTemplateProps {
  transaction: any;
  width: '58mm' | '80mm';
}

export function ReceiptTemplate({ transaction, width }: ReceiptTemplateProps) {
  const widthClass = width === '58mm' ? 'w-[58mm]' : 'w-[80mm]';

  return (
    <div className={`${widthClass} mx-auto bg-white text-black p-4 font-mono text-xs print:p-0`}>
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold">TOKO FADLI</h1>
      </div>

      <div className="border-t border-b border-dashed border-black py-2 mb-2">
        <div className="flex justify-between">
          <span>{t('receipt.receiptNumber')}:</span>
          <span>#{transaction.id}</span>
        </div>
        <div className="flex justify-between">
          <span>{t('receipt.date')}:</span>
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
          <span>{t('receipt.subtotal')}:</span>
          <span>{formatCurrency(transaction.subtotal)}</span>
        </div>
        {transaction.discount > 0 && (
          <div className="flex justify-between mb-1">
            <span>{t('receipt.discount')}:</span>
            <span>-{formatCurrency(transaction.discount)}</span>
          </div>
        )}
        {transaction.tax > 0 && (
          <div className="flex justify-between mb-1">
            <span>{t('receipt.tax')}:</span>
            <span>{formatCurrency(transaction.tax)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-base border-t border-black pt-1">
          <span>{t('receipt.total')}:</span>
          <span>{formatCurrency(transaction.total)}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black mt-2 pt-2">
        <div className="text-xs">
          <p className="font-semibold mb-1">{t('receipt.payment')}:</p>
          {transaction.payments.map((payment: any, index: number) => (
            <div key={index} className="flex justify-between">
              <span>{t('receipt.method')} {index + 1}:</span>
              <span>{formatCurrency(payment.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-4 text-xs">
        <p>{t('receipt.thankYou')}</p>
        <p>{t('receipt.comeAgain')}</p>
      </div>
    </div>
  );
}
