import React, { useState } from "react";
import { Button } from "../Button";
import { deleteUser } from "../../services/userService";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import type { User } from "../../types/auth";

interface DeleteUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({ user, isOpen, onClose, onSuccess }) => {
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  const currentUserId = currentUser?.id || (currentUser as any)?._id;
  const targetUserId = user.id || (user as any)._id;
  const isSelf = currentUserId === targetUserId;

  const handleDelete = async () => {
    if (isSelf) {
      showError("You cannot delete your own admin account");
      return;
    }

    setSubmitting(true);
    try {
      await deleteUser(targetUserId);
      showSuccess(`Successfully deleted user account for ${user.username}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      showError(err.message || "Failed to delete user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-150 animate-slide-in p-6">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">Confirm Account Deletion</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {isSelf ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start space-x-2.5 text-xs text-rose-900">
              <svg className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <span className="font-semibold">Action Blocked:</span> You are currently logged in as this user. You cannot delete your own account. If you wish to delete this account, another administrator must do it.
              </div>
            </div>
          ) : (
            <>
              <div className="bg-rose-50/50 p-3.5 rounded-lg border border-rose-100 text-sm">
                <p className="text-slate-700">
                  Are you absolutely sure you want to delete the user account for{" "}
                  <span className="font-bold text-slate-900">{user.username}</span> ({user.email})?
                </p>
                <p className="text-xs text-rose-800 mt-2 font-medium">
                  Warning: This action is irreversible. All tasks currently assigned to this user will automatically be set to "Unassigned".
                </p>
              </div>

              {user.role === "admin" && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2.5 text-xs text-amber-900">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <span className="font-semibold">Note: Deleting an administrator.</span> Please ensure that other administrative accounts exist to manage the portal.
                  </div>
                </div>
              )}
            </>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              {isSelf ? "Close" : "Cancel"}
            </Button>
            {!isSelf && (
              <Button type="button" variant="danger" onClick={handleDelete} loading={submitting}>
                Delete User
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
