# GitHub Actions Notes

## Why My Pipeline Was Not Working

GitHub Actions only detects workflow files when they are inside this path at the root of the GitHub repository:

```text
.github/workflows/workflow-name.yml
```

If the file is inside a normal study folder like this:

```text
Study/GitHub-Actions/.github/workflows/ci.yaml
```

then GitHub will treat it as a regular file, not as an active pipeline.

## Minimal Working Workflow

```yaml
name: My First Workflow

on:
  push:
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Print message
        run: echo "Hello, world!"
```

## Important Points

- `.github/workflows` must be at the repository root.
- Workflow file extension can be `.yml` or `.yaml`.
- `on: push` runs the workflow after a push.
- `workflow_dispatch` lets you run the workflow manually from the Actions tab.
- `uses` runs an existing action.
- `run` runs a shell command.
- `actions/checkout@v4` downloads your repository code into the runner.

## Practice Steps

1. Create `.github/workflows/ci.yaml` at the root of the repo.
2. Add a simple workflow.
3. Commit and push the workflow file.
4. Open GitHub repository -> Actions tab.
5. Check the workflow logs if it fails.

## Common Mistakes

- Putting `.github/workflows` inside a subfolder.
- Wrong YAML indentation.
- Forgetting `-` before each step.
- Using `run` where `uses` is needed.
- Expecting GitHub Actions to run before the workflow file is pushed.
