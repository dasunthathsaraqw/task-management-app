import React from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";
import { Card } from "../components/Card";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <Button variant="danger" onClick={logout}>
            Logout
          </Button>
        </div>

        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Welcome, {user?.username}!
          </h2>
          <div className="space-y-2 text-gray-700">
            <p>
              <span className="font-medium">Email:</span> {user?.email}
            </p>
            <p>
              <span className="font-medium">Role:</span>{" "}
              <span
                className={`px-2 py-1 rounded text-sm ${
                  user?.role === "admin"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {user?.role}
              </span>
            </p>
            <p>
              <span className="font-medium">User ID:</span> {user?.id}
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-2">Your Role</h3>
            {user?.role === "admin" ? (
              <p className="text-gray-600">
                You have admin access. You can view and manage all tasks.
              </p>
            ) : (
              <p className="text-gray-600">
                You have user access. You can view and manage your own tasks.
              </p>
            )}
          </Card>
          <Card>
            <h3 className="font-semibold text-gray-900 mb-2">Quick Stats</h3>
            <div className="space-y-2 text-gray-600">
              <p>Total Tasks: 0</p>
              <p>Open Tasks: 0</p>
              <p>Completed: 0</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
