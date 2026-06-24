import React, { useState, useEffect } from "react";
import { getAllUsers } from "../../services/userService";
import { UserTable } from "../../components/users/UserTable";
import { ChangeRoleModal } from "../../components/users/ChangeRoleModal";
import { DeleteUserModal } from "../../components/users/DeleteUserModal";
import { useToast } from "../../context/ToastContext";
import type { User } from "../../types/auth";

export const UserManagement: React.FC = () => {
  const { showError } = useToast();
  const [users, setUsers] = useState<(User & { stats?: { tasksCreated: number; tasksAssigned: number; tasksCompleted: number } })[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal controls
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleOpen, setRoleOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    getAllUsers()
      .then((data) => {
        setUsers(data);
      })
      .catch((err) => {
        showError(err.message || "Failed to load users");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditRoleClick = (user: User) => {
    setSelectedUser(user);
    setRoleOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">User Directory</h1>
        <p className="text-slate-500 text-sm">Review, verify, and update roles or access privileges for operators.</p>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <span className="text-slate-500 text-sm font-medium">Retrieving user accounts...</span>
        </div>
      ) : (
        <UserTable
          users={users}
          onEditRole={handleEditRoleClick}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Change Role Modal */}
      <ChangeRoleModal
        user={selectedUser}
        isOpen={roleOpen}
        onClose={() => {
          setRoleOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={fetchUsers}
      />

      {/* Delete User Modal */}
      <DeleteUserModal
        user={selectedUser}
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={fetchUsers}
      />
    </div>
  );
};
