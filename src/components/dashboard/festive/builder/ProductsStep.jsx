import { Plus, Search, Package, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

export default function ProductsStep({
  data = [],
  products = [],
  onChange,
}) {
  const [search, setSearch] = useState("");

  const selectedProducts = data;

  // Helper function to extract valid ID regardless of _id vs id
  const getId = (item) => item?._id || item?.id;

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [products, search]);

  const addProduct = (product) => {
    const productId = getId(product);
    if (selectedProducts.some((item) => getId(item) === productId)) return;

    onChange?.([
      ...selectedProducts,
      {
        ...product,
        id: productId, // Standardize ID property
        festivePrice: product.price,
        quantity: 1,
      },
    ]);
  };

  const removeProduct = (targetId) => {
    onChange?.(
      selectedProducts.filter((item) => getId(item) !== targetId)
    );
  };

  const updateField = (targetId, field, value) => {
    onChange?.(
      selectedProducts.map((item) =>
        getId(item) === targetId
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Add Products
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Select products for this festive menu.
        </p>
      </div>

      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product..."
          className="h-12 w-full rounded-xl border border-slate-200 bg-transparent pl-11 pr-4 outline-none focus:border-[#1A4D2E]"
        />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-slate-800">
          Available Products
        </h3>

        {filteredProducts.length === 0 && (
          <div className="rounded-xl border border-dashed py-10 text-center text-slate-500">
            No products available.
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product, idx) => {
            const pId = getId(product) || `avail-prod-${idx}`;
            const isAlreadyAdded = selectedProducts.some(
              (item) => getId(item) === pId
            );

            return (
              <div
                key={pId}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-800">
                      {product.name}
                    </h4>
                    <p className="text-sm text-slate-500">
                      {product.category}
                    </p>
                  </div>
                  <Package size={20} className="text-[#1A4D2E]" />
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    ₹{product.price}
                  </span>

                  <button
                    disabled={isAlreadyAdded}
                    onClick={() => addProduct(product)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white transition cursor-pointer ${
                      isAlreadyAdded
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-[#1A4D2E] hover:bg-[#245a37]"
                    }`}
                  >
                    <Plus size={16} />
                    {isAlreadyAdded ? "Added" : "Add"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-slate-800">
          Selected Products
        </h3>

        {selectedProducts.length === 0 && (
          <div className="rounded-xl border border-dashed py-10 text-center text-slate-500">
            No products selected.
          </div>
        )}

        <div className="space-y-4">
          {selectedProducts.map((item, idx) => {
            const itemId = getId(item) || `sel-prod-${idx}`;

            return (
              <div
                key={itemId}
                className="grid gap-4 rounded-xl border border-slate-200 p-4 lg:grid-cols-12 lg:items-center"
              >
                <div className="lg:col-span-4">
                  <h4 className="font-semibold text-slate-800">
                    {item.name}
                  </h4>
                  <p className="text-sm text-slate-500">
                    {item.category}
                  </p>
                </div>

                <div className="lg:col-span-3">
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Festive Price
                  </label>
                  <input
                    type="number"
                    value={item.festivePrice ?? item.price}
                    onChange={(e) =>
                      updateField(
                        itemId,
                        "festivePrice",
                        Number(e.target.value)
                      )
                    }
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-[#1A4D2E]"
                  />
                </div>

                <div className="lg:col-span-3">
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity ?? 1}
                    onChange={(e) =>
                      updateField(
                        itemId,
                        "quantity",
                        Number(e.target.value)
                      )
                    }
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-[#1A4D2E]"
                  />
                </div>

                <div className="flex justify-end lg:col-span-2">
                  <button
                    onClick={() => removeProduct(itemId)}
                    className="rounded-lg p-3 text-red-500 hover:bg-red-50 transition cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}