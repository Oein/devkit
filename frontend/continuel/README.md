# continuel

A TypeScript library built with Bun for high-performance JavaScript runtime.

## Installation

```bash
npm install continuel
# or
yarn add continuel
# or
pnpm add continuel
# or
bun add continuel
```

## Usage

```typescript
import Continuel from "continuel";
import type { ImageConversionOptions } from "continuel";

// Create a new instance
const continuel = new Continuel("https://api.example.com");

// Authentication example
const signinResult = await continuel.auth.signin({
  username: "john_doe",
  password: "secure_password",
});

if (signinResult.success) {
  console.log("Successfully signed in!");
}

// Image conversion example
const fileInput = document.getElementById("imageInput") as HTMLInputElement;
const file = fileInput.files?.[0];

if (file) {
  const options: ImageConversionOptions = {
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
  };

  const result = await continuel.utils.convertToWebP(file, options);

  if (result.success) {
    console.log(
      `Converted! Original: ${result.originalSize} bytes, Compressed: ${result.compressedSize} bytes`
    );
    console.log(
      `Compression ratio: ${(result.compressionRatio * 100).toFixed(1)}%`
    );

    // Download the converted image
    continuel.utils.downloadWebP(result.webpBlob, "converted-image.webp");
  } else {
    console.error("Conversion failed:", result.error);
  }
}
```

## Features

### Authentication

- **signin**: Authenticate existing users
- **signout**: Sign out current user
- **signup**: Create new user accounts
- **getUser**: Get current user information
- **deleteUser**: Delete current user account
- **uploadProfile**: Upload profile images

### Image Utilities

- **convertToWebP**: Convert images (File, Blob, or URL) to WebP format
- **convertMultipleToWebP**: Batch convert multiple images
- **checkWebPSupport**: Check if browser supports WebP
- **downloadWebP**: Create download link for WebP images
- **getOptimalQuality**: Get recommended quality based on image size

### Image Conversion Options

- `quality`: Compression quality (0-1, default 0.8)
- `maxWidth`: Maximum width for resizing
- `maxHeight`: Maximum height for resizing

## Development

To install dependencies:

```bash
bun install
```

To build the library:

```bash
bun run build
```

To run in development mode:

```bash
bun run dev
```

To clean build artifacts:

```bash
bun run clean
```

## Building

This project uses Bun for building and bundling. The build process:

1. **Bundle**: Creates optimized JavaScript bundle using Bun's fast bundler
2. **Types**: Generates TypeScript declaration files using tsc
3. **Output**: Places all artifacts in the `dist/` directory

## Publishing

To publish to npm:

```bash
npm publish
```

The `prepublishOnly` script will automatically clean and rebuild the project before publishing.

## License

MIT
