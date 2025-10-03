import { useContinuel } from "../../lib";
import { useState, useEffect } from "react";
import type { UserData } from "continuel";

/**
 * Example component demonstrating useContinuel hook usage
 * Shows authentication flow and user management
 */
export default function ContinuelExample() {
  const continuel = useContinuel();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [signinForm, setSigninForm] = useState({ username: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    username: "",
    nickname: "",
    password: "",
  });
  const [showSignup, setShowSignup] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const result = await continuel.auth.getUser();
      if (result.success && "user" in result) {
        setUser(result.user);
      }
    } catch (err) {
      setError("Failed to check authentication status");
    } finally {
      setLoading(false);
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await continuel.auth.signin({
        username: signinForm.username,
        password: signinForm.password,
      });

      if (result.success) {
        await checkAuthStatus(); // Refresh user data
        setSigninForm({ username: "", password: "" });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await continuel.auth.signup({
        username: signupForm.username,
        nickname: signupForm.nickname,
        password: signupForm.password,
      });

      if (result.success) {
        // Auto sign in after successful signup
        const signinResult = await continuel.auth.signin({
          username: signupForm.username,
          password: signupForm.password,
        });

        if (signinResult.success) {
          await checkAuthStatus();
          setSignupForm({ username: "", nickname: "", password: "" });
          setShowSignup(false);
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignout = async () => {
    try {
      await continuel.auth.signout();
      setUser(null);
    } catch (err) {
      setError("Sign out failed");
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Convert to WebP first
      const conversionResult = await continuel.utils.convertToWebP(file, {
        quality: 0.8,
        maxWidth: 400,
        maxHeight: 400,
      });

      if (conversionResult.success) {
        // Upload converted image
        const uploadResult = await continuel.auth.uploadProfile(
          conversionResult.webpBlob
        );

        if (uploadResult.success) {
          // Refresh user data to get new profile image
          await checkAuthStatus();
        } else {
          setError(uploadResult.error);
        }
      } else {
        setError(conversionResult.error);
      }
    } catch (err) {
      setError("Image upload failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="continuel-example">
      <h2>Continuel Hook Example</h2>

      {error && (
        <div className="error" style={{ color: "red", marginBottom: "1rem" }}>
          Error: {error}
        </div>
      )}

      {user ? (
        // Authenticated state
        <div className="authenticated">
          <div className="user-info">
            <h3>Welcome, {user.nickname}!</h3>
            <p>Username: {user.username}</p>
            {user.profileImage && (
              <img
                src={user.profileImage}
                alt="Profile"
                style={{ width: "100px", height: "100px", borderRadius: "50%" }}
              />
            )}
          </div>

          <div className="actions">
            <div className="profile-upload">
              <label htmlFor="profile-upload">Update Profile Image:</label>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={loading}
              />
            </div>

            <button onClick={handleSignout} disabled={loading}>
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        // Unauthenticated state
        <div className="unauthenticated">
          {!showSignup ? (
            // Sign in form
            <form onSubmit={handleSignin}>
              <h3>Sign In</h3>
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  value={signinForm.username}
                  onChange={(e) =>
                    setSigninForm({ ...signinForm, username: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={signinForm.password}
                  onChange={(e) =>
                    setSigninForm({ ...signinForm, password: e.target.value })
                  }
                  required
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
              <p>
                Don't have an account?{" "}
                <button type="button" onClick={() => setShowSignup(true)}>
                  Sign Up
                </button>
              </p>
            </form>
          ) : (
            // Sign up form
            <form onSubmit={handleSignup}>
              <h3>Sign Up</h3>
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  value={signupForm.username}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, username: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Nickname"
                  value={signupForm.nickname}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, nickname: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={signupForm.password}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, password: e.target.value })
                  }
                  required
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? "Signing up..." : "Sign Up"}
              </button>
              <p>
                Already have an account?{" "}
                <button type="button" onClick={() => setShowSignup(false)}>
                  Sign In
                </button>
              </p>
            </form>
          )}
        </div>
      )}

      <style jsx>{`
        .continuel-example {
          max-width: 400px;
          margin: 2rem auto;
          padding: 2rem;
          border: 1px solid #ddd;
          border-radius: 8px;
        }

        .loading {
          text-align: center;
          padding: 2rem;
        }

        .user-info {
          margin-bottom: 2rem;
          text-align: center;
        }

        .actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .profile-upload {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        input {
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        button {
          padding: 0.5rem 1rem;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        button[type="button"] {
          background: transparent;
          color: #0070f3;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
