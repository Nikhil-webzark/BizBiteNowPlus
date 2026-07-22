import { ChevronRight } from "lucide-react";

const SectionHeader = ({
  title,
  subtitle,
  action,
  onAction,
  icon: Icon,
  className = "",
  centered = false,
}) => {
  return (
    <div
      className={`
        flex
        flex-col
        gap-3

        sm:flex-row
        sm:items-center
        sm:justify-between

        lg:gap-4

        ${centered ? "text-center sm:text-left" : ""}

        ${className}
      `}
    >

      {/* Left */}

      <div className="min-w-0">

        <div className="flex items-center gap-2 lg:gap-3">

          {Icon && (
            <div
              className="
                flex
                h-9
                w-9

                items-center
                justify-center

                rounded-xl

                text-white

                shadow-md

                lg:h-12
                lg:w-12
                lg:rounded-2xl
              "
              style={{
                background: "var(--primary)",
              }}
            >
              <Icon size={16} className="lg:hidden" />
              <Icon size={22} className="hidden lg:block" />
            </div>
          )}


          <div>

            <h2
              className="
                text-base

                font-bold

                text-slate-900 dark:text-white

                lg:text-xl
              "
            >
              {title}
            </h2>


            {subtitle && (
              <p
                className="
                  mt-0.5

                  text-xs

                  text-slate-500 dark:text-slate-400

                  lg:mt-1
                  lg:text-sm
                "
              >
                {subtitle}
              </p>
            )}

          </div>


        </div>

      </div>


      {/* Right */}

      {action && (
        <button
          onClick={onAction}
          className="
            inline-flex

            items-center

            gap-1.5

            self-start

            rounded-xl

            px-3

            py-1.5

            text-xs

            font-semibold

            transition

            hover:opacity-80

            lg:gap-2
            lg:px-4
            lg:py-2
            lg:text-sm
          "
          style={{
            color: "var(--primary)",
          }}
        >

          {action}

          <ChevronRight size={14} className="lg:hidden" />
          <ChevronRight size={16} className="hidden lg:block" />

        </button>
      )}

    </div>
  );
};

export default SectionHeader;