# GitHub Actions Cheat Sheet

Use this file to remember the syntax, structure, and common patterns.

## 1. Basic Workflow Skeleton

Remember this order:

```text
name -> on -> jobs -> runs-on -> steps -> uses/run
```

Meaning:

```text
This workflow has a name,
runs on an event,
has jobs,
each job runs on a machine,
and each job has steps.
```

Basic example:

```yaml
name: Node CI

on:
  push:
  pull_request:
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v6

      - name: Run command
        run: echo "Hello GitHub Actions"
```

## 2. Important Keywords

| Keyword | Meaning |
| --- | --- |
| `name` | Workflow name shown in GitHub Actions tab |
| `on` | Event that starts the workflow |
| `jobs` | Group of work to run |
| `runs-on` | Runner machine, such as `ubuntu-latest` |
| `steps` | Commands/actions inside a job |
| `uses` | Use an existing GitHub Action |
| `run` | Run your own shell command |
| `with` | Inputs/settings for an action |
| `env` | Environment variables |
| `if` | Run only when a condition is true |
| `needs` | Make one job wait for another job |
| `strategy.matrix` | Run same job with many versions/options |

## 3. Uses vs Run

Easy rule:

```text
uses = use someone else's action
run  = run my own command
with = settings for uses
```

Example:

```yaml
steps:
  - name: Checkout repository
    uses: actions/checkout@v6

  - name: Print message
    run: echo "This is my own command"
```

Example with `with`:

```yaml
steps:
  - name: Set up Node.js
    uses: actions/setup-node@v6
    with:
      node-version: 22
```

## 4. Common Events

Run on every push:

```yaml
on: push
```

Run on push and pull request:

```yaml
on:
  push:
  pull_request:
```

Run only on selected branches:

```yaml
on:
  push:
    branches:
      - main
      - master
```

Run manually from the Actions tab:

```yaml
on:
  workflow_dispatch:
```

Manual workflow with input:

```yaml
on:
  workflow_dispatch:
    inputs:
      name:
        description: Name to greet
        required: true
        default: DevOps Learner
```

## 5. Multi-Line Commands

Use `|` when you want to run multiple commands:

```yaml
steps:
  - name: Show versions
    run: |
      node --version
      npm --version
```

## 6. GitHub Expressions

GitHub expressions use this syntax:

```text
${{ expression }}
```

Examples:

```yaml
run: echo "Triggered by ${{ github.actor }}"
```

```yaml
run: echo "Branch is ${{ github.ref_name }}"
```

```yaml
run: echo "Repository is ${{ github.repository }}"
```

Common context values:

| Expression | Meaning |
| --- | --- |
| `${{ github.actor }}` | User who triggered workflow |
| `${{ github.repository }}` | Repository name |
| `${{ github.ref_name }}` | Branch or tag name |
| `${{ github.sha }}` | Commit SHA |
| `${{ inputs.name }}` | Manual workflow input |
| `${{ secrets.MY_SECRET }}` | Secret stored in GitHub |
| `${{ matrix.node-version }}` | Current matrix value |

## 7. Job Dependencies With Needs

Use `needs` when one job should wait for another.

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Building..."

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying..."
```

Meaning:

```text
deploy runs only after build succeeds.
```

## 8. Matrix Builds

Use matrix when you want to test multiple versions.

```yaml
jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20, 22]

    steps:
      - uses: actions/checkout@v6

      - uses: actions/setup-node@v6
        with:
          node-version: ${{ matrix.node-version }}

      - run: npm test
```

Meaning:

```text
The same job runs once with Node 20 and once with Node 22.
```

## 9. Conditions With If

Run a step only on the `main` branch:

```yaml
steps:
  - name: Deploy only from main
    if: github.ref_name == 'main'
    run: echo "Deploying from main"
```

Run a step only after failure:

```yaml
steps:
  - name: Show failure message
    if: failure()
    run: echo "Something failed"
```

Useful condition functions:

| Function | Meaning |
| --- | --- |
| `success()` | Previous steps succeeded |
| `failure()` | Previous step failed |
| `always()` | Run even if previous step failed |
| `cancelled()` | Workflow was cancelled |

## 10. Environment Variables

Workflow-level environment variable:

```yaml
env:
  APP_ENV: dev

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo "$APP_ENV"
```

Step-level environment variable:

```yaml
steps:
  - name: Print app name
    env:
      APP_NAME: github-actions-practice
    run: echo "$APP_NAME"
```

## 11. Secrets

Add secrets in GitHub:

```text
Repository -> Settings -> Secrets and variables -> Actions -> New repository secret
```

Use secret in workflow:

```yaml
steps:
  - name: Use secret
    run: echo "Secret is available"
    env:
      TOKEN: ${{ secrets.MY_TOKEN }}
```

Do not print secret values directly in logs.

## 12. Artifacts

Upload a file from workflow:

```yaml
steps:
  - run: echo "Build output" > result.txt

  - name: Upload artifact
    uses: actions/upload-artifact@v4
    with:
      name: result-file
      path: result.txt
```

Download artifact in another job:

```yaml
steps:
  - name: Download artifact
    uses: actions/download-artifact@v4
    with:
      name: result-file
```

## 13. Cache Example

Cache npm dependencies:

```yaml
steps:
  - uses: actions/checkout@v6

  - uses: actions/setup-node@v6
    with:
      node-version: 22
      cache: npm

  - run: npm install
  - run: npm test
```

## 14. Most Common Mistakes

### Wrong Indentation

Bad:

```yaml
jobs:
test:
  runs-on: ubuntu-latest
```

Good:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
```

### Forgetting Dash for Steps

Bad:

```yaml
steps:
  name: Checkout
  uses: actions/checkout@v6
```

Good:

```yaml
steps:
  - name: Checkout
    uses: actions/checkout@v6
```

### Putting Workflow in Wrong Folder

Workflow files must be here:

```text
.github/workflows/file-name.yml
```

This `.github` folder must be at the root of the GitHub repository.

## 15. Memory Tricks

### Trick 1: The Main Sentence

```text
When something happens, run jobs on machines, using steps.
```

Maps to:

```text
on -> jobs -> runs-on -> steps
```

### Trick 2: Action or Command

```text
uses = action
run = command
```

### Trick 3: YAML Shape

```text
key: value
parent:
  child:
    - list item
```

### Trick 4: Practice One Pattern at a Time

Do not memorize everything in one day.

Practice in this order:

1. `push`
2. `workflow_dispatch`
3. `uses` and `run`
4. `env`
5. `secrets`
6. `needs`
7. `matrix`
8. `if`
9. `artifacts`
10. `cache`

## 16. Mini Templates

### Node.js CI

```yaml
name: Node CI

on:
  push:
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v6

      - uses: actions/setup-node@v6
        with:
          node-version: 22

      - run: npm install
      - run: npm test
```

### Manual Workflow

```yaml
name: Manual Practice

on:
  workflow_dispatch:
    inputs:
      environment:
        description: Environment name
        required: true
        default: dev

jobs:
  run:
    runs-on: ubuntu-latest

    steps:
      - run: echo "Running for ${{ inputs.environment }}"
```

### Build Then Deploy

```yaml
name: Build Deploy

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Build"

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploy"
```

## 17. Best Way To Remember

Write workflows from memory, then compare with this cheat sheet.

Practice loop:

```text
write -> push -> read error -> fix -> push again
```

The errors teach you fast, especially YAML indentation errors.
