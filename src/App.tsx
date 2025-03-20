import React, { useState, useEffect } from "react";
import { auth, provider, signInWithPopup, signOut } from "./firebase";

export default function UserManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const API_URL = "http://localhost:3000/users"; // Change as needed

  useEffect(() => {
    if (user) getUsers();
  }, [user]);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setUsers([]);
  };

  const getUsers = async () => {
    try {
      setLoading(true);
      const token = await user!.getIdToken();
      const response = await fetch(API_URL, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const addUser = async () => {
    if (!name || !email) return alert("Enter name and email!");
    try {
      setLoading(true);
      const token = await user!.getIdToken();
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });
      const data = await response.json();
      alert("User added successfully!");
      setUsers([...users, data.user]);
      setName("");
      setEmail("");
    } catch (error) {
      console.error("Error adding user:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, newName: string, newEmail: string) => {
    if (!id || !newName || !newEmail) return alert("Enter name and email!");
    try {
      setLoading(true);
      const token = await user!.getIdToken();
      await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName, email: newEmail }),
      });
      alert("User updated successfully!");
      setUsers(
        users.map((user) =>
          user.id === id ? { ...user, name: newName, email: newEmail } : user
        )
      );
      setEditingUserId(null);
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!id) return;
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (!confirmDelete) return;
    try {
      setLoading(true);
      const token = await user!.getIdToken();
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("User deleted successfully!");
      setUsers(users.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      {user ? (
        <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex flex-row justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">User Management Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>

          {/* Add User */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 w-full rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 w-full rounded"
            />
            <button
              onClick={addUser}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add
            </button>
          </div>

          {/* Users Table */}
          <h2 className="text-lg font-semibold mb-2">User List</h2>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <table className="w-full border-collapse bg-white shadow-sm">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b">
                    {editingUserId === user.id ? (
                      <>
                        <td className="p-2">
                          <input
                            type="text"
                            value={user.name}
                            onChange={(e) =>
                              setUsers(
                                users.map((u) =>
                                  u.id === user.id
                                    ? { ...u, name: e.target.value }
                                    : u
                                )
                              )
                            }
                            className="border p-1 w-full"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="email"
                            value={user.email}
                            onChange={(e) =>
                              setUsers(
                                users.map((u) =>
                                  u.id === user.id
                                    ? { ...u, email: e.target.value }
                                    : u
                                )
                              )
                            }
                            className="border p-1 w-full"
                          />
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-2">{user.name}</td>
                        <td className="p-2">{user.email}</td>
                      </>
                    )}
                    <td className="p-2 flex gap-2">
                      {editingUserId === user.id ? (
                        <>
                          <button
                            className="bg-green-500 text-white px-3 py-1 rounded"
                            onClick={() =>
                              updateUser(user.id, user.name, user.email)
                            }
                          >
                            Save
                          </button>
                          <button
                            className="bg-gray-500 text-white px-3 py-1 rounded"
                            onClick={() => setEditingUserId(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          className="bg-yellow-500 text-white px-3 py-1 rounded"
                          onClick={() => setEditingUserId(user.id)}
                        >
                          Edit
                        </button>
                      )}
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded"
                        onClick={() => deleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex flex-row justify-between items-center mb-4">
            <p>NOT LOGGED IN </p>
            <button
              onClick={handleLogin}
              className="bg-blue-600 text-white px-6 py-3 rounded text-lg"
            >
              Login with Google
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
