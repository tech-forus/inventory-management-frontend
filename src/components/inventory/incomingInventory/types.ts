export interface InvoiceItem {
  id: string;
  skuId: string;
  itemName: string;
  received: number;
  short: number;
  total: number;
  totalQuantity: number;
  unitPrice: number;
  totalValue: number;
  numberOfBoxes: number;
  receivedBoxes: number;
}

export interface IncomingInventoryFormData {
  documentType: 'bill' | 'delivery_challan' | 'transfer_note';
  documentSubType: string;
  vendorSubType: string;
  deliveryChallanSubType: string;
  destinationType: 'vendor' | 'customer';
  destinationId: string;
  invoiceDate: string;
  invoiceNumber: string;
  docketNumber: string;
  transportorName: string;
  vendorId: string;
  brandId: string;
  warranty: number;
  warrantyUnit: 'months' | 'year';
  receivingDate: string;
  useCurrentDate: boolean;
  receivedBy: string;
  remarks: string;
  items: InvoiceItem[];
}
