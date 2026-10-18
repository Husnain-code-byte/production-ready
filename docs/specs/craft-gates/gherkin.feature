# Spec: craft-gates — mechanical craft signals for code and documentation
# Implementation: scripts/hooks/craft/
# Tiers: "error" persists into the Stop gate; "advice" is reported only.

Feature: Craft gates
  As a maintainer of the Production Level harness
  I want high-precision craft defects caught mechanically and heuristic ones surfaced
  So that models are steered toward clear, honest, proportionate work without false-positive blocking

  Background:
    Given a project root and a project-relative file path with its text content

  # --- Error tier: high precision ------------------------------------------
  Scenario Outline: Swallowed errors are an error
    Given a "<language>" source file containing "<construct>"
    When the craft audit runs
    Then it reports rule "swallowed-error" at tier "error" on the construct's line

    Examples:
      | language   | construct                         |
      | python     | bare except clause                |
      | python     | except Exception followed by pass |
      | javascript | empty catch block                 |
      | typescript | empty catch block with binding    |

  Scenario: Handled errors are not flagged
    Given a source file whose except or catch block logs or re-raises
    When the craft audit runs
    Then no "swallowed-error" finding is reported

  Scenario: Debug output in a production path is an error
    Given a source file under "src/" calling print or console.log
    When the craft audit runs
    Then it reports rule "debug-output" at tier "error"

  Scenario Outline: Debug output is tolerated where it is the interface
    Given a file at "<path>" calling print or console.log
    When the craft audit runs
    Then no "debug-output" finding is reported

    Examples:
      | path                |
      | tests/test_api.py   |
      | src/cli/main.py     |
      | src/app/__main__.py |
      | bin/tool.js         |

  Scenario: A test file with tests but no assertions is an error
    Given a test file defining test functions and containing no assertion
    When the craft audit runs
    Then it reports rule "assertion-free-test" at tier "error"

  Scenario: Broken relative links in documentation are an error
    Given a markdown file under "docs/" linking to a missing relative path
    When the craft audit runs
    Then it reports rule "broken-link" at tier "error" on the link's line

  # --- Advice tier: heuristics ----------------------------------------------
  Scenario: Deep control-flow nesting is advice
    Given a source function with control flow nested four levels deep
    When the craft audit runs
    Then it reports rule "deep-nesting" at tier "advice"

  Scenario: Long parameter lists are advice
    Given a function declaring more than five parameters
    When the craft audit runs
    Then it reports rule "long-parameter-list" at tier "advice"

  Scenario: Commented-out code is advice
    Given two or more consecutive comment lines that parse as code
    When the craft audit runs
    Then it reports rule "commented-out-code" at tier "advice"

  Scenario: Duplicated knowledge blocks are advice
    Given a file repeating a four-line significant block
    When the craft audit runs
    Then it reports rule "duplicated-block" at tier "advice" naming both locations

  Scenario: Vanity words in documentation are advice
    Given a markdown file using "seamless" or "world-class" outside code
    When the craft audit runs
    Then it reports rule "vanity-word" at tier "advice"
    But the same words inside code fences or inline code are not reported

  # --- Boundaries and safety ------------------------------------------------
  Scenario: Oversized input is skipped, not scanned
    Given a file larger than 200 KB or containing a line longer than 2000 characters
    When the craft audit runs
    Then it reports rule "audit-skipped" at tier "advice" and runs no detector

  Scenario: Link resolution cannot escape the project root
    Given a markdown link whose target resolves outside the project root
    When the craft audit runs
    Then it reports rule "link-escapes-root" at tier "error"
    And it does not stat any path outside the project root

  Scenario: Findings per file are bounded
    Given a file producing more than 25 findings
    When the craft audit runs
    Then at most 25 findings are returned

  Scenario: Non-audited paths are ignored
    Given a path under "scripts/", ".agents/", "templates/", or "project-memory/"
    When the craft audit runs
    Then no findings are returned

  # --- Integration ------------------------------------------------------------
  Scenario: Only error-tier findings persist into the Stop gate
    Given a file with one error finding and one advice finding
    When the PostToolUse quality gate audits the file
    Then the error finding is written to quality-violations.json
    And the advice finding is not
