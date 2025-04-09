"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Dialog } from "@headlessui/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"; // Fallback URL

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching users from:", `${API_URL}/api/users`);
      console.log("Fetching spending from:", `${API_URL}/api/users/spending-summary`);

      const [userRes, spendingRes] = await Promise.all([
        fetch(`${API_URL}/api/users`),
        fetch(`${API_URL}/api/users/spending-summary`)
      ]);

      // Check if responses are OK
      if (!userRes.ok) throw new Error(`Users fetch failed with status ${userRes.status}`);
      if (!spendingRes.ok) throw new Error(`Spending fetch failed with status ${spendingRes.status}`);

      const usersData = await userRes.json();
      const spendingData = await spendingRes.json();

      console.log("Users data:", usersData);
      console.log("Spending data:", spendingData);

      // Validate data structure
      if (!Array.isArray(usersData)) throw new Error("Users data is not an array");
      if (!Array.isArray(spendingData)) throw new Error("Spending data is not an array");

      const spendingMap = spendingData.reduce((acc, entry) => {
        acc[entry._id] = entry.totalSpent || 0;
        return acc;
      }, {});

      const enrichedUsers = usersData.map((user) => ({
        ...user,
        totalSpent: spendingMap[user._id] || 0,
        createdAt: user.createdAt || new Date().toISOString() // Fallback for missing date
      }));

      setUsers(enrichedUsers);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err.message);
      toast.error(`Failed to fetch users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteUser = (userId) => {
    setConfirmDeleteId(userId);
  };

  const handleDelete = async () => {
    const userId = confirmDeleteId;
    if (!userId) return;

    try {
      const res = await fetch(`${API_URL}/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to delete user");
      }

      toast.success("User deleted successfully");
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error(err.message || "Failed to delete user");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const refreshUsers = () => {
    fetchUsers();
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
        <h2 className="text-xl sm:text-2xl font-bold">Manage Users</h2>
        <button
          onClick={refreshUsers}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm sm:text-base"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">There are currently no users in the system.</p>
          <div className="mt-6">
            <button
              onClick={refreshUsers}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Name
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Email
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Signup Date
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Total Spent
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 text-xs sm:text-sm">
                              {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="ml-2 sm:ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.fullName || "N/A"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="truncate max-w-[120px] sm:max-w-none inline-block">
                          {user.email}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₦{user.totalSpent?.toLocaleString() || '0'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <a
                          href={`mailto:${user.email}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Email
                        </a>
                        <button
                          onClick={() => confirmDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-xl bg-white p-6">
            <Dialog.Title className="text-lg font-bold text-gray-900">Confirm Deletion</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-600">
              This action cannot be undone. This will permanently delete the user account.
            </Dialog.Description>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete User
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}