---
name: refactoring-patterns
description: Guidelines and step-by-step checklists for safely performing code refactoring patterns (Fowler) without breaking existing interfaces.
---

# Architectural Refactoring Patterns

## Refactoring Best Practices

- **Zero-Regression Focus**: Run the test suite after every incremental modification. Do not make multiple unrelated refactoring edits at the same time.
- **Maintain Public Interfaces**: Do not change public function signatures or API endpoints unless explicitly requested. Use deprecation notices or adapters if structural changes are necessary.
- **Separate Refactoring from Features**: Do not mix refactoring with adding new features. Refactor first, commit, then implement the new feature on top of the clean design.

## Standard Fowler Checklists

### 1. Extract Function
1. Create a new function and name it after its intent (what it does, not how it does it).
2. Copy the extracted code block into the new function.
3. Pass any variables that are read but not modified inside the extracted block as arguments.
4. Pass any variables that are modified inside the extracted block as return values.
5. Replace the original code block with a call to the new function.
6. Run tests to verify correctness.

### 2. Move Field / Method
1. Ensure the source object and target object are accessible in both scopes.
2. Implement the method or field on the target object.
3. Update the source method/field to delegate calls to the target object.
4. Replace direct references to the source method/field across the codebase with references to the target object.
5. Remove the source implementation once no references remain.
6. Run tests to verify correctness.

### 3. Replace Conditional with Polymorphism
1. Identify the class or interface that represents the conditional variations.
2. Create sub-classes or polymorphic implementations for each branch of the conditional statement.
3. Move the branch-specific execution code into overridden methods in each sub-class.
4. Replace the original conditional check with a polymorphic method call on the object instance.
5. Run tests to verify correctness.
