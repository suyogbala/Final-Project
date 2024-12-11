import React, { useState, useEffect } from "react";
import { Card, Button, Form, Modal, ListGroup, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext"; // Import authentication context
import { useHistory } from "react-router-dom";

export default function Dashboard() {
  const { logout, currentUser } = useAuth(); // Get logout function and current user UID from the context
  const history = useHistory(); // To navigate to other pages
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [newURL, setNewURL] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);


  // Fetch products from the server
  const fetchProducts = async () => {
    const apiUrl =
      "http://hm.oznepalservices.com.au/api/products/?user=" +
      currentUser.uid; // Use the current user's UID

    try {
      const response = await fetch(apiUrl);
      if (response.status === 200) {
        const jsonResponse = await response.json();
        setItems(jsonResponse); // Set the items fetched from the server
      } else {
        throw new Error("Failed to load products.");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddItem = async () => {
    if (newURL && targetPrice) {
      try {
        // Prepare the data to send to the server
        const apiUrl = "http://hm.oznepalservices.com.au/api/scrape/";
        const postData = {
          url: newURL,
          user: currentUser.uid, // Use current user's UID
          price: targetPrice,
        };

        console.log("Sending data to server:", postData);

        // Send data to the server
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        });

        // Log the response
        const responseData = await response.json();
        console.log("Server response:", responseData);

        if (!response.ok) {
          throw new Error(responseData.message || "Failed to send data to the server.");
        }

        // If successful, refresh the product list
        fetchProducts();
        setNewURL("");
        setTargetPrice("");
        setShowModal(false);
      } catch (err) {
        console.error("Error adding product:", err);
        setError("Failed to add product. Please try again.");
      }
    } else {
      setError("All fields are required.");
    }
  };

  const handleDeleteItem = (index) => {
    setItemToDelete(index);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    const apiUrl = "http://hm.oznepalservices.com.au/api/products/delete/";
  
    if (itemToDelete !== null) {
      const product = items[itemToDelete]; // Get the product to delete
      const deleteData = { id: product.id.toString() }; // Prepare the payload
  
      try {
        // Send the delete request to the server
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(deleteData),
        });
  
        if (response.status === 200) {
          console.log(`Product with ID ${product.id} deleted successfully`);
          setItems(items.filter((_, itemIndex) => itemIndex !== itemToDelete)); // Update the local state
        } else {
          console.error(
            `Failed to delete product: ${response.status} ${response.statusText}`
          );
          setError("Failed to delete the product from the server.");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        setError("An error occurred while deleting the product.");
      }
  
      setShowDeleteConfirm(false); // Close the confirmation modal
    }
  };
  

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleLogout = async () => {
    setError(""); // Reset any previous error
    try {
      await logout(); // Call the logout function
      history.push("/login"); // Redirect to login page
    } catch {
      setError("Failed to log out");
    }
  };
  const confirmLogout = async () => {
    setError(""); // Reset any previous error
    try {
      await logout(); // Call the logout function
      history.push("/login"); // Redirect to login page
    } catch {
      setError("Failed to log out");
    } finally {
      setShowLogoutConfirm(false); // Close the confirmation modal
    }
  };
  
  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };
  

  return (
    <div>
       {/* Greeting Section */}
        <div style={{ textAlign: "center", padding: "10px" }}>
          {/* User Profile Picture */}
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              currentUser.displayName || "User"
            )}&background=random`}
            alt="User Profile"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: "10px",
            }}
          />
          {/* Greeting Message */}
          {currentUser.displayName && (
            <p style={{ fontSize: "25px", fontWeight: "bold" }}>{currentUser.displayName}</p>
          )}
        </div>
      {/* Logout Button */}
      <div style={{ textAlign: "right", padding: "10px" }}>
        {error && <Alert variant="danger">{error}</Alert>}
        <Button variant="danger" onClick={() => setShowLogoutConfirm(true)}>
          Logout
        </Button>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal show={showLogoutConfirm} onHide={cancelLogout}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to log out?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelLogout}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmLogout}>
            Logout
          </Button>
        </Modal.Footer>
      </Modal>


      {/* List of items */}
      <h3 className="text-center mb-4">Product List</h3>

      <div
        style={{
          maxHeight: "600px",
          width:"100%",
          overflowY: "scroll",
          border: "1px solid #ddd",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          padding: "10px",
        }}
      >
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center">No products found.</div>
        ) : (
          <ListGroup>
          {items.map((item, index) => (
            <ListGroup.Item
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* Left Section: Image and Product Info */}
              <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: "60px",
                    height: "60px",
                    objectFit: "cover",
                    borderRadius: "5px",
                    marginRight: "15px",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <strong>{item.name}</strong> <br />
                  <span style={{ display: "flex", justifyContent: "space-between", maxWidth: "300px" }}>
                    <span>Current Price:</span>
                    <span>${parseFloat(item.current_price.slice(1)).toFixed(2)}</span>
                  </span>
                  <span style={{ display: "flex", justifyContent: "space-between", maxWidth: "300px" }}>
                    <span>Target Price:</span>
                    <span>${parseFloat(item.target_price).toFixed(2)}</span>
                  </span>
                </div>
              </div>
        
              {/* Right Section: Buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => window.open(item.url, "_blank")}
                >
                  Visit Site
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteItem(index)}
                >
                  Delete
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
        )}
      </div>

      {/* Add Item Button */}
      <div style={{ position: "fixed", bottom: "20px", right: "20px" }}>
        <Button
          variant="primary"
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            fontSize: "30px",
          }}
          onClick={() => setShowModal(true)}
        >
          +
        </Button>
      </div>

      {/* Modal for adding new item */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Product URL</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter product URL"
                value={newURL}
                onChange={(e) => setNewURL(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Target Price</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter target price"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddItem}>
            Add Product
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Confirmation Modal for Deleting Product */}
      <Modal show={showDeleteConfirm} onHide={cancelDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this product? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}