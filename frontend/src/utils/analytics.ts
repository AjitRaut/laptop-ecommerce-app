export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, properties);
  }
  
  console.log('Track Event:', eventName, properties);
};

export const trackPageView = (page: string) => {
  trackEvent('page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_path: page,
  });
};

export const trackPurchase = (order: any) => {
  trackEvent('purchase', {
    transaction_id: order.order_id,
    value: parseFloat(order.final_amount),
    currency: 'INR',
    items: order.items.map((item: any) => ({
      item_id: item.product.id,
      item_name: item.product_name,
      category: item.product.category_name,
      brand: item.product.brand_name,
      quantity: item.quantity,
      price: parseFloat(item.product_price),
    })),
  });
};

export const trackAddToCart = (product: any, quantity: number) => {
  trackEvent('add_to_cart', {
    currency: 'INR',
    value: parseFloat(product.discounted_price) * quantity,
    items: [{
      item_id: product.id,
      item_name: product.name,
      category: product.category_name,
      brand: product.brand_name,
      quantity,
      price: parseFloat(product.discounted_price),
    }],
  });
};