# Code Conventions

## Project Structure

### Standard App Structure
```
voice-clipboard/
├── src/
│   ├── main/              # Electron main process
│   │   ├── __tests__/     # Main process tests
│   │   └── main.ts        # Entry point
│   ├── preload/           # Preload scripts
│   │   └── preload.ts     # IPC bridge
│   └── renderer/          # React application
│       ├── components/     # React components
│       │   ├── __tests__/
│       │   ├── ui/         # shadcn-ui primitives
│       │   └── *.tsx       # Feature components
│       ├── services/       # External API clients
│       │   ├── __tests__/
│       │   └── *.ts        # API service modules
│       ├── utils/          # Utility functions/classes
│       │   ├── __tests__/
│       │   └── *.ts        # Utility modules
│       ├── lib/            # Third-party library configs
│       │   └── utils.ts    # cn() helper for Tailwind
│       ├── types/          # TypeScript type definitions
│       │   └── index.ts    # Shared types
│       ├── App.tsx         # Root component
│       ├── main.tsx        # React entry point
│       └── index.html      # HTML template
├── docs/                  # Project documentation
├── out/                   # Build output
└── node_modules/          # Dependencies
```

### File Organization Principles

**By feature, then by type**:
- `components/` - React components
- `utils/` - Browser API wrappers
- `services/` - External service clients
- `types/` - Type definitions

**Co-located tests**: `__tests__/` folders next to source files

**No deep nesting**: Maximum 2-3 levels in any folder

## Naming Conventions

### Files and Directories

**TypeScript files**: camelCase
```
audioRecorder.ts
clipboard.ts
groqClient.ts
```

**React components**: PascalCase
```
App.tsx
StatusIndicator.tsx
```

**Test files**: Same as source + `.test.ts(x)`
```
audioRecorder.test.ts
StatusIndicator.test.tsx
App.integration.test.tsx
```

**Special suffixes**:
- `.integration.test.tsx` - Integration tests
- `.config.ts` - Configuration files
- `.d.ts` - Type declaration files

### Variables and Functions

**Functions**: camelCase, verb-first
```typescript
function copyToClipboard(text: string): Promise<void>
function transcribeAudio(blob: Blob): Promise<TranscriptionResult>
```

**Classes**: PascalCase
```typescript
class AudioRecorder { }
class HotkeyManager { }
```

**Constants**: UPPER_SNAKE_CASE (for truly constant values)
```typescript
const HOTKEY = "Alt+1";
const API_KEY = process.env.VITE_GROQ_API_KEY;
```

**React hooks**: camelCase with `use` prefix
```typescript
const [status, setStatus] = useState<RecordingState>("idle");
```

**Event handlers**: `handle` prefix
```typescript
const handleHotkeyPress = async () => { /* ... */ };
```

### Types and Interfaces

**Interfaces**: PascalCase, descriptive nouns
```typescript
interface TranscriptionResult {
  text: string;
  duration: number;
}

interface StatusIndicatorProps {
  status: RecordingState;
}
```

**Type aliases**: PascalCase
```typescript
type RecordingState = "idle" | "recording" | "transcribing" | "success" | "error";
```

**Generic types**: Single capital letter or PascalCase
```typescript
type Result<T> = { data: T } | { error: Error };
```

## Import/Export Patterns

### Import Organization

**Order**:
1. External dependencies (React, third-party)
2. Internal absolute imports (using `@/` alias)
3. Relative imports
4. Type-only imports

**Example**:
```typescript
// External
import { useState, useEffect } from "react";
import { Groq } from "groq-sdk";

// Internal (absolute)
import { StatusIndicator } from "@/components/StatusIndicator";
import type { RecordingState } from "@/types";

// Relative
import { AudioRecorder } from "./utils/audioRecorder";
```

### Export Patterns

**Named exports preferred**:
```typescript
export async function copyToClipboard(text: string) { }
export class AudioRecorder { }
```

**Default exports for components**:
```typescript
function App() { }
export default App;
```

**Why**: Named exports enable better IDE autocomplete and refactoring

### Path Aliases

Use `@/` for renderer imports:
```typescript
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/utils/clipboard";
```

**Configured in**:
- `electron.vite.config.ts`: `alias: { "@": "./src/renderer" }`
- `tsconfig.json`: `paths: { "@/*": ["./src/renderer/*"] }`
- `vitest.config.ts`: Same alias for tests

## TypeScript Standards

### Type Annotations

**Function parameters**: Always annotate
```typescript
async function transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
  // ...
}
```

**Return types**: Explicit for exported functions
```typescript
export function isRecording(): boolean {
  return this.isRecordingFlag;
}
```

