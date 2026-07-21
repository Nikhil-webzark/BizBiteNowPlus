import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FestiveHeader from "../../../components/dashboard/festive/FestiveHeader";
import FestiveBanner from "../../../components/dashboard/festive/FestiveBanner";
import FestiveStats from "../../../components/dashboard/festive/FestiveStats";
import FestiveFilters from "../../../components/dashboard/festive/FestiveFilters";
import FestiveMenuTable from "../../../components/dashboard/festive/FestiveMenuTable";
import FestiveEmptyState from "../../../components/dashboard/festive/FestiveEmptyState";
import { motion } from "framer-motion";
import CreateFestiveMenuModal from "../../../components/dashboard/festive/modals/CreateFestiveMenuModal";
import ScheduleMenuModal from "../../../components/dashboard/festive/modals/ScheduleMenuModal";
import DuplicateMenuModal from "../../../components/dashboard/festive/modals/DuplicateMenuModal";
import DeleteMenuModal from "../../../components/dashboard/festive/modals/DeleteMenuModal";

import useFestiveMenuStore from "../../../store/festiveMenuStore";

export default function FestiveMenu() {
  const navigate = useNavigate();

  const {
    menus,
    loading,
    error,
    fetchMenus,
    addMenu,
    updateMenu,
    deleteMenu,
    duplicateMenu,
  } = useFestiveMenuStore();

  const [search, setSearch] = useState("");
  const [festivalFilter, setFestivalFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedMenu, setSelectedMenu] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch menus on mount
  useEffect(() => {
    fetchMenus().catch(() => {});
  }, [fetchMenus]);

  /* ------------------------------------------ */

  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const handleViewMenu = (menu) => {
    navigate(`/seller/festivemenu/${menu.id}`);
  };

  const handleEdit = (menu) => {
    navigate(`/seller/festivemenu/edit/${menu.id}`);
  };

  const handleSchedule = (menu) => {
    setSelectedMenu(menu);
    setShowScheduleModal(true);
  };

  const handleDuplicate = (menu) => {
    setSelectedMenu(menu);
    setShowDuplicateModal(true);
  };

  const handleDelete = (menu) => {
    setSelectedMenu(menu);
    setShowDeleteModal(true);
  };

  /* ------------------------------------------ */

  const handleSaveSchedule = async (updatedMenu) => {
    try {
      await updateMenu(updatedMenu.id, updatedMenu);
      setSelectedMenu(null);
      setShowScheduleModal(false);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save schedule");
    }
  };

  const handleDuplicateSave = async () => {
    if (!selectedMenu) return;
    try {
      await duplicateMenu(selectedMenu.id);
      setSelectedMenu(null);
      setShowDuplicateModal(false);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to duplicate menu");
    }
  };

  const handleDeleteConfirm = async (menuToDelete) => {
    try {
      await deleteMenu(menuToDelete.id);
      setSelectedMenu(null);
      setShowDeleteModal(false);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete menu");
    }
  };

  /* ------------------------------------------ */

 const filteredMenus = useMemo(() => {
    return menus.filter((menu) => {
      const query = search.toLowerCase();

      const matchesSearch =
        !query ||
        menu.name?.toLowerCase().includes(query) ||
        menu.festival?.toLowerCase().includes(query);

      const matchesFestival =
        festivalFilter === "All" || menu.festival === festivalFilter;

      // Case-Insensitive Status Filter Fix
      const matchesStatus =
        statusFilter === "All" || 
        String(menu.status).toLowerCase() === String(statusFilter).toLowerCase();

      return matchesSearch && matchesFestival && matchesStatus;
    });
  }, [menus, search, festivalFilter, statusFilter]);

  const activeMenu = useMemo(() => {
    return menus.find((menu) => menu.status === "active");
  }, [menus]);

  const stats = useMemo(() => {
    return {
      totalMenus: menus.length,
      active: menus.filter((menu) => menu.status === "active").length,
      scheduled: menus.filter((menu) => menu.status === "scheduled").length,
      draft: menus.filter((menu) => menu.status === "draft").length,
      expired: menus.filter((menu) => menu.status === "expired").length,
    };
  }, [menus]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="space-y-6">
        <FestiveHeader totalMenus={menus.length} onCreate={handleCreate} />

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <FestiveBanner menu={activeMenu} onViewMenu={handleViewMenu} />

        <FestiveStats stats={stats} />

        <FestiveFilters
          search={search}
          setSearch={setSearch}
          festival={festivalFilter}
          setFestival={setFestivalFilter}
          status={statusFilter}
          setStatus={setStatusFilter}
        />

        {loading && menus.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            Loading festive deals...
          </div>
        ) : filteredMenus.length === 0 ? (
          <FestiveEmptyState search={search} onCreate={handleCreate} />
        ) : (
          <FestiveMenuTable
            menus={filteredMenus}
            onEdit={handleEdit}
            onSchedule={handleSchedule}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        )}

        {/* Create Menu Modal */}
        <CreateFestiveMenuModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={async (menu) => {
            try {
              await addMenu(menu);
              setShowCreateModal(false);
            } catch (err) {
              alert(err?.response?.data?.message || "Failed to create menu");
            }
          }}
        />

        {/* Schedule Menu Modal */}
        <ScheduleMenuModal
          open={showScheduleModal}
          menu={selectedMenu}
          onSave={handleSaveSchedule}
          onClose={() => {
            setSelectedMenu(null);
            setShowScheduleModal(false);
          }}
        />

        {/* Duplicate Menu Modal */}
        <DuplicateMenuModal
          open={showDuplicateModal}
          menu={selectedMenu}
          onDuplicate={handleDuplicateSave}
          onClose={() => {
            setSelectedMenu(null);
            setShowDuplicateModal(false);
          }}
        />

        {/* Delete Menu Modal */}
        <DeleteMenuModal
          open={showDeleteModal}
          menu={selectedMenu}
          onDelete={handleDeleteConfirm}
          onClose={() => {
            setSelectedMenu(null);
            setShowDeleteModal(false);
          }}
        />
      </div>
    </motion.div> 
  );
}