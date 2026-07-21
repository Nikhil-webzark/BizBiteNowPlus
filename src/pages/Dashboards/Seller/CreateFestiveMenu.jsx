import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check, Save, X } from "lucide-react";
import { motion } from "framer-motion";

import BasicInfoStep from "../../../components/dashboard/festive/builder/BasicInfoStep";
import ProductsStep from "../../../components/dashboard/festive/builder/ProductsStep";
import ScheduleStep from "../../../components/dashboard/festive/builder/ScheduleStep";
import ReviewStep from "../../../components/dashboard/festive/builder/ReviewStep";

import useFestiveMenuStore from "../../../store/festiveMenuStore";
import API from "../../../services/api";

const STEPS = [
  { id: 1, title: "Basic Info", subtitle: "Festival Details" },
  { id: 2, title: "Products", subtitle: "Choose Products" },
  { id: 3, title: "Schedule", subtitle: "Publish Timing" },
  { id: 4, title: "Review", subtitle: "Publish" },
];

export default function CreateFestiveMenu() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const {
    menus,
    loading,
    fetchMenus,
    addMenu,
    updateMenu,
    getMenuById,
  } = useFestiveMenuStore();

  const [availableProducts, setAvailableProducts] = useState([]);

  // Fetch store inventory products
  useEffect(() => {
    API.get("/product/dashboard/all")
      .then((res) => {
        const raw = res.data.products || res.data.data || [];
        setAvailableProducts(Array.isArray(raw) ? raw : []);
      })
      .catch((err) => console.error("Error loading products for menu builder:", err));
  }, []);

  useEffect(() => {
    if (isEdit && menus.length === 0) {
      fetchMenus().catch(() => {});
    }
  }, [isEdit, menus.length, fetchMenus]);

  const existingMenu = isEdit ? getMenuById(id) : null;
  const [currentStep, setCurrentStep] = useState(1);

  // 🎯 Clean Initializers (No useEffect + No setState inside effect = 0 ESLint Errors)
  const [basicInfo, setBasicInfo] = useState(() => ({
    name: existingMenu?.name || "",
    festival: existingMenu?.festival || "",
    description: existingMenu?.description || "",
    banner: existingMenu?.banner || "",
    banner_image: null,
  }));

  const [products, setProducts] = useState(() => existingMenu?.products || []);

  const [schedule, setSchedule] = useState(() => {
    const startParts = existingMenu?.goLive ? existingMenu.goLive.split("T") : ["", ""];
    const endParts = existingMenu?.endsOn ? existingMenu.endsOn.split("T") : ["", ""];

    return {
      startDate: startParts[0] || "",
      startTime: startParts[1] ? startParts[1].slice(0, 5) : "",
      endDate: endParts[0] || "",
      endTime: endParts[1] ? endParts[1].slice(0, 5) : "",
    };
  });

  // Re-sync states when existingMenu finishes loading during edit refresh
  const [syncedId, setSyncedId] = useState(null);
  if (existingMenu && existingMenu.id !== syncedId) {
    setSyncedId(existingMenu.id);
    setBasicInfo({
      name: existingMenu.name || "",
      festival: existingMenu.festival || "",
      description: existingMenu.description || "",
      banner: existingMenu.banner || "",
      banner_image: null,
    });
    setProducts(existingMenu.products || []);
    const startParts = existingMenu.goLive ? existingMenu.goLive.split("T") : ["", ""];
    const endParts = existingMenu.endsOn ? existingMenu.endsOn.split("T") : ["", ""];
    setSchedule({
      startDate: startParts[0] || "",
      startTime: startParts[1] ? startParts[1].slice(0, 5) : "",
      endDate: endParts[0] || "",
      endTime: endParts[1] ? endParts[1].slice(0, 5) : "",
    });
  }

  const progress = (currentStep / STEPS.length) * 100;

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return Boolean(basicInfo.name && basicInfo.festival);
      case 2:
        return Array.isArray(products) && products.length > 0;
      case 3:
        return Boolean(
          schedule.startDate &&
          schedule.startTime &&
          schedule.endDate &&
          schedule.endTime
        );
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateStep()) {
      alert("Please complete all required fields for this step.");
      return;
    }
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const formatISO = (dateStr, timeStr) => {
    if (!dateStr) return "";
    const time = timeStr ? (timeStr.length === 5 ? `${timeStr}:00` : timeStr) : "00:00:00";
    return `${dateStr}T${time}`;
  };

  const sanitizeProducts = (prodList) => {
    if (!Array.isArray(prodList)) return [];
    return prodList.map((p) => {
      const prodId = p._id || p.id;
      return typeof p === "object" ? { ...p, _id: prodId, id: prodId } : prodId;
    });
  };

  const buildPayload = (status) => ({
    name: basicInfo.name,
    festival: basicInfo.festival,
    description: basicInfo.description,
    banner_image: basicInfo.banner_image,
    banner_url: basicInfo.banner,
    products: sanitizeProducts(products),
    status,
    goLive: formatISO(schedule.startDate, schedule.startTime),
    endsOn: formatISO(schedule.endDate, schedule.endTime),
  });

  const saveDraft = async () => {
    try {
      const payload = buildPayload("draft");
      if (isEdit && existingMenu) {
        await updateMenu(existingMenu.id, payload);
        alert("Draft Updated Successfully!");
      } else {
        await addMenu(payload);
        alert("Draft Saved Successfully!");
      }
      navigate("/seller/festivemenu");
    } catch (err) {
      alert(err?.response?.data?.message || "Unable to save draft");
    }
  };

  const publishMenu = async () => {
    if (!validateStep()) {
      alert("Please fill all mandatory fields before publishing.");
      return;
    }

    try {
      const payload = buildPayload("active");
      if (isEdit && existingMenu) {
        await updateMenu(existingMenu.id, payload);
        alert("Festive Menu Updated Successfully!");
      } else {
        await addMenu(payload);
        alert("Festive Menu Published Successfully!");
      }
      navigate("/seller/festivemenu");
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Unable to publish menu. Check your tier limits (PRO: max 3 active deals)."
      );
    }
  };

  if (isEdit && loading && !existingMenu) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center font-medium text-slate-500">
        Loading menu data...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="mx-auto max-w-7xl space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-inter text-3xl font-bold text-black">
              {isEdit ? (
                <>Edit Festive <span className="text-green-700">Menu</span></>
              ) : (
                <>Create Festive <span className="text-green-700">Menu</span></>
              )}
            </h1>
            <p className="mt-2 text-slate-500">
              {isEdit ? "Update your seasonal deal details." : "Create a festive offer in four simple steps."}
            </p>
          </div>

          <button
            onClick={() => navigate("/seller/festivemenu")}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-5 py-2.5 transition hover:bg-slate-100"
          >
            <X size={18} />
            Cancel
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full rounded-full bg-slate-200">
          <div
            className="h-2 rounded-full bg-green-700 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Stepper Headers */}
        <div className="grid grid-cols-4 gap-5">
          {STEPS.map((step) => {
            const active = currentStep === step.id;
            const completed = currentStep > step.id;

            return (
              <div
                key={step.id}
                className={`rounded-xl border p-5 transition-all ${
                  active
                    ? "border-orange-500 bg-orange-50"
                    : completed
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${
                      completed
                        ? "bg-emerald-500 text-white"
                        : active
                        ? "bg-orange-500 text-white"
                        : "bg-orange-200 text-black"
                    }`}
                  >
                    {completed ? <Check size={18} /> : step.id}
                  </div>
                  <div>
                    <h3 className="font-medium text-black">{step.title}</h3>
                    <p className="text-xs text-slate-500">{step.subtitle}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step Content Render */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          {currentStep === 1 && (
            <BasicInfoStep
              data={basicInfo}
              onChange={(updatedData) =>
                setBasicInfo((prev) => ({ ...prev, ...updatedData }))
              }
            />
          )}
          {currentStep === 2 && (
            <ProductsStep
              data={products}
              products={availableProducts}
              onChange={setProducts}
            />
          )}
          {currentStep === 3 && (
            <ScheduleStep data={schedule} onChange={setSchedule} />
          )}
          {currentStep === 4 && (
            <ReviewStep
              basicInfo={basicInfo}
              products={products}
              appearance={{}}
              schedule={schedule}
            />
          )}
        </div>

        {/* Navigation Footer Controls */}
        <div className="rounded-2xl bg-white px-6 py-5 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={previousStep}
              disabled={currentStep === 1}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-medium transition ${
                currentStep === 1
                  ? "cursor-not-allowed border opacity-40"
                  : "cursor-pointer border hover:bg-slate-100"
              }`}
            >
              <ChevronLeft size={18} />
              Previous
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={saveDraft}
                disabled={loading}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-green-700 bg-green-100 px-5 py-2.5 font-medium text-black transition-all hover:bg-green-700 hover:text-white disabled:opacity-50"
              >
                <Save size={18} />
                {isEdit ? "Update Draft" : "Save Draft"}
              </button>

              {currentStep !== STEPS.length ? (
                <button
                  onClick={nextStep}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#ffc700] px-6 py-2.5 font-medium text-black transition hover:bg-yellow-500 hover:text-white"
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={publishMenu}
                  disabled={loading}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Check size={18} />
                  {isEdit ? "Update Menu" : "Publish Menu"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}