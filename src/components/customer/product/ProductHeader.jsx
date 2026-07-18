import {
  ArrowLeft,
  Heart,
  Star,
  Circle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProductHeader({
  product,
  favouriteProducts = [],
  onFavourite,
}) {
  const navigate = useNavigate();

  const isFavourite = favouriteProducts.some(
    (item) => item.id === product?.id
  );

  return (
    <div className="space-y-5">
      {/* Mobile Header */}

      <div className="flex items-center justify-between lg:hidden">
        <button
          onClick={() => navigate(-1)}
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            border
            border-gray-200
            bg-white
            shadow-sm
            transition
            hover:bg-slate-100
          "
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="text-lg font-bold">
          Product Details
        </h1>

        <button
          onClick={() => onFavourite?.(product)}
          className={`
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            border
            shadow-sm
            transition-all
            duration-200
            ${
              isFavourite
                ? "border-red-200 bg-red-50 text-red-500"
                : "border-gray-200 bg-white text-gray-500 hover:border-red-200 hover:text-red-500"
            }
          `}
        >
          <Heart
            size={20}
            className={isFavourite ? "fill-current" : ""}
          />
        </button>
      </div>

      {/* Desktop Header */}

      <div className="hidden items-center justify-between lg:flex">
        <button
          onClick={() => navigate(-1)}
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            p-3
            text-sm
            font-semibold
            text-gray-600
            transition
            hover:bg-slate-100
            hover:text-[#16522d]
          "
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <button
          onClick={() => onFavourite?.(product)}
          className={`
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            border
            shadow-sm
            transition-all
            duration-200
            ${
              isFavourite
                ? "border-red-200 bg-red-50 text-red-500"
                : "border-gray-200 bg-white text-gray-500 hover:border-red-200 hover:text-red-500"
            }
          `}
        >
          <Heart
            size={20}
            className={isFavourite ? "fill-current" : ""}
          />
        </button>
      </div>

      {/* Product Details */}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1
            className="
              text-3xl
              font-bold
              tracking-tight
              text-slate-900
              lg:text-[38px]
            "
          >
            {product?.name}
          </h1>

          <div
            className="
              mt-3
              flex
              flex-wrap
              items-center
              gap-x-4
              gap-y-2
              text-sm
              text-gray-600
            "
          >
            {/* Rating */}

            <div className="flex items-center gap-1.5">
              <Star
                size={16}
                className="fill-[#ffc700] text-[#ffc700]"
              />

              <span className="font-semibold text-slate-800">
                {product?.rating?.average ?? 0}
              </span>

              <span>
                ({product?.rating?.count ?? 0})
              </span>
            </div>

            <Circle
              size={5}
              className="fill-gray-400 text-gray-400"
            />

            <span>{product?.category}</span>
          </div>
        </div>

        <span
          className={`
            shrink-0
            rounded-xl
            px-4
            py-2
            text-sm
            font-semibold
            ${
              product?.available
                ? "bg-green-50 text-[#16522d]"
                : "bg-red-50 text-red-600"
            }
          `}
        >
          {product?.available
            ? "Available"
            : "Unavailable"}
        </span>
      </div>
    </div>
  );
}