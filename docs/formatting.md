# Formatting Standards

## Language and Toolchain

### TypeScript Version
- **Version**: 5.3.3
- **Target**: ES2020
- **Module**: ESNext
- **Strict mode**: Enabled

### Node.js Version
- **Minimum**: 18.x
- **Recommended**: Latest LTS

### Package Manager
- **Primary**: npm (package-lock.json present)
- Alternative: yarn/pnpm compatible

## Code Formatting

### Prettier Configuration

**Basic Rules**:
- **Indentation**: 2 spaces
- **Quotes**: Double quotes for strings
- **Semicolons**: Always include
- **Trailing commas**: ES5 (objects, arrays)
- **Line width**: 80 characters (soft limit)
- **Arrow function parens**: Always

**Configuration** (implicit from existing code):
```json
{
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": false,
  "trailingComma": "es5",
  "printWidth": 80,
  "arrowParens": "always"
}
```

### Indentation

**2 spaces for all files**:
```typescript
function example() {
  if (condition) {
    doSomething();
  }
}
```

**JSX indentation**:
```tsx
<div>
  <Component
    prop1="value"
    prop2="value"
  />
</div>
```

**Nested objects and arrays**:
```typescript
const config = {
  key: "value",
  nested: {
    key: "value",
  },
};
```

### Line Length

**Soft limit**: 80 characters
- Break long lines for readability
- Not strictly enforced (some lines exceed for clarity)

**When to break**:
```typescript
// Break function arguments
function longFunctionName(
  firstParameter: string,
  secondParameter: number,
  thirdParameter: boolean
): ReturnType {
  // ...
}

// Break JSX attributes
<Component
  longPropertyName="value"
  anotherLongProperty="value"
  onClick={handleClick}
/>

// Break chained methods
someObject
  .method1()
  .method2()
  .method3();
```

## Import Organization

### Grouping and Ordering

**Four groups** (separated by blank lines):
1. External dependencies
2. Internal absolute imports (`@/`)
3. Relative imports
4. Type-only imports

**Example**:
```typescript
// Group 1: External
import { useState, useEffect } from "react";
import { Groq } from "groq-sdk";

// Group 2: Internal absolute
import { StatusIndicator } from "@/components/StatusIndicator";
import { copyToClipboard } from "@/utils/clipboard";

// Group 3: Relative
import { AudioRecorder } from "./utils/audioRecorder";
import "./styles.css";

// Group 4: Types
import type { RecordingState } from "@/types";
```

### Import Sorting

**Within each group**:
- Alphabetical order (not strictly enforced)
- Destructured imports: `{ a, b, c }` - alphabetical

**Multiple imports from same source**:
```typescript
// Combine into one line
import { useState, useEffect, useCallback } from "react";

// Not separate lines
import { useState } from "react";
import { useEffect } from "react";
```

### Type Imports

**Use `import type` for type-only imports**:
```typescript
import type { RecordingState, TranscriptionResult } from "@/types";
```

**Inline type imports** (when mixed with values):
```typescript
import { someFunction, type SomeType } from "./module";
```

## ESLint Configuration

### Rules Enforced

**TypeScript-specific**:
- `@typescript-eslint/no-unused-vars`: Error
- `@typescript-eslint/explicit-function-return-type`: Off (inferred)
- `@typescript-eslint/no-explicit-any`: Warn

**React-specific**:
- `react-hooks/rules-of-hooks`: Error
- `react-hooks/exhaustive-deps`: Warn
- `react-refresh/only-export-components`: Warn

**General**:
- `no-console`: Off (allowed for debugging)
- `no-debugger`: Error in production

### ESLint Disable Comments

**Acceptable use cases**:
```typescript
// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  // Intentionally omit dependency
}, []);
```

**Avoid broad disables**:
```typescript
// Bad - disables for entire file
/* eslint-disable */

// Good - specific rule, specific line
// eslint-disable-next-line no-console
console.log("Debug info");
```

## TypeScript Formatting

### Type Annotations

**Space after colon**:
```typescript
function example(param: string): void { }
const value: number = 42;
```

**No space before colon**:
```typescript
// Good
function example(param: string): void { }

// Bad
function example(param : string) : void { }
```

### Generics

**No space before angle bracket**:
```typescript
// Good
Promise<string>
Array<number>
useState<RecordingState>("idle")

// Bad
Promise <string>
Array <number>
```

### Union Types

**Space around pipe**:
```typescript
type State = "idle" | "recording" | "transcribing";
```

