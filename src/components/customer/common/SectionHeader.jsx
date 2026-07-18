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
        gap-4

        sm:flex-row
        sm:items-center
        sm:justify-between

        ${centered ? "text-center sm:text-left" : ""}

        ${className}
      `}
    >

      {/* Left */}

      <div className="min-w-0">

        <div className="flex items-center gap-3">

          {Icon && (
            <div
              className="
                flex
                h-12
                w-12

                items-center
                justify-center

                rounded-2xl

                text-white

                shadow-md
              "
              style={{
                background: "var(--primary)",
              }}
            >
              <Icon size={22} />
            </div>
          )}


          <div>

            <h2
              className="
                text-xl

                font-bold

                text-slate-900 dark:text-white
              "
            >
              {title}
            </h2>


            {subtitle && (
              <p
                className="
                  mt-1

                  text-sm

                  text-slate-500 dark:text-slate-400
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

            gap-2

            self-start

            rounded-xl

            px-4

            py-2

            text-sm

            font-semibold

            transition

            hover:opacity-80
          "
          style={{
            color: "var(--primary)",
          }}
        >

          {action}

          <ChevronRight size={16} />

        </button>
      )}

    </div>
  );
};

export default SectionHeader;