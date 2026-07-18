import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import ProductGallery from "../../components/customer/product/ProductGallery";
import ProductHeader from "../../components/customer/product/ProductHeader";
import ProductInfo from "../../components/customer/product/ProductInfo";
import VariantSelector from "../../components/customer/product/VariantSelector";
import AddonSelector from "../../components/customer/product/AddonSelector";
import QuantitySelector from "../../components/customer/product/QuantitySelector";
import PriceSummary from "../../components/customer/product/PriceSummary";
import ProductSkeleton from "../../components/customer/product/ProductSkeleton";
import ProductNote from "../../components/customer/product/ProductNote";
import { getProduct  } from "../../api/customerApi";
import { useFavourite } from "../../context/FavouriteContext";

export default function ProductDetails() {
  const { id } = useParams();

  const {
    favouriteProducts,
    toggleFavourite,
  } = useFavourite();
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);

  const [selectedSize, setSelectedSize] =
    useState(null);

  const [selectedVariant, setSelectedVariant] =
    useState(null);

  const [selectedAddons, setSelectedAddons] =
    useState([]);

  const [product, setProduct] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const response = await getProduct(id);

        const data = response.data.data;

        setProduct(data);

        if (data?.sizes?.length) {
          setSelectedSize(data.sizes[0].id);
        }

        if (data?.variants?.length) {
          setSelectedVariant(data.variants[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      load();
    }
  }, [id]);

  if (loading) {
    return <ProductSkeleton />;
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-medium text-gray-500">
          Product not found.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="
          mx-auto
          w-full
          max-w-[1600px]
          px-3
          py-4
          sm:px-5
          md:px-6
          lg:px-8
          xl:px-10
        "
      >
        <div
          className="
            grid
            gap-6
            lg:grid-cols-[1.05fr_0.95fr]
            xl:gap-8
          "
        >
          {/* Left */}

          <section className="min-w-0 lg:mt-25">
            <ProductGallery product={product} />
          </section>

          {/* Right */}

          <section className="min-w-0 space-y-5">
            <ProductHeader
              product={product}
              favouriteProducts={
                favouriteProducts
              }
              onFavourite={
                toggleFavourite
              }
            />

            <ProductInfo product={product} />

            <VariantSelector
              product={product}
              selectedSize={selectedSize}
              setSelectedSize={
                setSelectedSize
              }
              selectedVariant={
                selectedVariant
              }
              setSelectedVariant={
                setSelectedVariant
              }
            />

            <AddonSelector
              product={product}
              selectedAddons={
                selectedAddons
              }
              setSelectedAddons={
                setSelectedAddons
              }
            />

          </section>
        </div>
                    <ProductNote
  note={note}
  setNote={setNote}
/>

        <div
          className="
            mt-6
            grid
            gap-4
            lg:grid-cols-[220px_1fr]
          "
        >
          <QuantitySelector
            quantity={quantity}
            setQuantity={setQuantity}
          />

<PriceSummary
  product={product}
  quantity={quantity}
  addons={selectedAddons}
  selectedSize={selectedSize}
  selectedVariant={selectedVariant}
/>
        </div>
      </div>
    </div>
  );
}