**Break long unions**:
```typescript
type LongUnion =
  | "option1"
  | "option2"
  | "option3"
  | "option4";
```

### Interface Formatting

**Multiline preferred**:
```typescript
interface Props {
  prop1: string;
  prop2: number;
  prop3?: boolean;
}
```

**Optional properties**: `?` before colon
```typescript
interface Config {
  required: string;
  optional?: string;
}
```

## JSX Formatting

### Component Structure

**Self-closing tags**:
```tsx
// Use self-closing when no children
<Component />

// Not
<Component></Component>
```

**Multiline props**:
```tsx
// Single prop - inline
<Component prop="value" />

// Multiple props - one per line
<Component
  prop1="value"
  prop2="value"
  onClick={handleClick}
/>
```

### Curly Braces

**Strings don't need braces**:
```tsx
<Component text="string" />  // Good
<Component text={"string"} />  // Unnecessary
```

**Numbers, booleans, objects need braces**:
```tsx
<Component count={42} enabled={true} style={{ margin: 0 }} />
```

### Conditional Rendering

**Short-circuit for simple cases**:
```tsx
{status === "success" && <SuccessMessage />}
```

**Ternary for if-else**:
```tsx
{isLoading ? <Spinner /> : <Content />}
```

**Extract complex logic**:
```tsx
const renderStatus = () => {
  if (error) return <Error />;
  if (loading) return <Loading />;
  return <Content />;
};

return <div>{renderStatus()}</div>;
```

### className Formatting

**Short classes - inline**:
```tsx
<div className="flex gap-4 p-8" />
```

**Long classes - template literal**:
```tsx
<div
  className="flex min-h-screen items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-slate-100"
/>
```

**Conditional classes - use cn()**:
```tsx
<div
  className={cn(
    "base-class",
    isActive && "active-class",
    props.className
  )}
/>
```

## Comments

### When to Comment

**Do comment**:
- Complex logic or algorithms
- Non-obvious workarounds
- "Why" something is done a certain way
- TODOs with context

**Don't comment**:
- Obvious code (code should be self-documenting)
- Outdated information
- Commented-out code (use git history)

### Comment Style

**Single-line**:
```typescript
// This is a single-line comment
const value = 42;
```

**Multi-line**:
```typescript
/*
 * This is a multi-line comment
 * explaining complex logic
 */
```

**JSDoc**:
```typescript
/**
 * Function description
 * @param param - Parameter description
 * @returns Return value description
 */
function example(param: string): number {
  // Implementation
}
```

### TODO Comments

**Include context and owner**:
```typescript
// TODO: Add audio playback feature
// TODO(@username): Fix edge case with empty recordings
```

## File Formatting

### File Structure

**Order within files**:
1. Imports
2. Type definitions
3. Constants
4. Helper functions
5. Main export (component/class/function)

**Example**:
```typescript
// Imports
import { useState } from "react";
import type { Props } from "./types";

// Constants
const DEFAULT_VALUE = "idle";

// Helper functions
function formatDuration(seconds: number): string { }

// Main export
export function Component({ prop }: Props) { }
```

### Blank Lines

**Use blank lines to separate**:
- Import groups
- Functions
- Logical sections within functions

**Example**:
```typescript
import { a } from "a";

import { b } from "./b";

export function example() {
  const value1 = compute1();
  const value2 = compute2();

  if (condition) {
    doSomething();
  }

  return result;
}
```

### File Endings

**Always end with newline**:
- Configured in Prettier
- Ensures clean git diffs

## Running Formatters

### Manual Commands

```bash
# Check formatting
npm run lint

# Fix formatting
npm run format

# Auto-fix ESLint issues
npm run lint -- --fix
```

### IDE Integration

**Recommended VSCode settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Pre-commit Hooks

**Not currently configured** - Consider adding:
- `husky` for git hooks
- `lint-staged` to format only changed files

## Exceptions and Special Cases

### Long Strings

**URLs and error messages can exceed line length**:
```typescript
const url = "https://very-long-url.com/with/many/path/segments";
throw new Error("This is a long error message that exceeds the line length but is kept on one line for clarity");
```

### Regex Patterns

**Can be long and complex**:
```typescript
const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
```

### Test Data

**Test data can break conventions for clarity**:
```typescript
const testCases = [
  { input: "test1", expected: "result1" },
  { input: "verylonginputstringthatexceedslinelength", expected: "result2" },
];
```

