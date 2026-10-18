# Production Level BDD Specification Template
# Save feature specifications to: docs/specs/<feature-name>/gherkin.feature

Feature: [Concise Feature Name]
  As a [target user role / persona]
  I want to [perform specific action or capability]
  So that [measurable customer value / business outcome is achieved]

  Background:
    Given the system is initialized and healthy
    And the user context is established

  # ---------------------------------------------------------------------------
  # 1. Happy Path Scenarios (Primary User Flows)
  # ---------------------------------------------------------------------------
  Scenario: Successfully [complete primary action] with valid inputs
    Given a registered user with valid permissions
    And a valid payload containing required fields
    When the user submits the request to [perform action]
    Then the operation succeeds with status "200 OK"
    And the state is persisted and returned matching the contract

  # ---------------------------------------------------------------------------
  # 2. Validation & Error Path Scenarios (Negative Cases)
  # ---------------------------------------------------------------------------
  Scenario: Reject [action] when required input is missing or malformed
    Given a user attempting to [perform action]
    When the request is submitted with an empty or invalid required field
    Then the operation is rejected with RFC 7807 status 400 "Validation Error"
    And an actionable field-level error message is returned
    And no partial state mutation occurs

  Scenario: Block unauthorized access to protected resource
    Given an unauthenticated or insufficiently privileged caller
    When the caller attempts to [perform action]
    Then the operation is rejected with status 401 or 403
    And the security audit log records the rejected attempt

  # ---------------------------------------------------------------------------
  # 3. Boundary, Concurrency & Resilience Edge Cases
  # ---------------------------------------------------------------------------
  Scenario: Handle duplicate or concurrent requests idempotently
    Given an active request with idempotency key "idem-key-001"
    When an identical concurrent request with "idem-key-001" is received
    Then the system processes the mutation exactly once
    And returns a deterministic conflict or cached success response

  Scenario: Degrade gracefully when downstream dependency times out
    Given the downstream persistence or external service exceeds the timeout threshold
    When the user attempts to [perform action]
    Then the system aborts the request within the configured timeout window
    And returns a structured 503 retryable error without leaking internal stack traces
