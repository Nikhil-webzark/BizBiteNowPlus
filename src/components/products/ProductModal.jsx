import {
  X,
  UploadCloud,
  Plus,
  Trash2,
  Settings2,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function ProductModal({
  open,
  onClose,
  mode = "add",
  product = null,
  onSave,
  products = [],
}) {
const emptyForm = {
  id: Date.now(),
  sku: "",
  name: "",
  description: "",
  category: "",
  price: "",
  stock: "",
  image: "",

  available: true,
  featured: false,
  combo: false,
  delivery: true,

  variants: [],

  addons: [],

  ingredients: [],
};
  const [formData, setFormData] = useState(emptyForm);
  const generateSKU = (category) => {
    const categoryMap = {
      Burger: "BRG",
      Snacks: "SNK",
      Pizza: "PZA",
      Sandwich: "SWD",
      "Wraps & Rolls": "WRP",
      Biryani: "BRY",
      Chinese: "CHN",
      "North Indian": "NIN",
      "South Indian": "SIN",
      Pasta: "PST",
      "Rice & Noodles": "RND",
      Salads: "SLD",
      Desserts: "DST",
      "Ice Cream": "ICR",
      Bakery: "BAK",
      Beverages: "BEV",
      Coffee: "COF",
      Tea: "TEA",
      Milkshake: "MLK",
      Juices: "JUC",
      Mocktails: "MCK",
      "Combo Meals": "COM",
      Starters: "STR",
      "Main Course": "MCR",
    };

    const prefix =
      categoryMap[category] ||
      category
        .replace(/[^A-Za-z]/g, "")
        .substring(0, 3)
        .toUpperCase();

    const count =
      products.filter((item) => item.sku?.startsWith(prefix)).length + 1;

    return `${prefix}-${String(count).padStart(3, "0")}`;
  };

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && product) {
      setFormData({
        id: product.id,
        sku: product.sku || "",
        name: product.name || "",
        description: product.description || "",
        category: product.category || "",
        price: product.price || "",
        stock: product.stock || "",
        image: product.image || "",
        available: product.available ?? true,
        featured: product.featured ?? false,
        combo: product.combo ?? false,
        delivery: product.delivery ?? true,
      });
    } else {
      setFormData({
        ...emptyForm,
        id: Date.now(),
      });
    }
  }, [open, mode, product]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        image: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };
const addVariant = () => {
  setFormData((prev) => ({
    ...prev,
    variants: [
      ...prev.variants,
      {
        id: Date.now(),
        name: "",
        price: 0,
      },
    ],
  }));
};

const updateVariant = (id, field, value) => {
  setFormData((prev) => ({
    ...prev,
    variants: prev.variants.map((variant) =>
      variant.id === id
        ? { ...variant, [field]: value }
        : variant
    ),
  }));
};

const removeVariant = (id) => {
  setFormData((prev) => ({
    ...prev,
    variants: prev.variants.filter(
      (variant) => variant.id !== id
    ),
  }));
};
const addAddon = () => {
  setFormData((prev) => ({
    ...prev,
    addons: [
      ...prev.addons,
      {
        id: Date.now(),
        name: "",
        description: "",
        price: "",
      },
    ],
  }));
};

const updateAddon = (addonId, field, value) => {
  setFormData((prev) => ({
    ...prev,
    addons: prev.addons.map((addon) =>
      addon.id === addonId
        ? {
            ...addon,
            [field]: value,
          }
        : addon
    ),
  }));
};

const removeAddon = (addonId) => {
  setFormData((prev) => ({
    ...prev,
    addons: prev.addons.filter(
      (addon) => addon.id !== addonId
    ),
  }));
};
  const handleReset = () => {
    if (mode === "edit" && product) {
      setFormData({
        id: product.id,
        sku: product.sku || "",
        name: product.name || "",
        description: product.description || "",
        category: product.category || "",
        price: product.price || "",
        stock: product.stock || "",
        image: product.image || "",
        available: product.available ?? true,
        featured: product.featured ?? false,
        combo: product.combo ?? false,
        delivery: product.delivery ?? true,
      });
    } else {
      setFormData({
        ...emptyForm,
        id: Date.now(),
      });
    }
  };
