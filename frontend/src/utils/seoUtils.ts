export const updatePageTitle = (title: string): void => {
  document.title = `${title} | LaptopShop`;
};

export const updateMetaDescription = (description: string): void => {
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', description);
  }
};

export const generateProductSchema = (product: any) => {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": product.brand_name
    },
    "category": product.category_name,
    "offers": {
      "@type": "Offer",
      "price": product.discounted_price,
      "priceCurrency": "INR",
      "availability": product.is_in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.0",
      "reviewCount": "117"
    }
  };
};