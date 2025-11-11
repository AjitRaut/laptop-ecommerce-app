import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import {
  useGetVendorProductsQuery,
  useDeleteVendorProductMutation,
  useUpdateProductStockMutation,
} from "@/store/api/vendorApi";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Badge from "@/components/common/Badge";
import { formatPrice } from "@/utils/formatters";

const VendorProducts: React.FC = () => {
  const { data: products, isLoading } = useGetVendorProductsQuery();
  const [deleteProduct] = useDeleteVendorProductMutation();
  const [updateStock] = useUpdateProductStockMutation();
  const [editingStock, setEditingStock] = useState<{ [key: number]: number | undefined }>({});

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Delete "${name}"?`)) {
      try {
        await deleteProduct(id).unwrap();
        toast.success("Product deleted");
      } catch {
        toast.error("Failed to delete");
      }
    }
  };

  const handleStockUpdate = async (productId: number) => {
    const newStock = editingStock[productId];
    if (newStock !== undefined) {
      try {
        await updateStock({ productId, stock_quantity: newStock }).unwrap();
        toast.success("Stock updated");
        setEditingStock({ ...editingStock, [productId]: undefined });
      } catch {
        toast.error("Failed to update stock");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const productList = products?.results || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-600 mt-2">{products?.count || 0} products</p>
        </div>
        <Link to="/vendor/products/add">
          <Button leftIcon={<PlusIcon className="h-5 w-5" />}>
            Add Product
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productList.map((product:any) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={
                          product.images?.find((img:any) => img.is_primary)?.image ||
                          "/api/placeholder/80/80"
                        }
                        alt={product.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div className="ml-4">
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.category_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-medium text-gray-900">
                      {formatPrice(product.discounted_price || product.price)}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editingStock[product.id] ?? product.stock_quantity}
                        onChange={(e) =>
                          setEditingStock({
                            ...editingStock,
                            [product.id]: parseInt(e.target.value),
                          })
                        }
                        className="w-20 px-2 py-1 border rounded-lg text-sm"
                      />
                      {editingStock[product.id] !== undefined &&
                        editingStock[product.id] !== product.stock_quantity && (
                          <Button size="sm" onClick={() => handleStockUpdate(product.id)}>
                            Save
                          </Button>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={product.is_active ? "success" : "default"}>
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <Link to={`/vendor/products/edit/${product.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<PencilIcon className="h-4 w-4" />}
                        >
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        leftIcon={<TrashIcon className="h-4 w-4" />}
                        onClick={() => handleDelete(product.id, product.name)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {productList.length === 0 && (
            <p className="text-center text-gray-500 py-6">No products found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorProducts;
