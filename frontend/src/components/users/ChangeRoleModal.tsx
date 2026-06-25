import React, { useState, useEffect } from "react";
import { Button } from "../Button";
import { Select } from "../Select";
import { updateUserRole } from "../../services/userService";
import { useToast } from "../../context/ToastContext";
import type { User } from "../../types/auth";

interface ChangeRoleModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({ user, isOpen, onClose, onSuccess }) => {
  const { showSuccess, showError } = useToast();
  const [role, setRole] = useState<"admin" | "user">("user");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setRole(user.role);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateUserRole(user.id || (user as any)._id, role);
      showSuccess(`Successfully updated ${user.username}'s role to ${role}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      showError(err.message || "Failed to update role");
    } finally {
      setSubmitting(false);
    }
  };

  const isDemotingAdmin = user.role === "admin" && role === "user";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-150 animate-slide-in p-6">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">Change User Role</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 mb-4 text-sm space-y-1">
            <p className="text-slate-600">
              User: <span className="font-semibold text-slate-800">{user.username}</span>
            </p>
            <p className="text-slate-600">
              Current Role:{" "}
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                  user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                }`}
              >
                {user.role}
              </span>
            </p>
          </div>

          <Select
            label="Select New Role"
            options={[
              { value: "user", label: "User (Standard Access)" },
              { value: "admin", label: "Admin (Full Control)" },
            ]}
            value={role}
            onChange={(e) => setRole(e.target.value as "admin" | "user")}
          />

          {isDemotingAdmin && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2.5 text-xs text-amber-900">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <span className="font-semibold">Warning: Demoting an administrator.</span> This user will lose access to all admin dashboards, task creation, and user settings. Ensure there is at least one other active admin in the system.
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Update Role
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
