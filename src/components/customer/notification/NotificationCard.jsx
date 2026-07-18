import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

import {
  NOTIFICATION_COLORS,
  NOTIFICATION_ICONS,
} from "../../../data/customer/notificationData";

const NotificationCard = ({
  notification,
  onClick,
}) => {
  const {
    type,
    title,
    message,
    time,
    read,
  } = notification;

  const Icon =
    NOTIFICATION_ICONS[type];

  const colors =
    NOTIFICATION_COLORS[type];

  return (
    <motion.button
      whileHover={{
        y: -2,
      }}
      whileTap={{
        scale: 0.98,
      }}
      onClick={() => onClick(notification)}
      className={`
        w-full
        rounded-2xl
        border
        text-left
        transition-all
        duration-200
        ${
          read
            ? "border-slate-200 bg-white"
            : "border-blue-100 bg-blue-50/40"
        }
      `}
    >
      <div className="flex items-start gap-4 p-4">

        {/* Icon */}

        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
          style={{
            background: colors.bg,
          }}
        >
          <Icon
            size={22}
            style={{
              color: colors.icon,
            }}
          />
        </div>

        {/* Content */}

        <div className="min-w-0 flex-1">

          <div className="flex items-start justify-between gap-3">

            <div className="min-w-0">

              <div className="flex items-center gap-2">

                <h3
                  className={`
                    truncate
                    text-sm
                    font-semibold
                    ${
                      read
                        ? "text-slate-700"
                        : "text-slate-900"
                    }
                  `}
                >
                  {title}
                </h3>

                {!read && (
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                )}

              </div>

              <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                {message}
              </p>

            </div>

            <ChevronRight
              size={18}
              className="text-slate-400"
            />

          </div>

          <div className="mt-3 flex items-center justify-between">

            <span className="text-xs text-slate-400">
              {time}
            </span>

            {!read && (
              <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-semibold text-blue-700">
                NEW
              </span>
            )}

          </div>

        </div>

      </div>
    </motion.button>
  );
};

export default NotificationCard;