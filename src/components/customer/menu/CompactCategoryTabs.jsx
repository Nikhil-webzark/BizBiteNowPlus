// Backend sends categories as plain strings (["Burger","Starters"]),
// not { id, name, icon } objects — normalize here so category.id/name/icon
// always resolve, and each button gets a unique key. "All" is prepended
// since it isn't part of the backend's category list.
const EMOJI_BY_CATEGORY = {
  burger: "🍔",
  pizza: "🍕",
  starters: "🥟",
  drinks: "🥤",
  beverages: "🥤",
  dessert: "🍰",
  desserts: "🍰",
  biryani: "🍛",
  rice: "🍚",
  noodles: "🍜",
  salad: "🥗",
  sandwich: "🥪",
  chinese: "🥡",
};

const toEmoji = (name = "") =>
  EMOJI_BY_CATEGORY[name.toLowerCase()] || "🍽️";

const normalizeCategories = (categories = []) => {
  const normalized = categories.map((item) =>
    typeof item === "string"
      ? { id: item, name: item, icon: toEmoji(item) }
      : { icon: toEmoji(item.name), ...item }
  );
  return [{ id: "all", name: "All", icon: "🍽️" }, ...normalized];
};

const CompactCategoryTabs = ({
  categories = [],
  activeCategory,
  onChange,
}) => {
  const normalizedCategories = normalizeCategories(categories);

  return (
    <div
      className="
        flex
        gap-3

        overflow-x-auto

        px-4
        pb-2

        scrollbar-hide
        
        lg:hidden
      "
    >


      {normalizedCategories.map((category) => (
        <button
          key={category.id}
          onClick={() =>
            onChange(category.id)
          }
          className={`
            whitespace-nowrap

            rounded-xl

            px-5
            py-2

            text-sm
            font-semibold

            transition

            ${activeCategory === category.id
              ? "text-white"
              : "bg-white text-slate-700 "
            }
          `}
          style={
            activeCategory === category.id
              ? {
                background:
                  "var(--primary)",
              }
              : undefined
          }
        >
          {category.icon} {category.name}
        </button>
      ))}
    </div>
  );
};

export default CompactCategoryTabs;