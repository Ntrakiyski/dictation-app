# Testing Guide

## Test Structure

### Test Organization
Tests are co-located with source files in `__tests__/` directories:

```
src/renderer/
├── utils/
│   ├── __tests__/
│   │   ├── audioRecorder.test.ts
│   │   ├── clipboard.test.ts
│   │   └── hotkeyManager.test.ts
│   ├── audioRecorder.ts
│   ├── clipboard.ts
│   └── hotkeyManager.ts
├── services/
│   ├── __tests__/
│   │   └── groqClient.test.ts
│   └── groqClient.ts
└── components/
    ├── __tests__/
    │   └── StatusIndicator.test.tsx
    └── StatusIndicator.tsx
```

**Why co-located**: Easy to find tests, encourages writing them, clear 1:1 mapping

## Test Types

### 1. Unit Tests
Test individual functions or class methods in isolation.

**Example**: `clipboard.test.ts`
```typescript
it("should copy text to clipboard successfully", async () => {
  const text = "test text";
  await copyToClipboard(text);
  expect(mockWriteText).toHaveBeenCalledWith(text);
});
```

**Characteristics**:
- Fast execution
- Focused on single responsibility
- Mock all external dependencies
- Test edge cases (empty strings, long text, special characters)

### 2. Integration Tests
Test complete workflows across multiple modules.

**Example**: `App.integration.test.tsx`
```typescript
it("should handle full workflow: record → transcribe → copy", async () => {
  // Tests AudioRecorder + groqClient + clipboard together
});
```

**Characteristics**:
- Test realistic user scenarios
- Verify data flows between modules
- Mock only external services (APIs)
- Slower than unit tests

### 3. Component Tests
Test React components with user interactions.

**Example**: `StatusIndicator.test.tsx`
```typescript
it("should display correct status badge", () => {
  render(<StatusIndicator status="recording" />);
  expect(screen.getByText("Recording...")).toBeInTheDocument();
});
```

**Characteristics**:
- Use @testing-library/react
- Test rendered output and user events
- Focus on user-visible behavior

## Fixtures and Mocking

### Global Test Setup (`src/test/setup.ts`)

All browser and Electron APIs are mocked globally:

```typescript
// Electron IPC
global.electron = {
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
    removeAllListeners: vi.fn(),
  },
};

// Browser APIs
global.MediaRecorder = vi.fn().mockImplementation(/* ... */);
global.navigator.mediaDevices.getUserMedia = vi.fn();
```

**Why**: These APIs aren't available in jsdom test environment

### Module-Level Mocks

For external services, mock at the module level:

```typescript
// In test file
vi.mock("../services/groqClient");
vi.mocked(transcribeAudio).mockResolvedValue({
  text: "transcribed text",
  duration: 1.26,
});
```

**Pattern**: 
1. `vi.mock()` at top of test file
2. `vi.mocked()` to configure return values
3. `vi.clearAllMocks()` in `beforeEach()`

### Test Data Patterns

**Audio Blobs**:
```typescript
const audioBlob = new Blob(["audio data"], { type: "audio/mp4" });
```

**Transcription Results**:
```typescript
const mockResult: TranscriptionResult = {
  text: "Hello world",
  duration: 2.5,
};
```

**Keep test data**:
- Realistic (valid formats)
- Minimal (only necessary fields)
- Readable (use descriptive values)

## Running Tests

### Commands
```bash
npm run test:unit      # Run once, exit
npm run test:watch     # Watch mode, re-run on changes
npm run test:coverage  # Generate coverage report
```

### Watch Mode Tips
- Tests re-run when files change
- Press `a` to run all tests
- Press `f` to run only failed tests
- Press `t` to filter by test name pattern

### Coverage Reports
Generated in `coverage/` directory:
- `index.html` - Interactive HTML report
- Text summary in terminal

**Coverage Goals**:
- Utilities: 100% (critical path)
- Services: 90%+ (error cases covered)
- Components: 80%+ (key interactions)

## Async/Task Testing

### Testing Async Functions

**Pattern: async/await**
```typescript
it("should transcribe audio", async () => {
  const result = await transcribeAudio(audioBlob);
  expect(result.text).toBe("transcribed text");
});
```

**Pattern: Promises with resolves/rejects**
```typescript
it("should throw error on failure", async () => {
  await expect(copyToClipboard(text)).rejects.toThrow("Clipboard write failed");
});
```

### Testing React Async State Updates

Use `waitFor` from @testing-library/react:

```typescript
await waitFor(() => {
  expect(screen.getByText("Success")).toBeInTheDocument();
});
```

**Why**: State updates may happen in next tick, waitFor polls until condition is true

### Testing Timers

For components with `setTimeout`:

```typescript
// In test
vi.useFakeTimers();

// Trigger action
hotkeyCallback();

// Fast-forward time
vi.advanceTimersByTime(5000);

// Verify state after timeout
expect(screen.getByText("Idle")).toBeInTheDocument();

vi.useRealTimers();
```

**Current limitation**: Not implemented yet in existing tests

## Testing Best Practices

### Test Structure (AAA Pattern)
```typescript
it("should do something", async () => {
  // Arrange - Set up test data
  const input = "test";
  mockFn.mockResolvedValue("result");

  // Act - Execute the code under test
  const result = await functionUnderTest(input);

  // Assert - Verify the results
  expect(result).toBe("result");
  expect(mockFn).toHaveBeenCalledWith(input);
});
```

### Test Naming
- Use "should" statements: `should copy text to clipboard`
- Describe behavior, not implementation
- Include context: `should throw error when clipboard write fails`

### Edge Cases to Test

**For all utility functions**:
1. Happy path (normal usage)
2. Empty input
3. Invalid input
4. Error conditions
5. Boundary values (very long text, zero duration)

**For class-based modules**:
1. Lifecycle (start/stop, register/unregister)
2. State validation (prevent double-start)
3. Cleanup (streams closed, listeners removed)

### Mocking Principles

**Mock at the boundary**:
- Mock external APIs (Groq, browser APIs)
- Don't mock internal utilities in integration tests
- Mock implementation, not behavior

**Reset mocks**:
```typescript
beforeEach(() => {
  vi.clearAllMocks(); // Clear call history
});
```

**Verify mock calls**:
```typescript
expect(mockFn).toHaveBeenCalledWith(expectedArg);
expect(mockFn).toHaveBeenCalledTimes(1);
expect(mockFn).not.toHaveBeenCalled();
```

## Test Maintenance

### When to Update Tests

**Add tests when**:
- Adding new features
- Fixing bugs (test the bug first, then fix)
- Refactoring (tests ensure behavior unchanged)

**Update tests when**:
- API contracts change
- Error messages change
- Component props change

**Don't update tests when**:
- Internal implementation changes (tests should be black-box)
- Refactoring that doesn't change behavior

### Skipping Tests

Use `describe.skip` or `it.skip` for temporarily disabled tests:

```typescript
describe.skip("App Integration", () => {
  // Tests skipped, will not run
});
```

**Note**: `App.integration.test.tsx` is currently skipped - may need updates for latest App.tsx changes

### Test Performance

**Fast tests** (~1ms):
- Pure function tests
- Simple component renders

**Medium tests** (~10-50ms):
- Tests with async/await
- Component interaction tests

**Slow tests** (>100ms):
- Full integration workflows
- Tests with multiple async operations

**Keep tests fast**: Use mocks to avoid real I/O, API calls, or heavy computation

