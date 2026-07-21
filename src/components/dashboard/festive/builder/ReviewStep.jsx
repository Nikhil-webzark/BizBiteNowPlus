import { Calendar, Package } from "lucide-react";

export default function ReviewStep({
  basicInfo = {},
  products = [],
  schedule = {},
}) {
  // Safe Image URL Resolver (Handles both URL string and File preview)
  const getBannerSrc = () => {
    if (typeof basicInfo.banner === "string" && basicInfo.banner.trim() !== "") {
      return basicInfo.banner;
    }
    if (basicInfo.banner_image instanceof File) {
      return URL.createObjectURL(basicInfo.banner_image);
    }
    return null;
  };

  const bannerSrc = getBannerSrc();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Review & Publish</h2>
        <p className="mt-1 text-sm text-slate-500">
          Verify all details before publishing your festive menu.
        </p>
      </div>

      {/* Banner & Basic Info */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-5">
        {/* Strictly renders img tag ONLY if a valid URL/Blob exists */}
        {bannerSrc ? (
          <img
            src={bannerSrc}
            alt={basicInfo.name || "Festive Banner"}
            className="mb-4 h-48 w-full rounded-xl object-cover"
          />
        ) : null}

        <div className="space-y-2">
          <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
            {basicInfo.festival || "General Festival"}
          </span>
          <h3 className="text-xl font-bold text-slate-900">
            {basicInfo.name || "Untitled Offer"}
          </h3>
          <p className="text-sm text-slate-600">
            {basicInfo.description || "No description provided."}
          </p>
        </div>
      </div>

      {/* Schedule Summary */}
      <div className="rounded-2xl border border-slate-200 p-5 space-y-3">
        <h4 className="font-semibold text-slate-800 flex items-center gap-2">
          <Calendar size={18} className="text-green-700" /> Schedule Details
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500 block">Starts On</span>
            <span className="font-medium text-slate-900">
              {schedule.startDate || "N/A"} at {schedule.startTime || "00:00"}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Ends On</span>
            <span className="font-medium text-slate-900">
              {schedule.endDate || "N/A"} at {schedule.endTime || "00:00"}
            </span>
          </div>
        </div>
      </div>

      {/* Products Summary */}
      <div className="rounded-2xl border border-slate-200 p-5 space-y-3">
        <h4 className="font-semibold text-slate-800 flex items-center gap-2">
          <Package size={18} className="text-green-700" /> Selected Products ({products.length})
        </h4>

        {products.length === 0 ? (
          <p className="text-sm text-slate-500">No products selected.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {products.map((item, index) => {
              const itemKey = item._id || item.id || `product-item-${index}`;
              return (
                <div key={itemKey} className="flex items-center justify-between py-3">
                  <div>
                    <h5 className="font-medium text-slate-900">{item.name}</h5>
                    <p className="text-xs text-slate-500">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">
                      ₹{item.festivePrice ?? item.price}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      Qty: {item.quantity || 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}