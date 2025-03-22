import React, { useState, useEffect } from "react";
import { auth, getAccessToken, loginWithGoogle, logout } from "./firebase";
import {
  Container,
  Button,
  Table,
  Form,
  Spinner,
  Alert,
  Card,
} from "react-bootstrap";

export default function UserManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const [message, setMessage] = useState<string | null>(null);
  const API_URL = "http://localhost:3000/users"; // Update API endpoint as needed

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await getUsers();
      } else {
        setUser(null);
        setUsers([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setUsers([]);
    setMessage("Logged out successfully.");
  };

  const handleLogin = async () => {
    try {
      const result = await loginWithGoogle();
      if (result) {
        setUser(result.user);
        setMessage("Logged in successfully.");
        await getUsers();
      }
    } catch (error) {
      setMessage("Login failed. Please try again.");
      console.error("Login Error:", error);
    }
  };

  const getUsers = async () => {
    try {
      setLoading(true);
      const token = await getAccessToken();
      const response = await fetch(API_URL, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      setMessage("Error fetching users.");
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const addUser = async () => {
    if (!name || !email) {
      setMessage("Enter name and email!");
      return;
    }
    try {
      setLoading(true);
      const token = await getAccessToken();
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });
      const data = await response.json();
      setUsers([...users, data.user]);
      setName("");
      setEmail("");
      setMessage("User added successfully!");
    } catch (error) {
      setMessage("Error adding user.");
      console.error("Error adding user:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (
    id: string,
    updatedName: string,
    updatedEmail: string
  ) => {
    if (!id || !updatedName || !updatedEmail) {
      setMessage("Enter name and email!");
      return;
    }
    try {
      setLoading(true);
      const token = await user!.getIdToken();
      await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: updatedName, email: updatedEmail }),
      });

      setUsers(
        users.map((u) =>
          u.id === id ? { ...u, name: updatedName, email: updatedEmail } : u
        )
      );
      setEditingUserId(null);
      setMessage("User updated successfully!");
    } catch (error) {
      setMessage("Error updating user.");
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
      const token = await getAccessToken();
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(users.filter((u) => u.id !== id));
      setMessage("User deleted successfully!");
    } catch (error) {
      setMessage("Error deleting user.");
      console.error("Error deleting user:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      className="py-4 d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      {user ? (
        <Card
          className="shadow-lg p-4 bg-white rounded w-100"
          style={{ maxWidth: "800px" }}
        >
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2>User Management</h2>
              <Button variant="danger" onClick={handleLogout}>
                Logout
              </Button>
            </div>

            {message && <Alert variant="info">{message}</Alert>}

            <Form className="d-flex gap-2 mb-3">
              <Form.Control
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Form.Control
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button variant="primary" onClick={addUser}>
                Add
              </Button>
            </Form>

            <h4>User List</h4>
            {loading ? (
              <Spinner animation="border" />
            ) : users.length === 0 ? (
              <Alert variant="warning">No users found!</Alert>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      {editingUserId === user.id ? (
                        <>
                          <td>
                            <Form.Control
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
                            />
                          </td>
                          <td>
                            <Form.Control
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
                            />
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                        </>
                      )}
                      <td className="d-flex gap-2">
                        {editingUserId === user.id ? (
                          <>
                            <Button
                              variant="success"
                              onClick={() =>
                                updateUser(user.id, user.name, user.email)
                              }
                            >
                              Save
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() => setEditingUserId(null)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="warning"
                            onClick={() => setEditingUserId(user.id)}
                          >
                            Edit
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          onClick={() => deleteUser(user.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Card
          className="shadow-lg p-4 bg-white rounded text-center"
          style={{ width: "350px" }}
        >
          <Card.Body>
            <h2>🚀 FuelBuddy Login</h2>
            <Button variant="primary" onClick={handleLogin} className="w-100">
              Login with Google
            </Button>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}
