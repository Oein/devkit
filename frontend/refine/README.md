# Refine

Refine is a Nextjs-based framework for building prototypes quickly and efficiently.

## Before use

It uses `continuel` as a peer dependency, so you need to build it first.

```bash
cd frontend/continuel
bun install
bun run build
```

## Getting Started

```bash
bun install
bun run dev
```

## Environment Variables

Create a `.env.local` file based on `.env.sample`:

```bash
BACKEND_URL=http://localhost:4000
```

## Using the Continuel Hook

The `useContinuel` hook provides access to the Continuel client through React context. You must wrap your app with `ContinuelProvider`.

### Setup with Context Provider

First, wrap your app with the provider:

```tsx
// _app.tsx
import { ContinuelProvider } from "../lib";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ContinuelProvider baseUrl={process.env.NEXT_PUBLIC_BACKEND_URL}>
      <Component {...pageProps} />
    </ContinuelProvider>
  );
}
```

### Basic Usage

```tsx
// components/LoginForm.tsx
import { useContinuel } from "../lib";

function LoginForm() {
  const continuel = useContinuel();

  const handleSignin = async () => {
    const result = await continuel.auth.signin({
      username: "john_doe",
      password: "password123",
    });

    if (result.success) {
      console.log("Successfully signed in!");
    } else {
      console.error("Signin failed:", result.error);
    }
  };

  return <button onClick={handleSignin}>Sign In</button>;
}
```

### Advanced Usage Examples

### Advanced Usage Examples

#### Authentication Flow

```tsx
import { useContinuel } from "../lib";
import { useState, useEffect } from "react";

function AuthExample() {
  const continuel = useContinuel();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const result = await continuel.auth.getUser();
      if (result.success && "user" in result) {
        setUser(result.user);
      }
      setLoading(false);
    };

    checkAuth();
  }, [continuel]);

  const handleSignOut = async () => {
    await continuel.auth.signout();
    setUser(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.nickname}!</p>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      ) : (
        <div>Please sign in</div>
      )}
    </div>
  );
}
```

#### Image Upload and Conversion

```tsx
import { useContinuel } from "../lib";
import { useState } from "react";

function ImageUploadExample() {
  const continuel = useContinuel();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setConverting(true);

    // Convert to WebP first
    const conversionResult = await continuel.utils.convertToWebP(selectedFile, {
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 600,
    });

    if (conversionResult.success) {
      // Upload converted image
      const uploadResult = await continuel.auth.uploadProfile(
        conversionResult.webpBlob
      );

      if (uploadResult.success) {
        console.log("Profile uploaded:", uploadResult.profileImage);
      } else {
        console.error("Upload failed:", uploadResult.error);
      }
    } else {
      console.error("Conversion failed:", conversionResult.error);
    }

    setConverting(false);
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileSelect} />
      <button onClick={handleUpload} disabled={!selectedFile || converting}>
        {converting ? "Converting & Uploading..." : "Upload Profile Image"}
      </button>
    </div>
  );
}
```

### Available Hooks

- `useContinuel()` - Main hook for accessing Continuel instance (requires ContinuelProvider)
- `useContinuelContext()` - Alias for useContinuel (deprecated, use useContinuel instead)

### Features

The shared Continuel instance provides:

- **Authentication**: signin, signout, signup, getUser, deleteUser, uploadProfile
- **Image Utilities**: convertToWebP, batch conversion, WebP support detection
- **Context-based**: Clean React context pattern with proper provider setup
- **Environment Configuration**: Automatic URL detection from environment variables
- **TypeScript Support**: Full type safety with comprehensive interfaces
