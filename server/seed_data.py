from products.models import Category, Brand, Product, ProductSpecification, ProductImage
from decimal import Decimal

# ---------- BRANDS ----------
brands_data = [
    {"name": "Dell"},
    {"name": "HP"},
    {"name": "Lenovo"},
    {"name": "Apple"},
    {"name": "Asus"},
    {"name": "Acer"},
    {"name": "MSI"},
    {"name": "Logitech"},
]

brands = {}
for data in brands_data:
    brand, _ = Brand.objects.get_or_create(name=data["name"])
    brands[data["name"]] = brand

print(f"✅ Created {len(brands)} brands.")


# ---------- CATEGORIES ----------
categories_data = [
    {
        "name": "Gaming Laptops",
        "description": "High-performance gaming laptops with latest GPUs",
        "image": "categories/gaming.jpg",
    },
    {
        "name": "Business Laptops",
        "description": "Professional laptops for productivity and work",
        "image": "categories/business.jpg",
    },
    {
        "name": "Ultrabooks",
        "description": "Slim, lightweight laptops for on-the-go professionals",
        "image": "categories/ultrabook.jpg",
    },
    {
        "name": "Accessories",
        "description": "Essential accessories and peripherals",
        "image": "categories/accessories.jpg",
    },
]

categories = {}
for data in categories_data:
    category, _ = Category.objects.get_or_create(name=data["name"], defaults=data)
    categories[data["name"]] = category

print(f"✅ Created {len(categories)} categories.")


# ---------- PRODUCTS ----------
products_data = [
    # Gaming Laptops
    {
        "name": "Asus ROG Strix G15",
        "description": "Powerful gaming laptop with Ryzen 9 and RTX 4070.",
        "short_description": "High-end gaming performance",
        "category": categories["Gaming Laptops"],
        "brand": brands["Asus"],
        "product_type": "laptop",
        "sku": "ROG-G15",
        "price": Decimal("145000.00"),
        "discount_percentage": Decimal("10.00"),
        "stock_quantity": 25,
        "warranty_months": 24,
    },
    {
        "name": "MSI Raider GE68HX",
        "description": "High-performance laptop for serious gamers.",
        "short_description": "Top-tier gaming power",
        "category": categories["Gaming Laptops"],
        "brand": brands["MSI"],
        "product_type": "laptop",
        "sku": "MSI-GE68",
        "price": Decimal("180000.00"),
        "discount_percentage": Decimal("5.00"),
        "stock_quantity": 12,
        "warranty_months": 24,
    },
    # Business Laptops
    {
        "name": "Dell Latitude 5540",
        "description": "Professional laptop built for productivity and reliability.",
        "short_description": "Ideal for business professionals",
        "category": categories["Business Laptops"],
        "brand": brands["Dell"],
        "product_type": "laptop",
        "sku": "DELL-5540",
        "price": Decimal("90000.00"),
        "discount_percentage": Decimal("8.00"),
        "stock_quantity": 18,
    },
    {
        "name": "HP EliteBook 840 G10",
        "description": "Premium business laptop with powerful performance.",
        "short_description": "Elegant and powerful business machine",
        "category": categories["Business Laptops"],
        "brand": brands["HP"],
        "product_type": "laptop",
        "sku": "HP-EB840",
        "price": Decimal("105000.00"),
        "discount_percentage": Decimal("10.00"),
        "stock_quantity": 10,
        "warranty_months": 24,
    },
    # Ultrabooks
    {
        "name": "Apple MacBook Air M3",
        "description": "Ultra-light, silent, and powerful MacBook for everyday use.",
        "short_description": "Performance meets portability",
        "category": categories["Ultrabooks"],
        "brand": brands["Apple"],
        "product_type": "laptop",
        "sku": "MBA-M3",
        "price": Decimal("135000.00"),
        "discount_percentage": Decimal("0.00"),
        "stock_quantity": 20,
    },
    {
        "name": "Lenovo Yoga Slim 7i",
        "description": "Sleek and powerful ultrabook with Intel Evo certification.",
        "short_description": "Perfect for on-the-go professionals",
        "category": categories["Ultrabooks"],
        "brand": brands["Lenovo"],
        "product_type": "laptop",
        "sku": "L-YOGA7",
        "price": Decimal("95000.00"),
        "discount_percentage": Decimal("5.00"),
        "stock_quantity": 15,
    },
    # Accessories
    {
        "name": "Logitech MX Master 3S Mouse",
        "description": "Ergonomic wireless mouse with advanced precision.",
        "short_description": "Best for productivity",
        "category": categories["Accessories"],
        "brand": brands["Logitech"],
        "product_type": "accessory",
        "sku": "LOGI-MX3S",
        "price": Decimal("9500.00"),
        "discount_percentage": Decimal("0.00"),
        "stock_quantity": 50,
    },
    {
        "name": "HP USB-C Dock G5",
        "description": "Expand connectivity and productivity with this HP dock.",
        "short_description": "Multiple ports for modern laptops",
        "category": categories["Accessories"],
        "brand": brands["HP"],
        "product_type": "accessory",
        "sku": "HP-DOCKG5",
        "price": Decimal("15000.00"),
        "discount_percentage": Decimal("5.00"),
        "stock_quantity": 25,
    },
]

products = {}
for data in products_data:
    product, _ = Product.objects.get_or_create(sku=data["sku"], defaults=data)
    products[data["sku"]] = product

print(f"✅ Created {len(products)} products.")


# ---------- SPECIFICATIONS ----------
specs = [
    ("ROG-G15", [("Processor", "AMD Ryzen 9 7945HX"), ("GPU", "NVIDIA RTX 4070"), ("RAM", "16GB DDR5"), ("Storage", "1TB SSD")]),
    ("MSI-GE68", [("Processor", "Intel i9 13950HX"), ("GPU", "NVIDIA RTX 4080"), ("RAM", "32GB DDR5"), ("Storage", "1TB SSD")]),
    ("DELL-5540", [("Processor", "Intel i7 1360P"), ("RAM", "16GB DDR4"), ("Storage", "512GB SSD")]),
    ("MBA-M3", [("Processor", "Apple M3"), ("RAM", "8GB Unified"), ("Storage", "256GB SSD")]),
]

for sku, specs_list in specs:
    product = products.get(sku)
    if not product:
        continue
    for name, value in specs_list:
        ProductSpecification.objects.get_or_create(product=product, spec_name=name, spec_value=value)

print("✅ Added product specifications.")


# ---------- IMAGES ----------
for sku, product in products.items():
    ProductImage.objects.get_or_create(product=product, image=f"products/{sku.lower()}.jpg", is_primary=True)

print("✅ Added product images.")

print("\n🎉 Database successfully seeded with demo data!")
