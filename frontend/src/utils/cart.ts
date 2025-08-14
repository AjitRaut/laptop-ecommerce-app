export const calculateCartTotal = (items: any[]): number => {
  return items.reduce((total, item) => total + parseFloat(item.total_price), 0);
};

export const calculateTax = (subtotal: number, taxRate: number = 0.18): number => {
  return subtotal * taxRate;
};

export const calculateShipping = (subtotal: number, freeShippingThreshold: number = 10000): number => {
  return subtotal >= freeShippingThreshold ? 0 : 100;
};

export const calculateDiscount = (subtotal: number, discountPercentage: number): number => {
  return (subtotal * discountPercentage) / 100;
};