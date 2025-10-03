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

// Create a new instance
const continuel = new Continuel("https://api.example.com");

// Use the library
console.log(continuel.baseUrl);
```

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
