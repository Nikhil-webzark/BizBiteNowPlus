import {
  ChevronRight,
  Globe,
  Shield,
  CircleHelp,
  FileText,
  LogOut,
  Trash2,
  Palette,
  Heart,
} from "lucide-react";

const settings = [
  {
    id: "appearance",
    title: "Appearance",
    subtitle: "Customize your app experience",
    icon: Palette,
  },
  {
    id: "language",
    title: "Language",
    subtitle: "English",
    icon: Globe,
  },
  {
    id: "favorites",
    title: "Favorite Restaurants",
    subtitle: "Manage your favourites",
    icon: Heart,
  },
  {
    id: "privacy",
    title: "Privacy & Security",
    subtitle: "Password, permissions & privacy",
    icon: Shield,
  },
  {
    id: "support",
    title: "Help & Support",
    subtitle: "FAQs and Contact Us",
    icon: CircleHelp,
  },
  {
    id: "terms",
    title: "Terms & Privacy Policy",
    subtitle: "Read our policies",
    icon: FileText,
  },
];

const SettingsCard = ({
  onItemClick,
  onLogout,
  onDeleteAccount,
  deletingAccount = false,
}) => {
  return (
    <section className="space-y-6">
      {/* Settings */}

      <div
        className="
          overflow-hidden

          rounded-[30px]

          border
          border-slate-200 dark:border-[#A9BDCF]/40

          bg-white dark:bg-[#181A1B]

          shadow-sm
        "
      >
        {settings.map((item, index) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item.id)}
              className={`
                flex
                w-full
                items-center
                gap-5

                p-5

                text-left

                transition

                hover:bg-slate-50 dark:hover:bg-white/5

                ${
                  index !== settings.length - 1
                    ? "border-b border-slate-100 dark:border-[#A9BDCF]/20"
                    : ""
                }
              `}
            >
              <div
                className="
                  flex
                  h-12
                  w-12

                  items-center
                  justify-center

                  rounded-2xl

                  text-white
                "
                style={{
                  background: "var(--primary)",
                }}
              >
                <Icon size={20} />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {item.title}
                </h3>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {item.subtitle}
                </p>
              </div>

              <ChevronRight
                size={20}
                className="text-slate-400 dark:text-slate-600"
              />
            </button>
          );
        })}
      </div>

      {/* Logout */}

      <button
        onClick={onLogout}
        className="
          flex
          w-full
          items-center
          justify-center
          gap-3

          rounded-[24px]

          border
          border-red-200 dark:border-red-500/30

          bg-red-50 dark:bg-red-500/10

          py-4

          font-semibold

          text-red-600 dark:text-red-400

          transition

          hover:bg-red-100 dark:hover:bg-red-500/20
        "
      >
        <LogOut size={20} />

        Logout
      </button>

      {/* Delete */}

      <button
        onClick={onDeleteAccount}
        disabled={deletingAccount}
        className="
          flex
          w-full
          items-center
          justify-center
          gap-3

          rounded-[24px]

          border
          border-red-600

          bg-red-600

          py-4

          font-semibold

          text-white

          transition

          hover:bg-red-700

          disabled:opacity-60
        "
      >
        <Trash2 size={20} />

        {deletingAccount ? "Deleting..." : "Delete Account"}
      </button>
    </section>
  );
};

export default SettingsCard;