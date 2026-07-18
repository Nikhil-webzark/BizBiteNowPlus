import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import NotificationCard from "../../components/customer/notification/NotificationCard";
import NotificationTabs from "../../components/customer/notification/EmptyNotification";
import EmptyNotifications from "../../components/customer/notification/NotificationTabs";

import { DEMO_NOTIFICATIONS } from "../../data/customer/notificationData";

const Notifications = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("all");

  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);

  const filteredNotifications = useMemo(() => {
    if (activeTab === "all") return notifications;

    return notifications.filter(
      (notification) => notification.type === activeTab,
    );
  }, [notifications, activeTab]);

  const groupedNotifications = useMemo(() => {
    return {
      Today: filteredNotifications.filter((item) => item.section === "Today"),
      Yesterday: filteredNotifications.filter(
        (item) => item.section === "Yesterday",
      ),
      Earlier: filteredNotifications.filter(
        (item) => item.section === "Earlier",
      ),
    };
  }, [filteredNotifications]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        read: true,
      })),
    );
  };

  const openNotification = (notification) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notification.id
          ? {
              ...item,
              read: true,
            }
          : item,
      ),
    );

    navigate(notification.route);
  };

  return (
    <div
      className="
    pt-4
    w-full
    min-w-0
    max-w-[1760px]
    space-y-6
    pb-28
    px-1
    sm:px-2
  "
    >
      {/* Header */}

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>

            <p className="text-sm text-slate-500">
              {unreadCount} unread notifications
            </p>
          </div>
        </div>

        <button
          onClick={markAllRead}
          className="
            flex
            items-center
            gap-2
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            py-2
            text-sm
            font-medium
            hover:bg-slate-50
          "
        >
          <CheckCheck size={18} />
          Mark all read
        </button>
      </div>

      <NotificationTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-6">
        {filteredNotifications.length === 0 ? (
          <EmptyNotifications
            title="No Notifications Found"
            description="There are no notifications for the selected filter."
          />
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedNotifications).map(([section, items]) => {
              if (items.length === 0) return null;

              return (
                <div key={section}>
                  {/* Section Heading */}

                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {section}
                  </h2>

                  <motion.div layout className="space-y-3">
                    {items.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{
                          opacity: 0,
                          y: 20,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay: index * 0.05,
                        }}
                      >
                        <NotificationCard
                          notification={notification}
                          onClick={openNotification}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