**Variables**: Infer when obvious, annotate when not
```typescript
const status = "idle";  // Inferred: string
const status: RecordingState = "idle";  // Explicit for union types
```

### Type Safety Patterns

**Strict null checks**: Enabled
```typescript
let recorder: MediaRecorder | null = null;
if (recorder) {
  recorder.stop();  // TypeScript knows it's not null here
}
```

**Error handling**: Use type guards
```typescript
try {
  // ...
} catch (error) {
  if (error instanceof Error) {
    throw error;
  }
  throw new Error("Unknown error");
}
```

**Avoid `any`**: Use `unknown` instead
```typescript
// Bad
function handle(data: any) { }

// Good
function handle(data: unknown) {
  if (typeof data === "string") {
    // TypeScript knows it's a string here
  }
}
```

## React Patterns

### Component Structure

**Functional components only**:
```typescript
function StatusIndicator({ status }: StatusIndicatorProps) {
  return <Badge variant={getVariant(status)} />;
}
```

**Props interface above component**:
```typescript
interface StatusIndicatorProps {
  status: RecordingState;
}

function StatusIndicator({ status }: StatusIndicatorProps) { }
```

### State Management

**useState for local state**:
```typescript
const [status, setStatus] = useState<RecordingState>("idle");
```

**useEffect for side effects**:
```typescript
useEffect(() => {
  // Setup
  hotkeyManager.register(handleHotkeyPress);
  
  // Cleanup
  return () => {
    hotkeyManager.unregister();
  };
}, [hotkeyManager]);  // Dependencies
```

**Custom hooks**: None in this project (simple enough without)

### Event Handlers

**Define outside JSX**:
```typescript
const handleHotkeyPress = async () => {
  // Implementation
};

return <button onClick={handleHotkeyPress}>Record</button>;
```

**Async handlers**: Use async/await
```typescript
const handleClick = async () => {
  try {
    await someAsyncOperation();
  } catch (error) {
    console.error(error);
  }
};
```

## Styling Conventions

### Tailwind CSS

**Utility-first approach**:
```tsx
<div className="flex min-h-screen items-center justify-center p-8">
```

**Use Tailwind classes directly**: No CSS modules or styled-components

**Responsive design**: Mobile-first with breakpoint prefixes
```tsx
<div className="text-sm md:text-base lg:text-lg">
```

**Dark mode**: Using `dark:` prefix
```tsx
<div className="bg-white dark:bg-slate-800">
```

### Component Variants (CVA)

For components with multiple variants, use `class-variance-authority`:

```typescript
const badgeVariants = cva(
  "inline-flex items-center rounded-full",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
    },
  }
);
```

### Class Name Merging

Use `cn()` helper for conditional classes:

```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  props.className
)} />
```

## Error Handling

### Throw vs. Return

**Throw errors** for exceptional cases:
```typescript
if (!navigator.clipboard) {
  throw new Error("Clipboard API not available");
}
```

**Return values** for expected outcomes:
```typescript
function isRecording(): boolean {
  return this.isRecordingFlag;
}
```

### Error Messages

**Be specific**:
```typescript
throw new Error("Clipboard API not available");  // Good
throw new Error("Error");  // Bad
```

**Include context**:
```typescript
throw new Error("GROQ_API_KEY is not set. Please add VITE_GROQ_API_KEY to your .env file");
```

### Try-Catch Placement

**At orchestration layer**:
```typescript
// In App.tsx
try {
  await audioRecorder.startRecording();
  const blob = await audioRecorder.stopRecording();
  const result = await transcribeAudio(blob);
} catch (error) {
  setStatus("error");
}
```

**Not in utility functions** (let errors bubble up):
```typescript
// In clipboard.ts - just throw, don't catch
export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);  // Let errors propagate
}
```

## Documentation

### JSDoc Comments

**All exported functions**:
```typescript
/**
 * Copies text to the system clipboard
 * @param text - The text to copy to clipboard
 * @throws Error if clipboard write fails
 */
export async function copyToClipboard(text: string): Promise<void> { }
```

**Classes and methods**:
```typescript
/**
 * AudioRecorder handles audio recording using MediaRecorder API
 */
export class AudioRecorder {
  /**
   * Starts recording audio from the user's microphone
   * @throws Error if permission is denied or microphone is unavailable
   */
  async startRecording(): Promise<void> { }
}
```

**Inline comments**: Only when necessary to explain "why", not "what"
```typescript
// Use m4a codec if available, fallback to default
const options = { mimeType: "audio/mp4" };
```

### README Documentation

Keep README up-to-date with:
- Installation steps
- Environment setup
- Development commands
- Project structure overview

