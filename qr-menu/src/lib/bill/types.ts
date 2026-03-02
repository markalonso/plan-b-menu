export type BillCartItem = {
  id: string;
  name_ar: string;
  name_en: string;
  price: number;
  quantity: number;
};

export type DiscountType = 'percent' | 'fixed';

export type SmartAssignments = Record<string, number[]>;

export type BillState = {
  cart: BillCartItem[];
  taxEnabled: boolean;
  taxRate: number;
  discountEnabled: boolean;
  discountType: DiscountType;
  discountValue: number;
  peopleCount: number;
  smartAssignments: SmartAssignments;
};

export type PersonSummary = {
  subtotal: number;
  taxShare: number;
  discountShare: number;
  total: number;
};
