# Product Requirements Prompt (PRP)

## 1. Overview

- **Feature Name:** _A short, descriptive name for the feature._

- **Objective:** _A one-sentence summary of the goal. What are we building?_

- **Why:** _What user problem does this solve or what value does it create?_

## 2. Success Criteria

_This feature will be considered complete when the following conditions are met. These must be specific and measurable._

- [ ] The code builds without errors.

- [ ] All new unit and integration tests pass.

- [ ] The feature meets all functional requirements described below.

- [ ] The code adheres to the project standards defined in `{{LLM_AGENT}}.md`.

## 3. Context & Resources

_This section contains all the information needed to implement the feature correctly._

### 📚 External Documentation:

_List any URLs for libraries, APIs, or tutorials._

- **Resource:** [Link to API Docs]

  - **Purpose:** _Explain which parts are relevant._

### 💻 Internal Codebase Patterns:

_List any existing files or code snippets from this project that should be used as a pattern or inspiration._

- **File:** `Application/Handlers/ExistingFeatureHandler.cs`

- **Reason:** _Explain what to learn from it (e.g., "Follow the CQRS and validation pattern in this file")._

### ⚠️ Known Pitfalls:

_List any critical warnings, rate limits, or tricky logic to be aware of._

- _e.g., "External API responses may be delayed, so use retry logic with exponential backoff."_

## 4. Implementation Blueprint

_This is the step-by-step plan for building the feature._

### Proposed File Structure:

_Show the desired directory tree, highlighting new or modified files._

```
ProjectRoot/
├── src/
│   ├── Domain/
│   │   └── FeatureName/
│   │       └── Entities/
│   │           └── NewEntity.cs            (new)
│   ├── Application/
│   │   └── FeatureName/
│   │       ├── Commands/
│   │       │   ├── CreateNewFeatureCommand.cs  (new)
│   │       │   └── CreateNewFeatureHandler.cs  (new)
│   │       └── DTOs/
│   │           ├── NewFeatureRequest.cs    (new)
│   │           └── NewFeatureResponse.cs   (new)
│   ├── Infrastructure/
│   │   └── Services/
│   │       └── ExternalApiService.cs       (new)
│   └── API/
│       └── Controllers/
│           └── NewFeatureController.cs     (new)
├── tests/
│   └── Application.Tests/
│       └── FeatureName/
│           └── CreateNewFeatureTests.cs    (new)
```

### Task Breakdown:

_Break the implementation into a sequence of logical tasks._

**Task 1: Data Modeling**

- _Define any domain entities, request/response DTOs, and validation rules._

**Task 2: Command & Handler Logic (CQRS)**

- _Implement the business logic using MediatR command and handler._

```
public record CreateNewFeatureCommand(string Input) : IRequest<NewFeatureResponse>;

public class CreateNewFeatureHandler : IRequestHandler<CreateNewFeatureCommand, NewFeatureResponse>
{
    public Task<NewFeatureResponse> Handle(CreateNewFeatureCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Input))
            throw new ArgumentException("Input cannot be empty");

        var result = PerformAction(request.Input);
        return Task.FromResult(new NewFeatureResponse { Success = result });
    }

    private bool PerformAction(string input)
    {
        // Implementation details here
        return true;
    }
}
```

**Task 3: API Integration**

- _Expose the MediatR command from a controller endpoint._

```
[ApiController]
[Route("api/[controller]")]
public class NewFeatureController : ControllerBase
{
    private readonly IMediator _mediator;

    public NewFeatureController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> RunFeature([FromBody] NewFeatureRequest request)
    {
        var command = new CreateNewFeatureCommand(request.Input);
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}
```

## 5. Validation Plan

_How we will verify the implementation is correct._

### Unit Tests:

_Describe the specific test cases that need to be created._

- `Test_HappyPath_ShouldReturnSuccess()`: Should succeed with valid input.

- `Test_InvalidInput_ShouldThrowArgumentException()`: Should throw with bad input.

- `Test_ExternalDependencyFailure_ShouldHandleGracefully()`: Should simulate and handle downstream failure.

**Manual Test Command:**  
_Provide a simple command to run to see the feature in action using `curl` or Postman._

```
curl -X POST http://localhost:5000/api/NewFeature \
     -H "Content-Type: application/json" \
     -d '{"input": "test_value"}'
```

**Expected Output:**

```json
{
  "success": true
}
```
