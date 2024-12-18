import React, { useRef, useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";

export default function Signup() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const nameRef = useRef(); // New ref for name
  const { signup } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  async function handleSubmit(e) {
    e.preventDefault();

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError("Passwords do not match");
    }

    try {
      setError("");
      setLoading(true);

      // Sign up the user with Firebase Authentication
      const userCredential = await signup(emailRef.current.value, passwordRef.current.value);
      const user = userCredential.user; // Firebase user object
      const uid = user.uid; // Get the UID of the newly created user

      // Update the user's profile with their name
      await user.updateProfile({
        displayName: nameRef.current.value, // Set the user's name
      });

      // Optionally: Send UID and name to your server
      await fetch("http://hm.oznepalservices.com.au/api/register/", {
        method: "POST",
        body: JSON.stringify({
          user: uid, // Pass the UID here
          name: nameRef.current.value, // Include the user's name
          token: "dummy_token", // Using dummy token
          status: "login",
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });

      history.push("/");
    } catch (err) {
      setError("Failed to create an account");
      console.error(err);
    }

    setLoading(false);
  }

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Sign Up</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="name">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" ref={nameRef} required />
            </Form.Group>
            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" ref={emailRef} required />
            </Form.Group>
            <Form.Group id="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" ref={passwordRef} required />
            </Form.Group>
            <Form.Group id="password-confirm">
              <Form.Label>Password Confirmation</Form.Label>
              <Form.Control type="password" ref={passwordConfirmRef} required />
            </Form.Group>
            <Button disabled={loading} className="w-100" type="submit">
              Sign Up
            </Button>
          </Form>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        Already have an account? <Link to="/login">Log In</Link>
      </div>
    </>
  );
}