const handleSubmit = (e) => {
  e.preventDefault();

  if (!formData.name || !formData.category || !formData.price) {
    alert("Please fill all required fields.");
    return;
  }

  const cleanedVariants = formData.variants
    .filter((group) => group.name.trim())
    .map((group) => ({
      ...group,
      options: group.options.filter(
        (option) => option.name.trim()
      ),
    }))
    .filter((group) => group.options.length);

  const cleanedAddons = formData.addons.filter(
    (addon) =>
      addon.name.trim() &&
      addon.price !== "" &&
      addon.price !== null
  );

  const productData = {
    ...formData,

    sku:
      mode === "edit"
        ? formData.sku
        : generateSKU(formData.category),

    price: Number(formData.price),

    variants: cleanedVariants,

    addons: cleanedAddons,
  };

  onSave(productData);
  onClose();
};

  return (
    <>
      {/* Overlay */}

      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 h-fullbackdrop-blur-sm"
      />

      {/* Modal */}

      <div className="fixed left-1/2 top-1/2 z-50 w-[95%] max-w-6xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl z-[9999] bg-white shadow-2xl">
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-8 py-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              {mode === "add" ? "Add Product" : "Edit Product"}
            </h2>

            <p className="mt-2 text-slate-500">
              Create and manage restaurant products.
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 transition hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[80vh] overflow-y-auto px-8 py-6"
        >
          <div className="grid gap-6 lg:grid-cols-2">
            {/* LEFT COLUMN */}

            <div className="space-y-6">
              {/* Product Information */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-5 text-lg font-semibold text-slate-900">
                  Product Information
                </h3>

                {/* Product Name */}

                <div className="mb-5">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Product Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Chicken Burger"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#16522D] focus:ring-4 focus:ring-[#16522D]/10"
                  />
                </div>

                {/* SKU */}

                {/* <div className="mb-5">

      <label className="mb-2 block text-sm font-medium text-slate-700">
        SKU
      </label>

      <input
        type="text"
        name="sku"
        value={formData.sku}
        onChange={handleChange}
        placeholder="BURG-001"
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#16522D] focus:ring-4 focus:ring-[#16522D]/10"
      />

    </div> */}

                {/* Category */}

                <div className="mb-5">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Category *
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#16522D] focus:ring-4 focus:ring-[#16522D]/10"
                  >
                    <option value="">Select Category</option>

                    <option value="Main Course">Main Course</option>

                    <option value="Starters">Starters</option>

                    <option value="Pizza">Pizza</option>

                    <option value="Burger">Burger</option>

                    <option value="Sandwich">Sandwich</option>

                    <option value="Wraps & Rolls">Wraps & Rolls</option>

                    <option value="Biryani">Biryani</option>

                    <option value="Chinese">Chinese</option>

                    <option value="North Indian">North Indian</option>

                    <option value="South Indian">South Indian</option>

                    <option value="Pasta">Pasta</option>

                    <option value="Rice & Noodles">Rice & Noodles</option>

                    <option value="Salads">Salads</option>

                    <option value="Desserts">Desserts</option>

                    <option value="Ice Cream">Ice Cream</option>

                    <option value="Bakery">Bakery</option>

                    <option value="Beverages">Beverages</option>

                    <option value="Coffee">Coffee</option>

                    <option value="Tea">Tea</option>

                    <option value="Milkshake">Milkshake</option>

                    <option value="Juices">Juices</option>

                    <option value="Mocktails">Mocktails</option>

                    <option value="Combo Meals">Combo Meals</option>
                  </select>
                </div>

                {/* Description */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Description
                  </label>

                  <textarea
                    rows={6}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Write product description..."
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#16522D] focus:ring-4 focus:ring-[#16522D]/10"
                  />
                </div>
              </div>

              {/* Pricing */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-5 text-lg font-semibold text-slate-900">
                  Pricing & Inventory
                </h3>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Selling Price *
                    </label>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                        ₹
                      </span>

                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="299"
                        className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none transition focus:border-[#16522D] focus:ring-4 focus:ring-[#16522D]/10"
                      />
                    </div>
                  </div>

                  {/* <div>

        <label className="mb-2 block text-sm font-medium text-slate-700">
          Stock
        </label>

        <input
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          placeholder="50"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#16522D] focus:ring-4 focus:ring-[#16522D]/10"
        />

      </div> */}
                </div>
              </div>
            </div>

            {/* ===================== VARIANTS ===================== */}
<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <div className="mb-6 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#16522D]/10">
        <Settings2
          size={20}
          className="text-[#16522D]"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Product Sizes
        </h3>

        <p className="text-sm text-slate-500">
          Add available sizes for this product.
        </p>
      </div>
    </div>

    <button
      type="button"
      onClick={addVariant}
      className="rounded-xl bg-[#16522D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#114125]"
    >
      + Add Size
    </button>
  </div>

  <div className="space-y-4">
    {formData.variants.length === 0 && (
      <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-slate-400">
        No sizes added yet.
      </div>
    )}

    {formData.variants.map((variant) => (
      <div
        key={variant.id}
        className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_150px_50px]"
      >
        <input
          type="text"
          placeholder="Size (Small, Medium, Large)"
          value={variant.name}
          onChange={(e) =>
            updateVariant(
              variant.id,
              "name",
              e.target.value
            )
          }
          className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#16522D]"
        />

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            ₹
          </span>

          <input
            type="number"
            placeholder="Extra Price"
            value={variant.price}
            onChange={(e) =>
              updateVariant(
                variant.id,
                "price",
                Number(e.target.value)
              )
            }
            className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none transition focus:border-[#16522D]"
          />
        </div>

        <button
          type="button"
          onClick={() => removeVariant(variant.id)}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-200 text-red-500 transition hover:bg-red-50"
        >
          <Trash2 size={18} />
        </button>
      </div>
    ))}
  </div>
</div>
{/* ================= ADDONS ================= */}

<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <div className="mb-6 flex items-center justify-between">
    <div>
      <h3 className="text-lg font-semibold text-slate-900">
        Product Add-ons
      </h3>

      <p className="text-sm text-slate-500">
        Extra cheese, sauces, drinks, toppings...
      </p>
    </div>

    <button
      type="button"
      onClick={addAddon}
      className="rounded-xl bg-[#16522D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#114125]"
    >
      + Add Add-on
    </button>
  </div>

  <div className="space-y-4">

    {formData.addons.length === 0 && (
      <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-slate-400">
        No add-ons created yet.
      </div>
    )}

    {formData.addons.map((addon) => (

      <div
        key={addon.id}
        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
      >

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_160px_50px]">

          <input
            type="text"
            placeholder="Addon Name"
            value={addon.name}
            onChange={(e)=>
              updateAddon(
                addon.id,
                "name",
                e.target.value
              )
            }
            className="rounded-xl border border-slate-300 px-4 py-3"
          />

          <input
            type="text"
            placeholder="Description"
            value={addon.description}
            onChange={(e)=>
              updateAddon(
                addon.id,
                "description",
                e.target.value
              )
            }
            className="rounded-xl border border-slate-300 px-4 py-3"
          />

          <div className="relative">

            <span className="absolute left-4 top-1/2 -translate-y-1/2">
              ₹
            </span>

            <input
              type="number"
              value={addon.price}
              onChange={(e)=>
                updateAddon(
                  addon.id,
                  "price",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4"
            />

          </div>

          <button
            type="button"
            onClick={()=>removeAddon(addon.id)}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-200 text-red-500 hover:bg-red-50"
          >
            <Trash2 size={18}/>
          </button>

        </div>

      </div>

    ))}

  </div>

</div>


            <div className="space-y-6">
              {/* Product Image */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-5 text-lg font-semibold text-slate-900">
                  Product Image
                </h3>

                <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 transition hover:border-[#16522D] hover:bg-[#16522D]/5">
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageUpload}
                  />

                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#16522D]/10 text-[#16522D] transition duration-300 group-hover:scale-110">
                    <UploadCloud size={30} />
                  </div>

                  <h4 className="text-base font-semibold text-slate-900">
                    Upload Product Image
                  </h4>

                  <p className="mt-2 text-center text-sm text-slate-500">
                    Click to browse or drag & drop
                  </p>

                  <span className="mt-1 text-xs text-slate-400">
                    PNG, JPG, JPEG, WEBP (Max 5MB)
                  </span>
                </label>

                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square items-center justify-center bg-slate-100">
                      <div className="text-center">
                        <UploadCloud
                          size={42}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 text-sm text-slate-400">
                          Image Preview
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Settings */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-5 text-lg font-semibold text-slate-900">
                  Product Settings
                </h3>

                <div className="space-y-4">
                  <label className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                    <div>
                      <h4 className="font-medium text-slate-900">
                        Product Available
                      </h4>

                      <p className="text-sm text-slate-500">
                        Customers can purchase this item.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      name="available"
                      checked={formData.available}
                      onChange={handleChange}
                      className="h-5 w-5 accent-[#16522D]"
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                    <div>
                      <h4 className="font-medium text-slate-900">
                        Featured Product
                      </h4>

                      <p className="text-sm text-slate-500">
                        Highlight this item on the storefront.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                      className="h-5 w-5 accent-[#16522D]"
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                    <div>
                      <h4 className="font-medium text-slate-900">Combo Meal</h4>

                      <p className="text-sm text-slate-500">
                        Mark this as a combo product.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      name="combo"
                      checked={formData.combo}
                      onChange={handleChange}
                      className="h-5 w-5 accent-[#16522D]"
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                    <div>
                      <h4 className="font-medium text-slate-900">
                        Delivery Available
                      </h4>

                      <p className="text-sm text-slate-500">
                        Allow customers to order this item for delivery.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      name="delivery"
                      checked={formData.delivery}
                      onChange={handleChange}
                      className="h-5 w-5 accent-[#16522D]"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}

          <div className=" bottom-0 z-20 mt-8 border-t border-slate-200 bg-white/95 px-8 py-5 backdrop-blur">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="font-semibold text-slate-900">
                  {mode === "add" ? "Ready to save?" : "Ready to update?"}
                </h4>

                <p className="mt-1 text-sm text-slate-500">
                  Please verify all information before continuing.
                </p>
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-xl border border-slate-300 bg-slate-50 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Reset
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#16522D] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-[#16522D]/20 transition hover:bg-[#114125]"
                >
                  {mode === "add" ? "Save Product" : "Update Product"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
