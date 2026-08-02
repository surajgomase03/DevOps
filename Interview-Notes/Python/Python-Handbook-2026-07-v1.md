# Python for DevOps — Production Handbook

**Version:** v1
**Month:** 2026-07
**Status:** Active (single working file, edited in place per the new master prompt)
**Author:** Suraj
**Project Anchor:** CMG (UK Gov) — EKS, EC2 legacy apps (Siebel/WebSphere/Documentum/BPM), Jenkins (IAM-scoped agents), Terraform, ECR, Trivy, Helm, EventBridge Scheduler, SSM Session Manager, S3

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| v1 | 2026-07 | Initial handbook skeleton created. |
| v1 | 2026-07 | Added: `os`, `subprocess`, `psutil`, `paramiko`; `requests`; `json`, `csv`, `shutil`, `sqlite3`, `PyYAML`, `pathlib`; `logging`; `re`; `datetime`; `boto3`; extra recommended DevOps modules list. |
| v1 | 2026-07 | Populated remaining phases under the old 28-phase structure (Fundamentals, Control Flow, Functions, Modules & Packages, OOP, Error Handling, Collections, Iterators/Generators, Functional Programming, Concurrency, Kubernetes/Terraform/CI-CD/Docker automation, Automation Projects index, Security/Testing/Performance/Design Patterns, Interview Prep). |
| v1 | 2026-07 | Added dependency storage locations + per-OS venv activation commands; added 4-category exception breakdown. |
| v1 | 2026-07 | Added 15 extended senior scenario questions (design, secrets, idempotency, rate limits/retries, packaging, performance, testing, dependency management, K8s/cloud integration, logging, security, legacy migration, senior signals), answered pointwise with cross-references. |
| v1 | 2026-07 | Added full worked code examples across Control Flow (incl. diagram); wrote out full Basics content (previously only `datetime` existed); added missing code examples to Design Patterns (Singleton, Factory, Strategy, Observer, Builder) plus a pattern-selection diagram; added exception-flow diagram, decorator call-flow diagram, class-hierarchy diagram + polymorphism example. |
| v1 | 2026-07 | **Adopted new master prompt.** Retrofitted the file from the old 28-phase structure to the new 24-phase taxonomy (see Phase Mapping table below). Moved `sqlite3` → new Phase 19 (Database & Data Handling); moved `paramiko` → new Phase 16 (Infrastructure Automation); merged old Functional Programming into Functions (Phase 5), old Design Patterns into OOP (Phase 6), old Logging into Error Handling (Phase 9). Added scaffold for Phase 24 (Master Rapid Fire — currently empty, populated as per-topic Rapid Fire sections are added). Content itself (explanations, examples, diagrams) was **not** rewritten in this pass — only reorganized; the heavier per-topic template (Internal Working, Architecture diagrams, Commands, Monitoring, Troubleshooting/RCA, FAQs, Comparison Tables, Cheat Sheets, per-topic Rapid Fire, highlight boxes) from the new prompt has **not** yet been retrofitted onto existing topics — flagged honestly as pending, to be done incrementally topic-by-topic. |

---

## Editing Model (per new master prompt — supersedes old "append during month" wording)

- **One active file only** during 2026-07 — all changes are made in place, in this file. No new version/file is created unless explicitly told ("go with version 2").
- Pasted chat content is inserted **verbatim** into the relevant section — not reworded/summarized.
- Before any insert: check the whole file for duplicate concepts (same idea in different wording still counts) — merge, don't duplicate.
- Updated topic → regenerate the **entire** topic section, never patch with a few extra lines.
- This file freezes permanently (read-only) only when explicitly told to version up — at which point a new file is seeded with only what's genuinely new/updated, never re-copying completed topics.

---

## Phase Mapping — Old (28-phase) → New (24-phase taxonomy)

| Old Phase | New Phase | Notes |
|---|---|---|
| 1 Python Fundamentals | 1 Fundamentals | direct rename |
| 2 Python Basics | 2 Core Syntax | direct rename |
| 9 Python Collections | 3 Data Structures | `collections` module now lives here; basic list/tuple/set/dict stay in Phase 2 |
| 3 Control Flow | 4 Control Flow | direct rename |
| 4 Functions | 5 Functions | merged with old Functional Programming |
| 11 Functional Programming | 5 Functions | merged in (map/filter/reduce/any/all/sorted/comprehensions) |
| 6 Object-Oriented Programming | 6 Object-Oriented Programming | merged with old Design Patterns |
| 26 Design Patterns | 6 Object-Oriented Programming | merged in |
| 5 Modules & Packages | 7 Modules & Packages | direct rename |
| 8 File Handling | 8 File Handling | `sqlite3` extracted out to new Phase 19 |
| 7 Error Handling | 9 Error Handling & Logging | merged with old Logging |
| 12 Logging | 9 Error Handling & Logging | merged in |
| 10 Iterators & Generators | 10 Iterators & Generators | direct rename |
| 13 Regular Expressions | 11 Regular Expressions | direct rename |
| 14 Multithreading & Multiprocessing | 12 Concurrency & Parallelism | direct rename |
| 15 Networking | 13 Networking & APIs | direct rename |
| 16 Python for Linux | 14 Automation & Scripting | `paramiko` extracted out to new Phase 16 |
| 22 Automation Projects | 14 Automation & Scripting | merged in (index table) |
| 27 Production Python (extra modules) | 14 Automation & Scripting | merged in (recommended modules list) |
| 17 Python for AWS | 15 Cloud SDKs | direct rename |
| 18 Python for Kubernetes | 16 Infrastructure Automation with Python | merged |
| 19 Python for Terraform | 16 Infrastructure Automation with Python | merged in |
| 21 Python for Docker | 16 Infrastructure Automation with Python | merged in |
| — | 16 Infrastructure Automation with Python | `paramiko` moved in from old Phase 16 |
| 24 Testing | 17 Testing | direct rename |
| — | 18 Packaging & Distribution | **new phase, not previously covered — pending** |
| — | 19 Database & Data Handling | **new phase** — seeded with `sqlite3` (moved from old Phase 8); SQLAlchemy/Postgres/pandas pending |
| 25 Performance | 20 Performance & Best Practices | direct rename; PEP8/mypy/black/isort pending |
| 23 Security | 21 Security | direct rename |
| 20 Python for CI/CD | 22 CI/CD Integration | direct rename |
| 28 Interview Preparation | 23 Interview Preparation | direct rename |
| — | 24 Master Rapid Fire — All Topics | **new phase, scaffold only** — populated as per-topic Rapid Fire sections get added |

---

## Coverage Tracker

| Phase | Topic | Status |
|---|---|---|
| 1 | Fundamentals | Content + Rapid Fire complete; Architecture diagram/Commands/Monitoring/Troubleshooting/FAQs/Comparison Table/Cheat Sheet not yet added |
| 2 | Core Syntax | Content + Rapid Fire complete; heavier template sections not yet added |
| 3 | Data Structures | `collections` module + Rapid Fire complete; heavier template sections not yet added |
| 4 | Control Flow | Content (+ diagram) + Rapid Fire complete; heavier template sections not yet added |
| 5 | Functions | Content (+ diagram) + Rapid Fire complete; heavier template sections not yet added |
| 6 | Object-Oriented Programming | Content (+ diagram) + Rapid Fire complete; heavier template sections not yet added |
| 7 | Modules & Packages | Content + Rapid Fire complete; heavier template sections not yet added |
| 8 | File Handling | json/csv/shutil/PyYAML/pathlib + Rapid Fire complete; XML/ConfigParser/tempfile still pending |
| 9 | Error Handling & Logging | Content (+ diagram) + Rapid Fire complete; heavier template sections not yet added |
| 10 | Iterators & Generators | Content + Rapid Fire complete; heavier template sections not yet added |
| 11 | Regular Expressions | Content + Rapid Fire complete; heavier template sections not yet added |
| 12 | Concurrency & Parallelism | Content + Rapid Fire complete; heavier template sections not yet added |
| 13 | Networking & APIs | `requests` + socket/urllib/DNS/SSL + Rapid Fire complete |
| 14 | Automation & Scripting | os/subprocess/psutil/signal/cron/systemd + Rapid Fire complete |
| 15 | Cloud SDKs | `boto3` + IAM/EC2/S3/Lambda patterns + Rapid Fire complete; Azure/GCP SDKs still pending |
| 16 | Infrastructure Automation with Python | K8s/Terraform/Docker/paramiko/Ansible modules/Fabric/Pulumi/Invoke + Rapid Fire complete |
| 17 | Testing | Overview + Rapid Fire complete; heavier template sections not yet added |
| 18 | Packaging & Distribution | setuptools/wheel/pyproject.toml/entry points/semver + Rapid Fire complete |
| 19 | Database & Data Handling | sqlite3/SQLAlchemy/Postgres-MySQL drivers/pandas + Rapid Fire complete |
| 20 | Performance & Best Practices | PEP8/mypy/black/isort + profiling/caching + Rapid Fire complete |
| 21 | Security | Overview + Rapid Fire complete; heavier template sections not yet added |
| 22 | CI/CD Integration | Overview + Rapid Fire complete; heavier template sections not yet added |
| 23 | Interview Preparation | Complete, indexed to other phases (no separate Rapid Fire — redundant with its own Q&A format) |
| 24 | Master Rapid Fire — All Topics | **Populated** — consolidates all 22 phase-level Rapid Fire sections |

**Remaining honest gap (applies to every phase):** the new master prompt's full heavy per-topic template — *Internal Working, dedicated Architecture (Mermaid/ASCII) diagrams per topic, a Commands block, Monitoring, structured Troubleshooting/RCA, FAQs, Comparison Tables, Cheat Sheet, and the 💡⚠️🚀🔒🎯📌🔥❗ highlight-box formatting convention* — has **not** been retrofitted onto existing topics. What's done: all genuinely-pending phases now have real content, and every phase has a Rapid Fire section feeding the new Phase 24 consolidation chapter. What's still pending is the deeper template scaffolding on top of already-written topics — flagged honestly, to be retrofitted incrementally.

---

## Table of Contents

1. [Phase 1 – Fundamentals](#phase-1--fundamentals)
2. [Phase 2 – Core Syntax](#phase-2--core-syntax)
3. [Phase 3 – Data Structures](#phase-3--data-structures)
4. [Phase 4 – Control Flow](#phase-4--control-flow)
5. [Phase 5 – Functions](#phase-5--functions)
6. [Phase 6 – Object-Oriented Programming](#phase-6--object-oriented-programming)
7. [Phase 7 – Modules & Packages](#phase-7--modules--packages)
8. [Phase 8 – File Handling](#phase-8--file-handling)
9. [Phase 9 – Error Handling & Logging](#phase-9--error-handling--logging)
10. [Phase 10 – Iterators & Generators](#phase-10--iterators--generators)
11. [Phase 11 – Regular Expressions](#phase-11--regular-expressions)
12. [Phase 12 – Concurrency & Parallelism](#phase-12--concurrency--parallelism)
13. [Phase 13 – Networking & APIs](#phase-13--networking--apis)
14. [Phase 14 – Automation & Scripting](#phase-14--automation--scripting)
15. [Phase 15 – Cloud SDKs](#phase-15--cloud-sdks)
16. [Phase 16 – Infrastructure Automation with Python](#phase-16--infrastructure-automation-with-python)
17. [Phase 17 – Testing](#phase-17--testing)
18. [Phase 18 – Packaging & Distribution](#phase-18--packaging--distribution)
19. [Phase 19 – Database & Data Handling](#phase-19--database--data-handling)
20. [Phase 20 – Performance & Best Practices](#phase-20--performance--best-practices)
21. [Phase 21 – Security](#phase-21--security)
22. [Phase 22 – CI/CD Integration](#phase-22--cicd-integration)
23. [Phase 23 – Interview Preparation](#phase-23--interview-preparation)
24. [Phase 24 – 🔥🔥 Master Rapid Fire — All Topics](#phase-24--master-rapid-fire--all-topics)

---

## Phase 1 – Fundamentals

*(History, Installation, Versions, Execution, venv, pip, pipx, pyenv, Project Structure, IDE Setup, VS Code Config)*

### History & Versions
- Python 2 reached end-of-life Jan 2020 — all production DevOps tooling today targets **Python 3** (3.11/3.12 are current mainstream; check `python3 --version` on your Jenkins agents/EKS base images).
- CPython is the reference implementation (what `python3` normally refers to); alternatives (PyPy, Jython) are rarely relevant for DevOps scripting.

### Installation & Execution
- Linux: usually preinstalled or via distro package manager (`apt install python3`); container base images (e.g., `python:3.12-slim`) are the standard for CI/CD-built automation images.
- Execution modes: `python3 script.py` (script), `python3 -m module_name` (run a module as script — e.g. `python3 -m http.server`), interactive REPL (`python3`), `python3 -c "code"` (inline).

### Virtual Environments — `venv`
- **What/why:** Isolates project dependencies from system Python — mandatory for reproducible automation scripts, especially when multiple tools (Ansible, boto3-based scripts) need different library versions.
- **Commands:**
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate
  pip install -r requirements.txt
  deactivate
  ```
- **CMG note:** Jenkins pipeline stages that run Python automation should create/activate a venv per build (or use a pinned Docker image) to avoid dependency drift between pipeline runs.

### Where dependencies get stored
- **Global install (no venv active):** installs into the system Python's `site-packages`. Find the path via:
  ```bash
  python3 -m site --user-site           # user-level install path
  python3 -c "import site; print(site.getsitepackages())"   # system-level paths
  ```
- **Inside an activated venv:** installs into the venv's own isolated folder — never touches the global/system Python:
  - Linux/Mac: `<venv>/lib/pythonX.Y/site-packages/`
  - Windows: `<venv>\Lib\site-packages\`
- **pip's download/build cache** (not the same as installed packages — this is pip's cache of downloaded wheels/sdists):
  - Linux: `~/.cache/pip`
  - Mac: `~/Library/Caches/pip`
  - Windows: `%LocalAppData%\pip\Cache`

### Activating a venv — platform-specific commands
```bash
python3 -m venv .venv          # create

# activate:
source .venv/bin/activate      # Linux/Mac
.venv\Scripts\activate         # Windows CMD
.venv\Scripts\Activate.ps1     # Windows PowerShell

deactivate                     # exit venv
```
- Once activated, `pip install <pkg>` installs into `.venv/lib/.../site-packages`, isolated from the system Python — that's the entire point (no version conflicts between projects/pipelines).
- **Verify you're inside the venv:** `which python3` (Linux/Mac) or `where python` (Windows) should point inside `.venv/bin/` or `.venv\Scripts\`, not the system Python path.

### pip
- Standard package installer. Key commands: `pip install pkg==1.2.3` (pin versions — always pin in production requirements files), `pip freeze > requirements.txt`, `pip install -r requirements.txt`, `pip list --outdated`.
- **Best practice:** Pin exact versions (`==`) in `requirements.txt` for reproducible CI builds; use `pip-tools` or `poetry` for larger projects to separate direct vs transitive pins.

### pipx
- Installs and runs Python CLI applications in isolated environments (one venv per tool) without polluting the global/project environment. Useful for installing tools like `black`, `ansible-lint`, `pre-commit` globally on a dev machine without version conflicts.

### pyenv
- Manages multiple Python **versions** side-by-side (distinct from `venv`, which manages **dependencies** for one version). Useful when different projects/pipelines require different Python versions (e.g., legacy automation on 3.9 vs new tooling on 3.12).

### Project Structure (DevOps automation repo convention)
```
project/
├── src/
│   └── automation/
│       ├── __init__.py
│       └── ec2_inventory.py
├── tests/
├── requirements.txt
├── .env.example
├── README.md
└── Jenkinsfile
```

### IDE / VS Code Setup
- Recommended extensions: Python (Microsoft), Pylance (type checking/IntelliSense), Ruff or Flake8 (linting), Black (formatting).
- `.vscode/settings.json` — pin interpreter to the project's `.venv`, enable format-on-save.
- **Interview angle:** Senior explains `venv` vs `pyenv` distinction precisely — a very common junior confusion point.

### 🔥 Rapid Fire
- Q: `venv` vs `pyenv`? → `venv` isolates dependencies for one Python version; `pyenv` manages multiple Python versions.
- Q: What does `pip freeze` do? → Lists installed packages with exact versions, typically redirected into `requirements.txt`.
- Q: Why pin exact versions in production requirements? → Reproducible CI builds — unpinned deps can silently change behavior between runs.

## Phase 2 – Core Syntax

*(Variables, Data Types, Numbers, Strings, Lists, Tuples, Sets, Dictionaries, Operators, Type Conversion, I/O, Comments)*

### Variables & Data Types
- Python is dynamically typed — no declaration keyword, type inferred at assignment.
  ```python
  region = "eu-west-2"        # str
  replica_count = 3           # int
  cpu_usage = 72.5            # float
  is_healthy = True           # bool
  tags = None                 # NoneType
  ```
- **Interview angle:** Senior explains "dynamically typed" vs "duck typed" precisely — Python checks types at runtime, not compile time, which is why type hints (`region: str`) + tools like `mypy` matter for catching bugs early in larger automation codebases.

### Numbers
- `int` (arbitrary precision — no overflow like fixed-width integers in other languages), `float` (IEEE 754 double), `complex` (rarely needed in DevOps scripting).
- **Common gotcha:** Float precision — `0.1 + 0.2 != 0.3` (binary floating-point representation). Use `decimal.Decimal` for anything involving money (e.g., cost-optimizer scripts comparing AWS billing figures) instead of raw floats.
  ```python
  from decimal import Decimal
  cost = Decimal("12.50") + Decimal("7.30")   # exact, no float rounding error
  ```

### Strings
- Immutable sequence of characters. Key operations:
  ```python
  name = "cmg-prod-eks"
  print(name.upper())                 # CMG-PROD-EKS
  print(name.split("-"))              # ['cmg', 'prod', 'eks']
  print(name.replace("prod", "dev"))  # cmg-dev-eks
  print(f"Cluster: {name}, Region: {region}")  # f-string (preferred formatting)
  print(name.startswith("cmg"))       # True
  ```
- **Best practice:** Use f-strings (`f"..."`) over `.format()` or `%` formatting — clearer and faster in modern Python.

### Lists
- Ordered, mutable, allows duplicates.
  ```python
  instance_ids = ["i-001", "i-002", "i-003"]
  instance_ids.append("i-004")
  instance_ids.remove("i-002")
  print(len(instance_ids))            # 3
  print(instance_ids[0])              # i-001
  print(instance_ids[-1])             # last item
  print(instance_ids[1:3])            # slice
  ```

### Tuples
- Ordered, **immutable**, allows duplicates. Used for fixed-size records that shouldn't change (e.g., a coordinate pair, a return value with a known fixed shape).
  ```python
  region_az = ("eu-west-2", "eu-west-2a")
  # region_az[0] = "x"   # TypeError — tuples can't be modified
  ```
- **Interview angle:** Senior explains when to choose tuple over list — immutability signals intent ("this shouldn't change") and tuples are hashable (usable as dict keys), lists are not.

### Sets
- Unordered, mutable, **no duplicates** — ideal for membership testing and deduplication.
  ```python
  running_ids = {"i-001", "i-002", "i-003"}
  tagged_ids = {"i-002", "i-003", "i-004"}

  print(running_ids & tagged_ids)   # intersection: {'i-002', 'i-003'}
  print(running_ids - tagged_ids)   # running but untagged: {'i-001'}
  print("i-001" in running_ids)     # O(1) membership check — much faster than `in list`
  ```
- **Performance note (interview-relevant):** `in` on a `set`/`dict` is O(1) average; `in` on a `list` is O(n) — a real source of slow inventory/audit scripts iterating thousands of AWS resources.

### Dictionaries
- Key-value pairs, ordered (insertion order guaranteed since Python 3.7), mutable.
  ```python
  instance = {"id": "i-001", "state": "running", "type": "t3.medium"}
  print(instance["state"])            # running
  print(instance.get("az", "unknown"))  # safe lookup with default — avoids KeyError
  instance["az"] = "eu-west-2a"       # add/update key
  for key, value in instance.items():
      print(key, value)
  ```
- **Common mistake:** `instance["missing_key"]` raises `KeyError` — use `.get(key, default)` when the key might not exist (very common with variable-shaped API responses).

### Operators
- Arithmetic (`+ - * / // % **`), comparison (`== != < > <= >=`), logical (`and or not`), identity (`is`/`is not` — compares object identity, not value; use for `is None` checks specifically), membership (`in`/`not in`).
- **Interview trap:** `==` compares value, `is` compares identity — `a == b` can be True while `a is b` is False for two separate objects with equal content. Always use `is None`, never `== None`.

### Type Conversion
  ```python
  count = int("5")           # str -> int
  percent = float("72.5")    # str -> float
  label = str(42)            # int -> str
  items = list("abc")        # str -> list: ['a', 'b', 'c']
  ```
- **Common mistake:** `int("72.5")` raises `ValueError` (can't convert a decimal string directly to int) — convert to `float` first, then `int()` if truncation is intended.

### Input / Output
  ```python
  # print() — standard output
  print("Deployment started", flush=True)   # flush=True matters for real-time CI log streaming

  # input() — rarely used in automation (non-interactive), but relevant for interactive CLI tools
  target_env = input("Enter target environment: ")
  ```
- **DevOps note:** Automation scripts should avoid `input()` entirely — use `argparse`/`click` (Phase 14) for non-interactive, pipeline-friendly argument parsing instead.

### Comments
  ```python
  # Single-line comment
  """
  Multi-line string, often used as a module/function docstring
  rather than a true 'comment' — accessible via help()/func.__doc__
  """
  def deploy(service: str) -> None:
      """Deploy the given service to the current cluster context."""
      ...
  ```
- **Best practice:** Docstrings (triple-quoted, right under a `def`/`class`) are the convention for documenting *what* code does; `#` comments are for *why* — explaining non-obvious decisions, not restating the code.

### datetime

- **What it is:** Standard library module for date/time representation and arithmetic (`datetime`, `date`, `time`, `timedelta`, `timezone`).
- **Why needed in DevOps:** Timestamping logs/backups, calculating certificate/credential expiry, scheduling windows for EventBridge-triggered jobs.
- **Key API:**
  - `datetime.now()` (naive, local) vs `datetime.now(timezone.utc)` (aware, UTC) — **always use timezone-aware datetimes in production/distributed systems.**
  - `datetime.strftime(fmt)` / `datetime.strptime(str, fmt)` — formatting/parsing.
  - `timedelta(days=, hours=)` — arithmetic (e.g., "cert expires in < 30 days").
  - `.isoformat()` — standard interchange format for logs/APIs.
- **Production example — certificate expiry check:**
  ```python
  from datetime import datetime, timezone, timedelta

  def is_expiring_soon(expiry: datetime, days: int = 30) -> bool:
      now = datetime.now(timezone.utc)
      return expiry - now < timedelta(days=days)
  ```
- **Common mistakes:** Mixing naive and aware datetimes (raises `TypeError` on comparison — a very common bug); assuming server local time equals UTC across multi-region EC2/EKS deployments.
- **Best practice:** Store and compare all timestamps in UTC; convert to local time only at display/reporting layer.
- **Interview angle:** Senior explains why naive datetimes are a production hazard in distributed systems spanning regions/hosts with different local timezones.

### 🔥 Rapid Fire
- Q: `==` vs `is`? → `==` compares value; `is` compares identity — always use `is None`, never `== None`.
- Q: Why is `in` faster on a `set` than a `list`? → O(1) average (hash lookup) vs O(n) (linear scan).
- Q: `int("72.5")` — what happens? → Raises `ValueError` — must convert to `float` first, then `int()`.

## Phase 3 – Data Structures

> Basic list/tuple/set/dict fundamentals live in Phase 2 (Core Syntax) — this phase covers the `collections` module (advanced/composite data structures) to avoid duplicating the Phase 2 content.

*(collections, defaultdict, Counter, deque, namedtuple, ChainMap)*

### collections.defaultdict
- Dict subclass that auto-creates a default value for missing keys — eliminates `if key not in dict:` boilerplate.
- DevOps use: grouping EC2 instances by AZ: `groups = defaultdict(list); groups[instance["AZ"]].append(instance)`.

### collections.Counter
- Dict subclass for counting hashable items. `Counter(log_levels).most_common(5)` — quickly find the 5 most frequent error types in a log file.

### collections.deque
- Double-ended queue, O(1) appends/pops from both ends (vs O(n) for `list.insert(0, ...)`). Used for sliding-window log tailing (`deque(maxlen=100)` keeps only the last 100 lines) and BFS-style traversal (e.g., walking a dependency graph of Terraform modules).

### collections.namedtuple
- Lightweight immutable, tuple-based record type with named fields — simpler alternative to a full class or `@dataclass` when you just need a small immutable record.
  ```python
  from collections import namedtuple
  Instance = namedtuple("Instance", ["id", "state", "az"])
  ```
- **When to prefer `dataclass` instead:** when you need mutability, methods, or default values — `namedtuple` is best for simple, immutable, tuple-like records.

### collections.ChainMap
- Groups multiple dicts into a single view, checked in order — useful for layered configuration resolution (e.g., CLI args → env vars → config file → defaults) without manually merging dicts.
  ```python
  config = ChainMap(cli_args, os.environ, file_config, defaults)
  ```
- **Interview angle:** Senior gives the `ChainMap` config-precedence pattern as a clean alternative to nested `dict.get(..., dict.get(..., default))` chains.

### 🔥 Rapid Fire
- Q: `defaultdict` vs regular `dict`? → `defaultdict` auto-creates a default value for missing keys, avoiding manual existence checks.
- Q: When would you use `deque` over `list`? → When you need O(1) appends/pops from *both* ends (list is O(n) at the front).
- Q: `namedtuple` vs `dataclass`? → `namedtuple` is simpler/immutable; `dataclass` supports mutability, defaults, and methods.

## Phase 4 – Control Flow

*(if/elif/else, match-case, for, while, break, continue, pass, enumerate, zip)*

### Control flow decision diagram
```
                ┌────────────┐
   condition ──►│  if cond:  │── True ──► run block A
                └────────────┘
                       │ False
                       ▼
                ┌────────────┐
                │ elif cond2:│── True ──► run block B
                └────────────┘
                       │ False
                       ▼
                ┌────────────┐
                │   else:    │────────► run block C
                └────────────┘
```

### if / elif / else
- Standard conditional branching. Python uses indentation (no braces) — a common source of subtle bugs when mixing tabs/spaces (configure editor to use spaces only).
- Truthiness: `0`, `""`, `[]`, `{}`, `None`, `False` are all falsy — used heavily in DevOps scripts (`if not response.get("Items"): ...`).
- **Basic example:**
  ```python
  disk_usage = 92

  if disk_usage >= 90:
      status = "CRITICAL"
  elif disk_usage >= 75:
      status = "WARNING"
  else:
      status = "OK"

  print(status)   # CRITICAL
  ```
- **DevOps example — truthiness check on an API response:**
  ```python
  instances = ec2.describe_instances().get("Reservations")

  if not instances:                      # empty list is falsy
      print("No instances found")
  else:
      print(f"{len(instances)} reservation(s) found")
  ```

### match-case (Python 3.10+)
- Structural pattern matching — Python's version of a `switch` statement, but more powerful (can match on structure/type, not just value).
- **Example — dispatching on AWS event type in a Lambda handler:**
  ```python
  match event["detail-type"]:
      case "EC2 Instance State-change Notification":
          handle_ec2_event(event)
      case "ECR Image Action":
          handle_ecr_event(event)
      case _:
          logging.warning(f"Unhandled event type: {event['detail-type']}")
  ```
- **Interview angle:** Senior notes it requires Python ≥3.10 — relevant when CMG pipelines pin older base images that may not support it.

### for / while / break / continue / pass
- `for` iterates over any iterable (list, dict, generator, file object).
- `while` — condition-based looping; used for polling patterns (e.g., "wait until EKS node group is ACTIVE").
- `break` exits the loop entirely; `continue` skips to the next iteration; `pass` is a no-op placeholder (stub functions/classes during development).
- **for...else / while...else:** the `else` block runs only if the loop completes without hitting `break` — useful for "search and not found" patterns, though often considered less readable than an explicit flag.
- **Basic `for` example:**
  ```python
  namespaces = ["dev", "staging", "prod"]
  for ns in namespaces:
      print(f"Checking namespace: {ns}")
  ```
- **`while` polling example — wait for an EKS node group to become ACTIVE:**
  ```python
  import time

  while True:
      status = get_nodegroup_status()
      if status == "ACTIVE":
          print("Node group ready")
          break
      elif status == "CREATE_FAILED":
          raise RuntimeError("Node group creation failed")
      time.sleep(10)   # poll every 10s
  ```
- **`break` / `continue` / `pass` example:**
  ```python
  for pod in pods:
      if pod["status"] == "Terminating":
          continue                 # skip terminating pods, don't count them
      if pod["status"] == "CrashLoopBackOff":
          alert(pod)
          break                    # stop at first critical failure
      pass                         # placeholder for future per-pod logic
  ```
- **for...else example — search pattern:**
  ```python
  for instance in instances:
      if instance["State"]["Name"] == "running":
          print("Found a running instance")
          break
  else:
      print("No running instances found")   # only runs if break never hit
  ```

### enumerate
- `enumerate(iterable, start=0)` — yields `(index, value)` pairs; avoids manual counter variables.
- **Example:**
  ```python
  with open("deploy.log") as f:
      for lineno, line in enumerate(f, start=1):
          if "ERROR" in line:
              print(f"Line {lineno}: {line.strip()}")
  ```

### zip
- `zip(iter1, iter2, ...)` — pairs up multiple iterables element-wise, stops at the shortest.
- **Example:**
  ```python
  instance_ids = ["i-001", "i-002", "i-003"]
  instance_types = ["t3.medium", "t3.large", "m5.xlarge"]

  for iid, itype in zip(instance_ids, instance_types):
      print(f"{iid}: {itype}")
  ```
- **Common mistake:** Forgetting `zip` truncates silently at the shortest iterable — use `itertools.zip_longest` if lengths may differ and that's unintended.
  ```python
  from itertools import zip_longest
  for iid, itype in zip_longest(instance_ids, instance_types, fillvalue="UNKNOWN"):
      print(iid, itype)
  ```

### 🔥 Rapid Fire
- Q: Does `zip()` error if iterables are different lengths? → No — it silently truncates to the shortest; use `zip_longest` if that's unintended.
- Q: `match-case` minimum Python version? → 3.10+.
- Q: `for...else` — when does `else` run? → Only if the loop completes without hitting `break`.

## Phase 5 – Functions

*(Syntax, Arguments, Return Values, *args, **kwargs, Lambda, Scope, Recursion, Decorators)*

### Syntax, Arguments, Return Values
- `def name(param: type = default) -> return_type:` — type hints are strongly recommended in production automation code (catches bugs early, self-documenting for tooling that others maintain).
- Positional vs keyword arguments; keyword-only args after `*`: `def deploy(name, *, dry_run=False):` forces `dry_run` to be passed by keyword — prevents accidental positional misuse in CLI wrapper functions.

### *args and **kwargs
- `*args` — variable positional args (tuple); `**kwargs` — variable keyword args (dict).
- DevOps use: generic wrapper functions around `subprocess`/`boto3` calls that need to forward arbitrary options:
  ```python
  def run_aws_cli(*args, **kwargs):
      cmd = ["aws"] + list(args)
      return subprocess.run(cmd, capture_output=True, text=True, **kwargs)
  ```

### Lambda
- Anonymous single-expression functions: `lambda x: x.get("state") == "running"`.
- Common use: `sorted(instances, key=lambda i: i["LaunchTime"])`, filter predicates.
- **Best practice:** Keep lambdas trivial (one expression); anything more complex should be a named function — readability matters more than brevity in production code.

### Scope (LEGB rule)
- Local → Enclosing → Global → Built-in resolution order.
- `global` and `nonlocal` keywords to modify outer-scope variables from within a function — generally avoided in production code (implicit state mutation is a debugging hazard); prefer explicit return values/class state.

### Recursion
- Function calling itself; Python has no tail-call optimization and a default recursion limit (`sys.getrecursionlimit()`, ~1000) — deep recursion (e.g., recursively walking a large S3 "directory" structure) can hit `RecursionError`. Prefer iterative approaches (`os.walk`, explicit stacks) for unbounded-depth DevOps tasks.

### Decorators
- Functions that wrap other functions to add behavior without modifying their code — heavily used in production DevOps tooling (retry logic, timing, logging, auth checks).
- **How it works (diagram):**
  ```
  @timed
  def deploy_service(name): ...

  is equivalent to:

  deploy_service = timed(deploy_service)

  Call flow:
  caller ──► wrapper() [in timed] ──► original deploy_service() ──► returns to wrapper ──► returns to caller
             (does timing before/after the real call)
  ```
- **Production example — timing decorator for pipeline stage functions:**
  ```python
  import functools, time, logging

  def timed(func):
      @functools.wraps(func)
      def wrapper(*args, **kwargs):
          start = time.perf_counter()
          result = func(*args, **kwargs)
          logging.info(f"{func.__name__} took {time.perf_counter() - start:.2f}s")
          return result
      return wrapper

  @timed
  def deploy_service(name):
      ...
  ```
- **Common mistake:** Forgetting `@functools.wraps(func)` — loses the original function's `__name__`/docstring, breaking introspection and some testing tools.
- **Interview angle:** Senior can explain decorators with arguments (`@retry(times=3)` — a decorator factory returning a decorator) and how `tenacity`'s `@retry` is built on this pattern.

### 🔥 Rapid Fire
- Q: What does `@functools.wraps` fix? → Preserves the wrapped function's `__name__`/docstring, which a plain decorator would otherwise overwrite.
- Q: `*args` vs `**kwargs`? → `*args` collects extra positional args as a tuple; `**kwargs` collects extra keyword args as a dict.
- Q: Why avoid deep recursion in DevOps scripts? → Python has no tail-call optimization and a default recursion limit (~1000) — prefer iteration for unbounded-depth tasks.

*(map, filter, reduce, any, all, sorted, comprehensions)*

### map / filter
- `map(func, iterable)` — apply a function to every item, returns an iterator (lazy in Python 3).
- `filter(func, iterable)` — keep only items where `func` returns truthy.
- **Modern best practice:** Comprehensions are generally preferred over `map`/`filter` in Python for readability: `[x.upper() for x in names]` over `list(map(str.upper, names))` — though `map`/`filter` are still common when passing existing named functions.

### functools.reduce
- `reduce(func, iterable, initial)` — folds an iterable down to a single value. Less commonly needed than `sum()`/`any()`/`all()` for typical DevOps aggregation — use those built-ins first when they fit.
  ```python
  from functools import reduce
  total_cost = reduce(lambda acc, i: acc + i["cost"], instances, 0)
  ```

### any / all
- `any(iterable)` — True if at least one element is truthy (short-circuits). `all(iterable)` — True only if every element is truthy (short-circuits on first False).
- DevOps use: `if any(pod["status"] == "CrashLoopBackOff" for pod in pods): alert()`.

### sorted
- `sorted(iterable, key=func, reverse=False)` — stable sort; `key` is the idiomatic way to sort complex objects (avoid writing custom comparator functions).
  ```python
  newest_first = sorted(instances, key=lambda i: i["LaunchTime"], reverse=True)
  ```

### Comprehensions
- List `[x for x in y]`, dict `{k: v for k, v in y}`, set `{x for x in y}`, generator `(x for x in y)`.
- **Best practice:** Keep comprehensions to one line of logic; nested comprehensions with multiple conditions hurt readability — fall back to a regular loop with clear variable names for complex filtering/transformation logic.
- **Interview angle:** Senior explains why comprehensions are typically faster than equivalent `for` loops with `.append()` (fewer bytecode operations, specialized implementation) — but readability should still win when logic gets complex.

## Phase 6 – Object-Oriented Programming

*(Classes, Objects, Constructors, Inheritance, Polymorphism, Encapsulation, Abstraction, Magic Methods, Dataclasses)*

### Classes, Objects, Constructors
- `class Name:` / `__init__(self, ...)` — constructor. `self` is the instance reference (explicit in Python, unlike implicit `this` in other languages).
- DevOps use: modeling a "deployment target" or "cluster" as an object instead of passing loose dicts/tuples around — improves readability in larger automation codebases.

### Inheritance & Polymorphism
- `class ECSDeployer(BaseDeployer):` — subclassing to share common deploy logic while overriding service-specific steps.
- Polymorphism: different classes implementing the same method name (`.deploy()`) so calling code doesn't need to know the concrete type — key pattern for supporting multiple deploy targets (ECS, EKS, Lambda) behind one interface.
- **Diagram:**
  ```
                  ┌────────────────┐
                  │  BaseDeployer   │   .deploy() -- abstract
                  └────────┬────────┘
           ┌───────────────┼───────────────┐
           ▼                ▼               ▼
   ┌───────────────┐ ┌──────────────┐ ┌──────────────────┐
   │  ECSDeployer   │ │  EKSDeployer  │ │  LambdaDeployer   │
   │ .deploy() →    │ │ .deploy() →   │ │ .deploy() →        │
   │ ECS-specific   │ │ kubectl/helm  │ │ update-function-   │
   │ logic          │ │ logic         │ │ code logic          │
   └───────────────┘ └──────────────┘ └──────────────────┘
  ```
- **Example:**
  ```python
  class BaseDeployer:
      def deploy(self, service):
          raise NotImplementedError

  class EKSDeployer(BaseDeployer):
      def deploy(self, service):
          subprocess.run(["helm", "upgrade", "--install", service, f"./charts/{service}"])

  class LambdaDeployer(BaseDeployer):
      def deploy(self, service):
          lambda_client.update_function_code(FunctionName=service, ...)

  for deployer in [EKSDeployer(), LambdaDeployer()]:
      deployer.deploy("cmg-api")   # same call, different behavior — polymorphism
  ```

### Encapsulation & Abstraction
- Python has no true "private" — convention only: `_protected` (internal use, still accessible) vs `__mangled` (name-mangled, harder to access accidentally).
- `abc.ABC` / `@abstractmethod` — enforce that subclasses implement required methods (e.g., a `BaseHealthCheck` abstract class requiring `.check()` in every concrete health checker).

### Magic Methods (Dunder Methods)
- `__init__`, `__repr__`, `__str__`, `__eq__`, `__len__`, `__enter__`/`__exit__` (context managers), `__call__`.
- **Production example — context manager for temporary kubeconfig switching:**
  ```python
  class KubeContext:
      def __init__(self, context_name):
          self.context_name = context_name
          self.previous = None

      def __enter__(self):
          self.previous = get_current_context()
          switch_context(self.context_name)
          return self

      def __exit__(self, exc_type, exc_val, exc_tb):
          switch_context(self.previous)

  with KubeContext("cmg-prod-eks"):
      run_kubectl_command(...)
  ```
- **Interview angle:** Senior explains `__enter__`/`__exit__` as the mechanism behind `with` blocks, and why this pattern is safer than manual try/finally for resource cleanup (guaranteed even on exception).

### Dataclasses
- `@dataclass` (stdlib, `dataclasses` module) — auto-generates `__init__`, `__repr__`, `__eq__` for data-holding classes, reducing boilerplate.
- **Example:**
  ```python
  from dataclasses import dataclass

  @dataclass
  class Instance:
      instance_id: str
      state: str
      instance_type: str
      tags: dict
  ```
- **Best practice:** Use dataclasses for structured data (API response models, config objects) instead of raw dicts when fields are known upfront — gives type checking and IDE autocomplete.
- **Common mistake:** Using a mutable default (`tags: dict = {}`) directly — raises `ValueError` in dataclasses; must use `field(default_factory=dict)`.

*(Singleton, Factory, Strategy, Observer, Builder, Dependency Injection)*

### Singleton
- Ensures only one instance of a class exists — e.g., a single shared `boto3` session/config object reused across a script instead of re-authenticating repeatedly. In Python, often implemented via a module-level instance (Python modules are already singletons on import) rather than classic OOP singleton boilerplate.
  ```python
  # config.py — module-level "singleton" (the Pythonic way)
  import boto3
  session = boto3.Session()   # created once, imported everywhere as `from config import session`
  ```
  ```python
  # Classic OOP singleton, if a class-based approach is specifically required
  class ClusterConfig:
      _instance = None
      def __new__(cls):
          if cls._instance is None:
              cls._instance = super().__new__(cls)
          return cls._instance
  ```

### Factory
- A function/class that creates objects of different types based on input — e.g., `get_deployer(target_type)` returning an `ECSDeployer`, `EKSDeployer`, or `LambdaDeployer` instance based on config, without the calling code needing to know the concrete class.
  ```python
  def get_deployer(target_type: str):
      deployers = {
          "ecs": ECSDeployer,
          "eks": EKSDeployer,
          "lambda": LambdaDeployer,
      }
      deployer_cls = deployers.get(target_type)
      if not deployer_cls:
          raise ValueError(f"Unknown deploy target: {target_type}")
      return deployer_cls()

  deployer = get_deployer("eks")
  deployer.deploy(service="cmg-api")
  ```

### Strategy
- Encapsulates interchangeable algorithms behind a common interface — e.g., different alerting strategies (`SlackAlert`, `EmailAlert`, `PagerDutyAlert`) all implementing `.send(message)`, swappable at runtime based on severity/config.
  ```python
  class SlackAlert:
      def send(self, message): requests.post(SLACK_WEBHOOK, json={"text": message})

  class PagerDutyAlert:
      def send(self, message): trigger_pagerduty_incident(message)

  def notify(strategy, message):
      strategy.send(message)   # caller doesn't care which concrete strategy it is

  notify(PagerDutyAlert() if severity == "CRITICAL" else SlackAlert(), "Disk usage at 92%")
  ```

### Observer
- Objects subscribe to events and get notified on state changes — relevant conceptually to event-driven automation (EventBridge-triggered Lambdas are effectively an AWS-managed observer pattern); rarely hand-rolled in typical DevOps scripts but useful to recognize in architecture discussions.
  ```python
  class DeploymentEvent:
      def __init__(self):
          self._subscribers = []
      def subscribe(self, fn):
          self._subscribers.append(fn)
      def notify(self, status):
          for fn in self._subscribers:
              fn(status)

  event = DeploymentEvent()
  event.subscribe(lambda status: send_slack_message(f"Deploy status: {status}"))
  event.subscribe(lambda status: update_dashboard(status))
  event.notify("SUCCESS")   # both subscribers fire
  ```

### Builder
- Constructs complex objects step-by-step instead of one large constructor call — useful for building up complex Kubernetes manifests or Terraform variable sets programmatically with many optional pieces.
  ```python
  class ManifestBuilder:
      def __init__(self):
          self._manifest = {"apiVersion": "apps/v1", "kind": "Deployment", "spec": {}}
      def with_name(self, name):
          self._manifest.setdefault("metadata", {})["name"] = name
          return self
      def with_replicas(self, count):
          self._manifest["spec"]["replicas"] = count
          return self
      def build(self):
          return self._manifest

  manifest = ManifestBuilder().with_name("cmg-api").with_replicas(3).build()
  ```

### Dependency Injection
- Pass dependencies (AWS clients, config, loggers) into functions/classes rather than hardcoding them inside — makes code testable (swap real `boto3` client for a mock in tests, Phase 17) and reusable across environments (dev/staging/prod clients passed in rather than baked in).
  ```python
  class Ec2Inventory:
      def __init__(self, ec2_client):   # injected, not created internally
          self.ec2 = ec2_client

      def list_running(self):
          return self.ec2.describe_instances(Filters=[...])
  ```
- **Interview angle:** Senior explains dependency injection specifically as *why* their automation code is testable with `moto`/`mock` — patterns aren't academic, they're the reason the testing strategy in Phase 17 works cleanly.

### Pattern selection at a glance
```
Need one shared resource/config?         → Singleton
Need to create different object types
  based on runtime input?                → Factory
Need interchangeable algorithms
  swappable at runtime?                  → Strategy
Need multiple listeners reacting
  to one event?                          → Observer
Need to construct a complex object
  step-by-step with optional parts?      → Builder
Need testable code that doesn't
  hardcode its own dependencies?         → Dependency Injection
```

### 🔥 Rapid Fire
- Q: `__init__` vs `__new__`? → `__new__` creates the instance; `__init__` initializes it after creation (relevant for singleton patterns).
- Q: What enforces that subclasses implement a method? → `abc.ABC` + `@abstractmethod`.
- Q: Why use `field(default_factory=dict)` in a dataclass instead of `= {}`? → Mutable defaults shared across instances are a classic bug; dataclasses raise an error to force the safe pattern.

## Phase 7 – Modules & Packages

*(import, from-import, Standard Library, Custom Modules, Packages, __init__.py, Virtual Environments)*

### import / from-import
- `import module` vs `from module import name` vs `import module as alias`.
- **Best practice:** Avoid `from module import *` in production code — pollutes namespace, breaks readability/tooling (can't tell where a name came from).

### Standard Library vs Custom Modules
- Python's stdlib is deliberately extensive ("batteries included") — always check stdlib before reaching for a pip package (e.g., use `json`/`csv`/`logging` before third-party alternatives unless there's a clear gap stdlib doesn't cover, like `requests` or `boto3`).

### Packages & `__init__.py`
- A **package** is a directory containing an `__init__.py` (can be empty) — makes the directory importable as a namespace.
- Since Python 3.3, "namespace packages" (no `__init__.py` required) exist, but explicit `__init__.py` is still the clearer, more common convention for internal automation repos.
- **Production project layout:**
  ```
  automation/
  ├── __init__.py
  ├── aws/
  │   ├── __init__.py
  │   ├── ec2.py
  │   └── s3.py
  └── k8s/
      ├── __init__.py
      └── inventory.py
  ```
  ```python
  from automation.aws.ec2 import list_running_instances
  ```

### Virtual Environments (cross-ref)
- Covered in Phase 1 — packages/modules are resolved from whichever environment is active (`.venv`), which is why CI pipelines must always activate/reference the correct venv explicitly rather than relying on system Python.

### Interview angle
- Senior explains the difference between a **module** (single `.py` file) and a **package** (directory of modules with `__init__.py`), and how Python resolves imports via `sys.path` — relevant when debugging `ModuleNotFoundError` in CI containers where `PYTHONPATH` isn't set as expected.

### 🔥 Rapid Fire
- Q: Module vs package? → Module = single `.py` file; package = a directory of modules with `__init__.py`.
- Q: Why avoid `from module import *`? → Pollutes the namespace — unclear where names came from, breaks tooling/readability.
- Q: What causes `ModuleNotFoundError` in a CI container but not locally? → Usually `PYTHONPATH`/venv activation differences between local shell and the CI image.

## Phase 8 – File Handling

> `sqlite3` moved to Phase 19 (Database & Data Handling) to match the new taxonomy.

*(Reading/Writing Files, JSON, YAML, CSV, XML, ConfigParser, pathlib, shutil, tempfile)*

### json

- **What it is:** Standard library module for encoding/decoding JSON.
- **Why needed in DevOps:** Nearly every cloud API (AWS CLI `--output json`, Kubernetes API, Jenkins REST API) speaks JSON; also used for structured logging.
- **Key API:**
  - `json.load(fp)` / `json.loads(str)` — parse.
  - `json.dump(obj, fp, indent=2)` / `json.dumps(obj)` — serialize.
  - `json.JSONDecodeError` — malformed JSON handling.
- **CMG example:** Parsing `aws ecr describe-images --output json` output (via `subprocess`) to find untagged images for cleanup.
- **Common mistakes:** Assuming keys always exist (`data["key"]` vs `data.get("key")`); not handling `JSONDecodeError` on external API responses.
- **Best practice:** Use `json.dumps(obj, default=str)` to safely serialize datetime/Decimal objects from boto3 responses.

### csv

- **What it is:** Standard library module for reading/writing CSV files.
- **Why needed in DevOps:** Inventory exports (EC2 inventory, IAM audit reports), bulk input for automation scripts.
- **Key API:**
  - `csv.reader()` / `csv.writer()` — basic row-based I/O.
  - `csv.DictReader()` / `csv.DictWriter()` — column-name based, preferred for readability.
- **Production example:**
  ```python
  import csv

  with open("ec2_inventory.csv", "w", newline="") as f:
      writer = csv.DictWriter(f, fieldnames=["instance_id", "state", "type"])
      writer.writeheader()
      for i in instances:
          writer.writerow(i)
  ```
- **Common mistakes:** Forgetting `newline=""` on `open()` on Windows (extra blank rows); not handling embedded commas/quotes manually — let the `csv` module do escaping.

### shutil

- **What it is:** Standard library module for high-level file operations (copy, move, archive, disk usage).
- **Why needed in DevOps:** Backup automation, artifact staging, cleanup of build workspaces.
- **Key API:**
  - `shutil.copy2(src, dst)` — copy with metadata.
  - `shutil.move(src, dst)`
  - `shutil.rmtree(path)` — recursive delete (dangerous — always guard with existence/path checks).
  - `shutil.make_archive("backup", "gztar", "source_dir")` — tarball creation for backups.
  - `shutil.disk_usage(path)`
- **Security consideration:** `rmtree` on a user/variable-derived path without validation is a classic destructive-bug source — always validate the path is within an expected root before deleting.

### PyYAML

- **What it is:** Third-party (pip) library for parsing/emitting YAML — `import yaml`.
- **Why needed in DevOps:** Kubernetes manifests, Helm values files, Ansible playbooks, GitHub Actions/GitLab CI configs — YAML is the DevOps lingua franca.
- **Key API:**
  - `yaml.safe_load(fp)` — **always use `safe_load`**, never `yaml.load()` without a `Loader` (arbitrary code execution risk via unsafe deserialization).
  - `yaml.safe_dump(obj, default_flow_style=False)`
- **Production example — patching a Helm values file programmatically:**
  ```python
  import yaml

  with open("values.yaml") as f:
      values = yaml.safe_load(f)

  values["image"]["tag"] = new_tag
  values["replicaCount"] = desired_replicas

  with open("values.yaml", "w") as f:
      yaml.safe_dump(values, f, default_flow_style=False, sort_keys=False)
  ```
- **Security consideration:** `yaml.load()` without `Loader=yaml.SafeLoader` can execute arbitrary Python objects embedded in the YAML — a known CVE-class issue. Interview red flag if a candidate doesn't mention this.

### pathlib

- **What it is:** Standard library object-oriented filesystem path API (modern replacement for `os.path`).
- **Why needed in DevOps:** Cleaner, cross-platform path handling in newer scripts/tooling.
- **Key API:**
  - `Path("dir") / "file.txt"` — path joining via `/` operator.
  - `.exists()`, `.is_file()`, `.is_dir()`, `.mkdir(parents=True, exist_ok=True)`
  - `.glob("*.yaml")`, `.rglob("**/*.tf")` — pattern matching (e.g., finding all Terraform files in a repo).
  - `.read_text()`, `.write_text()`
- **Best practice:** Prefer `pathlib` over `os.path` in all new code; keep `os.path` only when interfacing with older libraries that expect strings.

### 🔥 Rapid Fire
- Q: `yaml.load()` vs `yaml.safe_load()`? → `safe_load` is mandatory in production — plain `load()` can execute arbitrary objects embedded in YAML.
- Q: Why `newline=""` when opening a CSV file for writing? → Prevents extra blank rows on Windows.
- Q: `os.path` vs `pathlib`? → `pathlib` is the modern, object-oriented, cross-platform-friendly choice for new code.

## Phase 9 – Error Handling & Logging

*(try/except/else/finally, raise, Assertions, Custom Exceptions, Logging Exceptions)*

### Exception flow diagram
```
┌───────────┐   error?   ┌────────────┐          ┌───────────┐
│   try:    │──── Yes ──►│  except:   │─────────►│ finally:  │
│  (risky   │            │  (handle)  │          │ (always   │
│   code)   │            └────────────┘          │  runs)    │
└─────┬─────┘                                    └───────────┘
      │ No error
      ▼
┌───────────┐                                    ┌───────────┐
│   else:   │───────────────────────────────────►│ finally:  │
│(no error  │                                    │ (always   │
│ path)     │                                    │  runs)    │
└───────────┘                                    └───────────┘
```

### try / except / else / finally
- `try:` (risky code) → `except SpecificError:` (handle) → `else:` (runs only if no exception) → `finally:` (always runs — cleanup).
- **Best practice:** Catch specific exceptions (`botocore.exceptions.ClientError`, `subprocess.CalledProcessError`), never bare `except:` — swallows `KeyboardInterrupt`/`SystemExit` too and hides real bugs.
- **Production example:**
  ```python
  try:
      result = subprocess.run(cmd, capture_output=True, text=True, check=True, timeout=60)
  except subprocess.CalledProcessError as e:
      logging.error(f"Command failed: {e.stderr}")
      raise
  except subprocess.TimeoutExpired:
      logging.error("Command timed out")
      raise
  finally:
      cleanup_temp_files()
  ```

### The 4 categories of exceptions (interview framing)
1. **Syntax errors** — `SyntaxError`, `IndentationError` — code doesn't even run; caught before execution, not by `try/except`.
2. **Standard/runtime exceptions** — `ValueError`, `TypeError`, `KeyError`, `IndexError`, `AttributeError` — the most common category in everyday automation scripts (bad API response shape, wrong type passed to a function).
3. **System-level exceptions** — `MemoryError`, `RecursionError`, `SystemExit`, `KeyboardInterrupt` — these inherit from `BaseException`, not `Exception`, which is exactly why `except Exception:` (not bare `except:`) is the correct broad catch — it won't accidentally swallow `SystemExit`/`KeyboardInterrupt`.
4. **Custom/user-defined exceptions** — your own classes extending `Exception` (see below) — used to model domain-specific failures (`DeploymentError`, `HelmTimeoutError`) so callers can handle them precisely.

### raise
- `raise` re-raises the current exception (preserves traceback — always prefer this over `raise e` inside an `except` block, which resets the traceback origin).
- `raise NewError("msg") from original_error` — exception chaining, preserves the causal context for debugging.

### Assertions
- `assert condition, "message"` — for internal invariants/debugging, **not** for validating external input (assertions are stripped when Python runs with `-O` optimization flag — never rely on them for security or production validation logic).

### Custom Exceptions
- Define domain-specific exception hierarchies for clearer error handling upstream:
  ```python
  class DeploymentError(Exception):
      """Base exception for deployment failures."""

  class HelmTimeoutError(DeploymentError):
      pass

  class ImageNotFoundError(DeploymentError):
      pass
  ```
- **Why it matters:** Callers can catch `DeploymentError` broadly or specific subtypes narrowly — critical for Jenkins pipeline stages that need different retry/alerting behavior per failure type.

### Logging Exceptions
- `logging.exception("message")` (inside an `except` block) — automatically includes the traceback, better than `logging.error(str(e))` which loses stack context.
- **Interview angle:** Senior explains the difference between `except Exception as e: logging.error(e)` (loses traceback) vs `logging.exception(...)` (captures full traceback) — a frequent real-world debugging pain point.

*(logging module, Log Levels, Log Rotation, Structured Logging, JSON Logs, Production Logging)*

### logging

- **What it is:** Standard library logging framework — loggers, handlers, formatters, filters.
- **Why needed in DevOps:** `print()` doesn't scale — production automation needs levels, timestamps, rotation, and structured output that feeds into CloudWatch/ELK.
- **Key concepts:**
  - Levels (ascending severity): `DEBUG < INFO < WARNING < ERROR < CRITICAL`.
  - `logging.getLogger(__name__)` — module-scoped loggers, never the root logger directly in library code.
  - Handlers: `StreamHandler` (console), `FileHandler`, `RotatingFileHandler`, `TimedRotatingFileHandler`.
  - Formatters: control output shape, including JSON for log aggregation.
- **Production example — JSON structured logging for CloudWatch ingestion:**
  ```python
  import logging, json, sys

  class JsonFormatter(logging.Formatter):
      def format(self, record):
          return json.dumps({
              "timestamp": self.formatTime(record),
              "level": record.levelname,
              "logger": record.name,
              "message": record.getMessage(),
          })

  logger = logging.getLogger("cmg-automation")
  handler = logging.StreamHandler(sys.stdout)
  handler.setFormatter(JsonFormatter())
  logger.addHandler(handler)
  logger.setLevel(logging.INFO)
  ```
- **Common mistakes:** Using `print()` in production scripts; calling `logging.basicConfig()` multiple times (no-op after first call, a common source of "why isn't my config applying" bugs); logging secrets/tokens at INFO/DEBUG level.
- **Best practice:** One log line per event, structured (JSON) in production so it's queryable in CloudWatch Logs Insights; use `RotatingFileHandler` for any long-running daemon to avoid disk exhaustion.
- **Security consideration:** Never log full IAM credentials, API tokens, or PII — mask/redact before logging.
- **Interview angle:** Senior explains logger hierarchy/propagation (`__name__`-based loggers vs root), and why `basicConfig()` being a no-op on repeat calls trips up engineers migrating from simpler scripts.

### 🔥 Rapid Fire
- Q: `except Exception as e: logging.error(e)` vs `logging.exception(...)`? → `logging.exception()` (inside an `except` block) captures the full traceback; the first loses it.
- Q: Why avoid a bare `except:`? → Swallows `KeyboardInterrupt`/`SystemExit` too, hiding real bugs — always catch specific exceptions.
- Q: What are Python's 4 broad exception categories? → Syntax errors, standard/runtime exceptions, system-level exceptions (`BaseException` subclasses), and custom/user-defined exceptions.

## Phase 10 – Iterators & Generators

*(Iterator, Generator, yield, Generator Expressions, Lazy Evaluation)*

### Iterators
- Any object implementing `__iter__`/`__next__`. `for` loops work on anything iterable under the hood via this protocol.

### Generators & yield
- A function using `yield` instead of `return` becomes a generator — produces values lazily, one at a time, without holding the entire sequence in memory.
- **Production example — streaming a huge log file without loading it fully into memory:**
  ```python
  def read_large_log(path):
      with open(path) as f:
          for line in f:
              if "ERROR" in line:
                  yield line.strip()

  for error_line in read_large_log("/var/log/app/huge.log"):
      process(error_line)
  ```
- **Why it matters in DevOps:** Processing multi-GB logs, paginated AWS API results, or streaming `kubectl logs -f` output — generators keep memory flat regardless of input size.

### Generator Expressions
- `(x for x in items if cond)` — like a list comprehension but lazy (parentheses instead of brackets); doesn't build the full list in memory.
- Use with `sum()`, `any()`, `all()` for memory-efficient aggregation: `any(i["state"] == "running" for i in instances)` short-circuits on the first match without scanning everything if not needed.

### Lazy Evaluation
- Core benefit: work is deferred until actually needed — critical when processing data that may be very large or when short-circuiting saves real work (e.g., stopping an inventory scan the moment a match is found).
- **Interview angle:** Senior explains generators vs list comprehensions trade-off: memory (generators win for large/streamed data) vs re-iterability (lists can be iterated multiple times, generators are exhausted after one pass — a common bug source when a generator is accidentally consumed once and reused).

### 🔥 Rapid Fire
- Q: Can you iterate a generator twice? → No — it's exhausted after one pass; a list can be iterated any number of times.
- Q: Why use a generator for a huge log file instead of `.readlines()`? → Flat memory usage — processes one line at a time instead of loading the whole file.
- Q: Generator expression syntax? → Parentheses `(x for x in y)`, vs brackets `[x for x in y]` for a list comprehension.

## Phase 11 – Regular Expressions

*(Pattern Matching, Groups, Lookahead, Lookbehind, Common DevOps Regex)*

### re

- **What it is:** Standard library regular expression engine.
- **Why needed in DevOps:** Parsing log lines, validating image tags/version strings, extracting fields from CLI tool output that isn't structured JSON.
- **Key API:**
  - `re.match()` vs `re.search()` vs `re.fullmatch()` — anchoring differences (a common interview trip-up).
  - `re.findall()`, `re.finditer()`
  - `re.sub(pattern, repl, text)` — replacement (e.g., masking secrets in logs).
  - `re.compile(pattern)` — precompile when reused in a loop (performance).
  - Named groups: `(?P<name>...)` for readable extraction.
- **Production example — extracting failed pod names from `kubectl` output:**
  ```python
  import re

  pattern = re.compile(r"^(?P<pod>[\w-]+)\s+\d/\d\s+CrashLoopBackOff")
  failed_pods = [m.group("pod") for line in output.splitlines()
                 if (m := pattern.match(line))]
  ```
- **Common mistakes:** Using `re.match()` expecting full-string match (it only anchors at the start, not the end — use `fullmatch()` for that); not escaping special characters in dynamically built patterns (`re.escape()`); catastrophic backtracking from poorly written patterns on large log files (a real production incident class — "ReDoS").
- **Best practice:** Precompile patterns used inside loops/log parsers; prefer structured output (`--output json`) over regex-parsing CLI text when the tool supports it — regex is the fallback, not the first choice.
- **Interview angle:** Senior discusses ReDoS risk and why regex-parsing untrusted/unbounded log input needs bounded quantifiers or a timeout guard.

### 🔥 Rapid Fire
- Q: `re.match()` vs `re.search()`? → `match()` only anchors at the start of the string; `search()` finds a match anywhere.
- Q: Why precompile a regex pattern used inside a loop? → Performance — avoids recompiling the same pattern on every iteration.
- Q: What's ReDoS? → Catastrophic backtracking from a poorly written pattern on large/adversarial input — a real production incident class.

## Phase 12 – Concurrency & Parallelism

*(threading, multiprocessing, concurrent.futures, asyncio)*

### threading
- Threads share memory; useful for **I/O-bound** work (network calls, file I/O) — but the **GIL (Global Interpreter Lock)** means only one thread executes Python bytecode at a time, so threading does **not** speed up CPU-bound work.
- DevOps use: checking health of 50 microservice endpoints concurrently via threads (I/O-bound → threading helps a lot here).
- **Common mistake:** Using raw `threading.Thread` for CPU-bound tasks (e.g., hashing/compressing large files) and being confused why there's no speedup — that's a GIL limitation.

### multiprocessing
- Spawns separate OS processes, each with its own Python interpreter and memory — bypasses the GIL, so it's the right tool for **CPU-bound** parallelism (e.g., parallel checksum verification of many large artifacts).
- `multiprocessing.Pool(processes=4).map(func, items)` — straightforward parallel map pattern.
- **Trade-off:** Higher memory/startup overhead than threads; inter-process communication is more complex (must pickle data).

### concurrent.futures
- Unified high-level API over both: `ThreadPoolExecutor` (I/O-bound) and `ProcessPoolExecutor` (CPU-bound) — **the recommended modern entry point** for most DevOps parallelism needs instead of raw `threading`/`multiprocessing`.
- **Production example — parallel health checks across many endpoints:**
  ```python
  from concurrent.futures import ThreadPoolExecutor, as_completed

  def check_health(url):
      return url, requests.get(url, timeout=5).status_code

  with ThreadPoolExecutor(max_workers=10) as executor:
      futures = {executor.submit(check_health, url): url for url in service_urls}
      for future in as_completed(futures):
          url, status = future.result()
          print(f"{url}: {status}")
  ```

### asyncio
- Single-threaded cooperative concurrency via coroutines (`async def`/`await`) — best for very high-volume I/O-bound work (thousands of concurrent connections) where thread-per-task overhead would be too costly.
- Requires an async-compatible library (`aiohttp`/`httpx` instead of `requests`, which is synchronous).
- **When to use which (interview-critical distinction):**
  | Workload | Tool |
  |---|---|
  | CPU-bound (hashing, compression, data processing) | `multiprocessing` / `ProcessPoolExecutor` |
  | I/O-bound, moderate concurrency (tens–hundreds) | `threading` / `ThreadPoolExecutor` |
  | I/O-bound, very high concurrency (thousands) | `asyncio` |
- **Interview angle:** Senior explains the GIL precisely (why it exists, that it's per-process not per-interpreter as of newer sub-interpreter work in later Python versions) and picks the right concurrency tool per workload type rather than defaulting to threads for everything.

### 🔥 Rapid Fire
- Q: Does threading speed up CPU-bound Python code? → No — the GIL means only one thread executes Python bytecode at a time; use `multiprocessing` instead.
- Q: `concurrent.futures` — what does it unify? → `ThreadPoolExecutor` (I/O-bound) and `ProcessPoolExecutor` (CPU-bound) behind one API.
- Q: When does `asyncio` beat `ThreadPoolExecutor`? → Very high concurrency (thousands of connections) where thread-per-task overhead is too costly.

## Phase 13 – Networking & APIs

*(socket, HTTP/HTTPS, REST APIs, requests, urllib, DNS, SSL)*

### requests

- **What it is:** Third-party (pip) HTTP client library — the de facto standard for REST API calls in Python (wraps `urllib3`).
- **Why needed in DevOps:** Calling internal/external REST APIs — Jenkins REST API, ArgoCD, Slack webhooks, ECR/Trivy scan result APIs, health-check endpoints.
- **Key API:**
  - `requests.get/post/put/delete(url, headers=, params=, json=, timeout=)`
  - `.status_code`, `.json()`, `.text`, `.raise_for_status()`
  - `requests.Session()` — connection reuse + shared auth headers for repeated calls.
  - `requests.exceptions.Timeout`, `.ConnectionError`, `.HTTPError`
- **Production example — Jenkins job trigger + poll:**
  ```python
  import requests, time

  def trigger_and_wait(base_url, job, token, auth):
      resp = requests.post(f"{base_url}/job/{job}/build",
                            auth=auth, timeout=10)
      resp.raise_for_status()
      queue_url = resp.headers["Location"] + "api/json"

      while True:
          q = requests.get(queue_url, auth=auth, timeout=10).json()
          if "executable" in q:
              return q["executable"]["url"]
          time.sleep(2)
  ```
- **Common mistakes:** No `timeout` set (hangs pipeline indefinitely on network stalls); not calling `raise_for_status()` and silently continuing on 4xx/5xx; reusing plain `requests.get` in a loop instead of a `Session` (extra TCP/TLS overhead).
- **Security consideration:** Never disable TLS verification (`verify=False`) in production; store API tokens in Secrets Manager/environment, never hardcoded.
- **Best practice:** Wrap calls with retry logic (see `tenacity` in Phase 14) for transient network failures — standard in CI/CD glue scripts.
- **Interview angle:** Senior explains difference between `requests` (sync, simple) and `httpx`/`aiohttp` (async) and when async matters — e.g., polling many endpoints concurrently vs a single sequential Jenkins call.

### socket
- **What it is:** Standard library low-level networking (raw TCP/UDP) — the layer everything else (including `requests`) is built on.
- **Why needed in DevOps:** Rarely used directly for API calls (use `requests`), but essential for port-availability checks and raw TLS certificate inspection.
- **Example — check if a port is open before deploying (dependency check):**
  ```python
  import socket

  def is_port_open(host, port, timeout=3):
      with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
          s.settimeout(timeout)
          return s.connect_ex((host, port)) == 0

  if not is_port_open("db.internal.cmg", 5432):
      raise RuntimeError("Database unreachable — aborting deploy")
  ```

### urllib
- Standard library HTTP client — the stdlib predecessor to `requests`, with a much less ergonomic API (`urllib.request.urlopen`). Mentioned mainly so it's recognized in legacy scripts; new code should always use `requests` (or `httpx` for async).

### DNS
- Python resolves DNS through the OS resolver via `socket.gethostbyname(host)` — useful for pre-flight checks (does this hostname resolve before an automation script tries to hit it) or building custom health checks that verify DNS propagation after a Route53 change.
  ```python
  import socket
  try:
      ip = socket.gethostbyname("api.cmg.internal")
  except socket.gaierror:
      print("DNS resolution failed")
  ```

### SSL
- `ssl` module (stdlib) — used with `socket` to fetch/inspect certificate details.
- **Example — fetch and check certificate expiry (feeds the cert-expiry-checker automation project):**
  ```python
  import ssl, socket
  from datetime import datetime, timezone

  def get_cert_expiry(hostname, port=443):
      ctx = ssl.create_default_context()
      with ctx.wrap_socket(socket.socket(), server_hostname=hostname) as s:
          s.connect((hostname, port))
          cert = s.getpeercert()
          expiry_str = cert["notAfter"]
          return datetime.strptime(expiry_str, "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
  ```
- **Security consideration:** `requests` handles TLS verification automatically via the `ssl` module underneath — never set `verify=False` in production (Phase 21).

### 🔥 Rapid Fire
- Q: `requests` vs `urllib`? → `requests` is the ergonomic modern standard; `urllib` is stdlib but far more verbose — use it only when adding a dependency isn't possible.
- Q: How do you check if a port is open in Python? → `socket.socket().connect_ex((host, port)) == 0`.
- Q: Why check DNS resolution before hitting an API in automation? → Fails fast with a clear error instead of a confusing connection timeout deep in the script.

## Phase 14 – Automation & Scripting

> `paramiko` moved to Phase 16 (Infrastructure Automation) — SSH automation belongs there per the new taxonomy.

*(Shell Commands, subprocess, os, pathlib, signal, psutil, cron, systemd)*

### os

- **What it is:** Standard library interface to OS-level operations (env vars, paths, processes, permissions).
- **Why needed in DevOps:** Almost every automation script touches paths, env vars, or file permissions — `os` is the base layer under higher tools like `shutil`/`pathlib`.
- **Key functions:**
  - `os.environ.get("VAR")` — read env vars (e.g. reading `KUBECONFIG`, `AWS_PROFILE` in Jenkins agents).
  - `os.path.join()`, `os.path.exists()`, `os.makedirs(path, exist_ok=True)`
  - `os.listdir()`, `os.walk()` — directory traversal for log/artifact scanning.
  - `os.chmod()`, `os.chown()` — permission management on deployment artifacts.
  - `os.getpid()`, `os.kill()` — process control.
  - `os.system()` — legacy shell execution; **avoid in production**, use `subprocess` instead.
- **CMG use case:** Reading IAM role/env context injected into Jenkins agents before invoking `aws`/`kubectl` CLI wrappers.
- **Common mistakes:** Using `os.system()` for anything with untrusted input (shell injection); hardcoding path separators instead of `os.path.join`/`pathlib`.
- **Best practice:** Prefer `pathlib.Path` for new code; keep `os` for env vars and process-level calls.
- **Interview angle (junior vs senior):** Junior explains `os.getcwd()`. Senior explains why `os.system()` is a security risk (shell injection, no output capture) vs `subprocess.run(shell=False)`.

### subprocess

- **What it is:** Standard module to spawn and manage child processes (replacement for `os.system`, `os.popen`, `commands`).
- **Why needed in DevOps:** Core mechanism for wrapping CLI tools — `kubectl`, `helm`, `terraform`, `aws`, `docker`, `trivy` — from Python automation.
- **Key API:**
  - `subprocess.run(cmd_list, capture_output=True, text=True, check=True, timeout=30)` — the modern, recommended entry point.
  - `subprocess.Popen()` — for streaming output / long-running processes.
  - `shell=False` (default, and default **should stay** False) vs `shell=True` (only with trusted, sanitized input).
  - `.returncode`, `.stdout`, `.stderr` — result inspection.
  - Exceptions: `subprocess.CalledProcessError`, `subprocess.TimeoutExpired`.
- **Production example (CMG-style):**
  ```python
  import subprocess, logging

  def run_helm_upgrade(release, chart, namespace, values_file):
      cmd = ["helm", "upgrade", "--install", release, chart,
             "-n", namespace, "-f", values_file, "--wait", "--timeout", "5m"]
      try:
          result = subprocess.run(cmd, capture_output=True, text=True,
                                   check=True, timeout=360)
          logging.info(result.stdout)
          return result.returncode
      except subprocess.CalledProcessError as e:
          logging.error(f"Helm upgrade failed: {e.stderr}")
          raise
      except subprocess.TimeoutExpired:
          logging.error("Helm upgrade timed out")
          raise
  ```
- **Common mistakes:** Using `shell=True` with string-concatenated user input (command injection); not setting `timeout` (hung pipeline stages); swallowing `stderr` silently.
- **Security consideration:** Always pass commands as a list, never build shell strings from unsanitized input — critical when wrapping Jenkins parameters.
- **Interview angle:** Senior answers explain `shell=True` injection risk with a concrete exploit example, and why `check=True` + explicit exception handling is preferred over checking `returncode` manually everywhere.

### psutil

- **What it is:** Third-party (pip) cross-platform library for system/process monitoring (CPU, memory, disk, network, processes).
- **Why needed in DevOps:** Building custom health checks, disk-space monitors, and process watchdogs where existing monitoring tooling isn't granular enough.
- **Key API:**
  - `psutil.cpu_percent(interval=1)`
  - `psutil.virtual_memory().percent`
  - `psutil.disk_usage('/').percent`
  - `psutil.net_io_counters()`
  - `psutil.process_iter(['pid', 'name', 'memory_percent'])` — iterate running processes.
  - `psutil.pid_exists(pid)`, `psutil.Process(pid).kill()`
- **Production example — disk monitor for EC2-hosted legacy apps (Siebel/WebSphere):**
  ```python
  import psutil, sys

  THRESHOLD = 85
  usage = psutil.disk_usage("/").percent
  if usage > THRESHOLD:
      print(f"CRITICAL: disk usage at {usage}%")
      sys.exit(2)
  print(f"OK: disk usage at {usage}%")
  ```
- **Common mistakes:** Calling `cpu_percent()` without an interval gives a meaningless instant reading (returns 0.0 on first call).
- **Best practice:** Pair with `logging` + exit codes so scripts integrate cleanly into Nagios/cron/SSM-based health checks.
- **Interview angle:** Senior explains why `psutil` is used *alongside* Prometheus/CloudWatch, not instead of — for ad hoc/legacy-host checks where an exporter isn't deployed (e.g. bare EC2 Siebel boxes).

### signal
- **What it is:** Standard library module for handling OS signals (`SIGTERM`, `SIGINT`, etc.) inside a running Python process.
- **Why needed in DevOps:** Graceful shutdown handling — a long-running automation daemon or a Kubernetes pod receiving `SIGTERM` (during a rolling deploy/scale-down) needs to finish in-flight work and clean up before the process is killed.
  ```python
  import signal, sys

  def handle_sigterm(signum, frame):
      print("SIGTERM received — finishing current task, then exiting")
      cleanup()
      sys.exit(0)

  signal.signal(signal.SIGTERM, handle_sigterm)
  ```
- **Interview angle:** Senior explains why containers/K8s pods without a `SIGTERM` handler get hard-killed after the grace period (`terminationGracePeriodSeconds`) — potential data loss/incomplete work if the app doesn't handle the signal.

### cron (scheduling Python scripts)
- Python itself has no built-in scheduler for OS-level periodic execution — that's `cron`'s job (or, on CMG, **EventBridge Scheduler** triggering a Lambda/ECS task instead of a crontab entry on a box).
- Pattern: crontab entry invokes a script inside its venv explicitly (cron runs with a minimal environment, so `PATH`/venv activation must be explicit):
  ```
  */15 * * * * /opt/cmg-automation/.venv/bin/python /opt/cmg-automation/health_check.py >> /var/log/health_check.log 2>&1
  ```
- **Common mistake:** Assuming cron has the same `PATH`/env vars as an interactive shell — a very common "works when I run it manually, fails under cron" bug; always use absolute paths and explicit venv Python.

### systemd
- For long-running Python daemons (not periodic — always-on), a `systemd` unit is the standard way to manage the process (auto-restart on crash, start on boot, log capture via journald) rather than `nohup`/manual backgrounding.
  ```ini
  # /etc/systemd/system/cmg-watcher.service
  [Unit]
  Description=CMG deployment watcher
  After=network.target

  [Service]
  ExecStart=/opt/cmg-automation/.venv/bin/python /opt/cmg-automation/watcher.py
  Restart=on-failure
  User=cmgapp

  [Install]
  WantedBy=multi-user.target
  ```
- **Interview angle:** Senior picks the right execution model — one-off script (manual/CI-triggered), periodic (cron/EventBridge Scheduler), or long-running daemon (systemd/Kubernetes Deployment) — rather than defaulting to one pattern for everything.

### 🔥 Rapid Fire
- Q: How does a Python process handle graceful shutdown on `SIGTERM`? → Register a handler via `signal.signal(signal.SIGTERM, handler)` that cleans up and exits.
- Q: Why does a script that works manually fail under cron? → Cron runs with a minimal environment — no `PATH`/venv activation; always use absolute paths.
- Q: cron vs systemd — when to use which? → cron/EventBridge Scheduler for periodic tasks; systemd (or a Kubernetes Deployment) for always-on daemons that need auto-restart.

*(Log Analyzer, Health Checker, Disk Monitor, EC2 Inventory, Kubernetes Inventory, Cert Expiry Checker, Backup Automation, IAM Auditor, Cost Optimizer, Security Scanner, Deployment Automation)*

Each project below is built entirely from modules already documented above — listed here as an index of what to combine, not new content, to avoid duplication.

| Project | Core modules used |
|---|---|
| Log Analyzer | `re`, `collections.Counter`, `logging`, generators (Phase 10) for streaming large files |
| Health Checker | `requests`, `concurrent.futures.ThreadPoolExecutor`, `psutil` for host-level checks |
| Disk Monitor | `psutil`, `logging`, exit codes for cron/Nagios integration |
| EC2 Inventory | `boto3` (paginated `describe_instances`), `csv`/`json` export, `dataclasses` for structured records |
| Kubernetes Inventory | `kubernetes` Python client, `csv`/`json` export |
| Certificate Expiry Checker | `ssl`/`socket` (Phase 13) to fetch cert, `datetime`/`timedelta` for expiry math |
| Backup Automation | `shutil.make_archive`, `boto3` (S3 upload), `datetime` for naming/retention |
| IAM Auditor | `boto3` (`iam` client — list users/roles/policies), flag unused credentials via `datetime` comparisons |
| Cost Optimizer | `boto3` (Cost Explorer API, EC2/EBS inventory), flag idle/oversized/untagged resources |
| Security Scanner | `subprocess` wrapping Trivy/Bandit, `json` parsing of scan reports (pattern shown in Phase 22) |
| Deployment Automation | `subprocess` (`helm`/`kubectl`) or `kubernetes` client + `boto3`, tied together with `logging` and custom exceptions (Phase 9) |

**Design pattern common to all of these (senior-level expectation):**
1. Fetch/collect data (API call or file read).
2. Parse into structured objects (`dataclass`, not raw dicts, once the script grows past a few dozen lines).
3. Apply a rule/threshold.
4. Log structured output (Phase 9) and exit with a meaningful code for CI/cron integration.
5. Alert (Slack webhook via `requests`) on failure conditions.

> _Full worked implementations of each project will be added as dedicated sections once source scripts/notes are supplied — this index prevents duplicating the module-level documentation already written above._

*(Packaging, Versioning, Dependency Management, Configuration Management, Logging, Monitoring, Deployment, Best Practices)*

### Additional recommended DevOps modules

These aren't in the original phase list but come up constantly in real DevOps/platform tooling — added here so nothing important is missing.

- **argparse** *(stdlib)* — building CLI tools for internal automation scripts (`--namespace`, `--dry-run` flags). Precursor to `click`.
- **click** *(pip)* — higher-level CLI framework; decorator-based, better UX (auto help text, nested commands) than `argparse` for larger internal tools.
- **python-dotenv** *(pip)* — loads `.env` files into environment variables for local dev; **never used to load real secrets in production** — Secrets Manager/Parameter Store fill that role there.
- **tenacity** *(pip)* — declarative retry logic (`@retry(stop=stop_after_attempt(3), wait=wait_exponential())`) — standard for wrapping flaky network/API calls (`requests`, `boto3`) instead of hand-rolled retry loops.
- **jinja2** *(pip)* — templating engine; used to generate Kubernetes manifests, Helm values, or config files from Python data (Ansible itself is built on Jinja2 under the hood).
- **kubernetes** *(pip, "Python client")* — official Kubernetes API client; used instead of shelling out to `kubectl` when you need typed, structured cluster automation (covered fully in Phase 16).
- **docker** *(pip, Docker SDK for Python)* — programmatic control of the Docker Engine API — build/push/inspect images without shelling out to the `docker` CLI (covered fully in Phase 16).
- **schedule** / **APScheduler** *(pip)* — in-process job scheduling for lightweight recurring tasks where a full EventBridge Scheduler / cron isn't warranted (e.g., local dev, short-lived sidecar jobs).
- **rich** *(pip)* — nicer terminal output (tables, progress bars, colored logs) for interactive CLI tooling — improves engineer UX on internal scripts.
- **hashlib** *(stdlib)* — checksums/hashing (`sha256`) for verifying artifact/image integrity before deployment.
- **argcomplete** *(pip)* — shell autocompletion for `argparse`-based CLI tools, nice-to-have for internal tooling adoption.

> _Interview angle: a senior candidate should be able to justify **why** they'd reach for a third-party module (`click`, `tenacity`) over the stdlib equivalent — usually: readability, less boilerplate, and fewer hand-rolled bugs (e.g., retry/backoff logic is easy to get subtly wrong by hand)._

## Phase 15 – Cloud SDKs

*(boto3, IAM, EC2, S3, Lambda, ECS, EKS, CloudWatch, Auto Scaling, Secrets Manager, Parameter Store)*

### boto3

- **What it is:** AWS's official Python SDK — programmatic access to every AWS service API.
- **Why needed in DevOps:** The standard tool for AWS automation beyond what CLI/Terraform cover — custom EC2/S3/IAM scripts, Lambda functions, EventBridge-triggered automation.
- **Key concepts:**
  - `boto3.client("s3")` — low-level, maps 1:1 to API calls.
  - `boto3.resource("s3")` — higher-level, object-oriented (fewer services support this).
  - Session/credential resolution order: explicit params → env vars → shared credentials file → IAM role (instance profile / IRSA on EKS) — **on CMG, IAM-scoped Jenkins agents and EKS IRSA mean credentials should never be hardcoded.**
  - Pagination: `client.get_paginator("list_objects_v2")` — required for any API that can return >1 page (S3 objects, EC2 instances).
  - Waiters: `client.get_waiter("instance_running").wait(...)` — polling helper for async AWS operations.
- **Production example — S3 lifecycle cleanup script:**
  ```python
  import boto3
  from datetime import datetime, timezone, timedelta

  s3 = boto3.client("s3")
  paginator = s3.get_paginator("list_objects_v2")

  cutoff = datetime.now(timezone.utc) - timedelta(days=90)
  for page in paginator.paginate(Bucket="cmg-build-artifacts"):
      for obj in page.get("Contents", []):
          if obj["LastModified"] < cutoff:
              s3.delete_object(Bucket="cmg-build-artifacts", Key=obj["Key"])
  ```
- **Common mistakes:** Not paginating (silently processing only the first 1000 S3 objects/EC2 instances); catching `Exception` broadly instead of `botocore.exceptions.ClientError` and inspecting `.response["Error"]["Code"]`; hardcoding AWS keys instead of relying on IAM roles.
- **Security consideration:** Least-privilege IAM policies per script/Lambda; never commit AWS credentials; prefer IRSA (IAM Roles for Service Accounts) for EKS workloads over static keys.
- **Interview angle:** Senior explains the credential resolution chain in depth and why IRSA/instance-profile-based auth is preferred in a CMG-style EKS + Jenkins environment over static access keys — plus how to handle `ClientError` codes like `Throttling`/`RequestLimitExceeded` with backoff (boto3 has built-in retry config via `Config(retries={"mode": "adaptive"})`).

### Service-specific patterns (IAM / EC2 / S3 / Lambda)

**IAM**
```python
iam = boto3.client("iam")
# Audit: find access keys older than 90 days (rotation hygiene)
for user in iam.list_users()["Users"]:
    for key in iam.list_access_keys(UserName=user["UserName"])["AccessKeyMetadata"]:
        age = (datetime.now(timezone.utc) - key["CreateDate"]).days
        if age > 90:
            print(f"{user['UserName']}: key {key['AccessKeyId']} is {age} days old")
```
- **Best practice:** Prefer roles over long-lived IAM users/keys wherever possible — a recurring senior-level security talking point.

**EC2**
```python
ec2 = boto3.client("ec2")
paginator = ec2.get_paginator("describe_instances")
for page in paginator.paginate(Filters=[{"Name": "instance-state-name", "Values": ["running"]}]):
    for reservation in page["Reservations"]:
        for instance in reservation["Instances"]:
            print(instance["InstanceId"], instance["InstanceType"])
```

**S3**
```python
s3 = boto3.client("s3")
# Upload with server-side encryption enforced
s3.upload_file("report.csv", "cmg-reports", "2026-07/report.csv",
                ExtraArgs={"ServerSideEncryption": "aws:kms"})
```
- **Interview angle:** Senior always sets `ServerSideEncryption` explicitly rather than relying only on a bucket policy — defense in depth.

**Lambda**
```python
lam = boto3.client("lambda")
lam.update_function_code(FunctionName="cmg-cert-checker", ZipFile=open("function.zip", "rb").read())
lam.invoke(FunctionName="cmg-cert-checker", InvocationType="Event")  # async invoke
```
- **Common mistake:** Using `InvocationType="RequestResponse"` (synchronous, default) when the caller doesn't need the result — blocks unnecessarily and risks timeout; use `"Event"` for fire-and-forget automation triggers.

### 🔥 Rapid Fire
- Q: Why prefer IAM roles over access keys? → No long-lived credentials to leak/rotate; scoped, time-limited, auditable via CloudTrail.
- Q: Lambda invoke types? → `RequestResponse` (sync, waits for result) vs `Event` (async, fire-and-forget) vs `DryRun` (validate only).
- Q: How do you avoid only getting page 1 of EC2/S3 results? → Use the paginator (`get_paginator`), never assume a single API call returns everything.

## Phase 16 – Infrastructure Automation with Python

*(kubernetes Python client, YAML Automation, Helm Automation, CRDs, Operators, Cluster Automation)*

### kubernetes Python client (`pip install kubernetes`)
- **What/why:** Official client for the Kubernetes API — typed, structured cluster automation instead of shelling out to `kubectl` + parsing text/JSON via `subprocess`.
- **Key API:**
  ```python
  from kubernetes import client, config

  config.load_kube_config()  # or config.load_incluster_config() when running inside a pod
  v1 = client.CoreV1Api()
  pods = v1.list_namespaced_pod(namespace="cmg-prod")
  for pod in pods.items:
      print(pod.metadata.name, pod.status.phase)
  ```
- **In-cluster vs local auth:** `load_incluster_config()` uses the pod's mounted ServiceAccount token — the pattern for a Python automation job running as a Kubernetes CronJob/Job inside the CMG EKS cluster; `load_kube_config()` is for local/CI use against a kubeconfig context.
- **When to still shell out to `kubectl`/`helm`:** For one-off imperative operations or when a feature isn't cleanly exposed by the client, wrapping the CLI via `subprocess` (Phase 14) is often simpler and matches what's already tested/documented — the client library shines for structured, repeated automation (custom controllers, inventory scripts, bespoke health checks).

### YAML Automation
- Cross-ref: **Phase 8 → PyYAML** — the standard way to programmatically generate/patch Kubernetes manifests and Helm values before applying them.

### Helm Automation
- Typically via `subprocess` wrapping the `helm` CLI (Phase 14 pattern) since there's no official Python Helm SDK — e.g., the `helm upgrade --install` example in Phase 14.

### CRDs & Operators
- Custom Resource Definitions are just Kubernetes API objects under the hood — the Python client's `CustomObjectsApi` can create/read/patch them like any other resource.
- Writing a full **Operator** in Python (vs Go, the ecosystem-standard language) is uncommon in production but viable for simple reconciliation loops using frameworks like `kopf` — worth mentioning as an interview talking point (trade-off: Python is faster to write, Go/Kubebuilder is the ecosystem norm with more mature tooling).

### Cluster Automation — production pattern
- Combine `boto3` (EKS cluster/node group state) + `kubernetes` client (in-cluster resources) for end-to-end automation, e.g., a script that checks node group health via `boto3` and then verifies pod scheduling via the Kubernetes client — a realistic CMG-style cross-service automation task.
- **Interview angle:** Senior explains when to use the typed client vs `subprocess` + `kubectl`, and the in-cluster vs local kubeconfig auth distinction — a frequent practical gap for candidates who've only used `kubectl` manually.

*(Terraform Automation, HCL Parsing, Terraform Cloud API, cdktf Overview)*

### Terraform Automation via Python
- Terraform itself isn't Python — Python's role is **orchestration around** Terraform: wrapping `terraform plan`/`apply` via `subprocess` (Phase 14 pattern), parsing plan output (`terraform show -json` → structured JSON, parse with the `json` module rather than regexing text output), and gating applies on custom policy checks before they run.
- **Production example — parsing a Terraform plan for destructive changes before allowing auto-apply:**
  ```python
  import subprocess, json

  result = subprocess.run(
      ["terraform", "show", "-json", "tfplan"],
      capture_output=True, text=True, check=True
  )
  plan = json.loads(result.stdout)
  destroys = [c for c in plan.get("resource_changes", [])
              if "delete" in c["change"]["actions"]]
  if destroys:
      raise RuntimeError(f"{len(destroys)} resource(s) would be destroyed — blocking auto-apply")
  ```

### HCL Parsing
- HCL isn't JSON/YAML, so parsing `.tf` files directly requires a dedicated library (e.g., `python-hcl2`) — generally only needed for static analysis/linting tooling, not for routine deploy automation (which should use `terraform show -json` on the **plan**, not parse source `.tf` files).

### Terraform Cloud/Enterprise API
- REST API for remote state, runs, and workspace management — automate via `requests` (Phase 13), e.g., triggering a run or reading workspace outputs programmatically for use in downstream Python automation (like feeding a VPC ID into a `boto3` script).

### cdktf (Cloud Development Kit for Terraform)
- Lets you define infrastructure in Python (or TS/Go) instead of HCL, synthesizing to Terraform JSON under the hood.
- **Trade-off (interview-relevant):** cdktf gives you real programming constructs (loops, functions, type checking) but adds a build/synth step and a smaller ecosystem/community than native HCL — most orgs (CMG included, based on stack) stick with native HCL + Python for surrounding orchestration rather than adopting cdktf wholesale.

*(Docker SDK, Image Automation, Container Management, Registry Automation)*

### Docker SDK for Python (`pip install docker`)
- **What/why:** Programmatic control of the Docker Engine API — build, run, inspect, and manage containers/images without shelling out to the `docker` CLI via `subprocess`.
- **Key API:**
  ```python
  import docker

  client = docker.from_env()
  image, logs = client.images.build(path=".", tag="cmg-app:latest")
  container = client.containers.run("cmg-app:latest", detach=True, ports={"8080/tcp": 8080})
  print(container.logs())
  ```
- **When to use the SDK vs `subprocess` + `docker` CLI:** The SDK gives structured Python objects and avoids text-parsing CLI output — better for building internal tooling (dashboards, custom build orchestrators). For simple, well-tested CI pipeline steps, shelling out to `docker build`/`docker push` via `subprocess` is often simpler and matches what's already documented/debuggable by the team — cross-ref Phase 14 `subprocess` patterns.

### Image Automation
- Tagging strategy automation (e.g., generating `git-sha`-based tags), multi-arch build orchestration, and pruning old images — typically combining the Docker SDK (local operations) with `boto3` (ECR registry operations, Phase 15) for a full CMG-style pipeline: build → scan (Trivy) → tag → push to ECR.

### Container Management
- `client.containers.list()`, `.stop()`, `.remove()`, `.stats()` — used for local dev tooling or custom health-check daemons; production container orchestration on CMG is EKS/Kubernetes-driven (Phase 16), not raw Docker SDK container management.

### Registry Automation
- Cross-ref **Phase 15 → boto3** for ECR-specific operations (`describe-images`, lifecycle policies, untagged image cleanup) — the Docker SDK handles the *local engine*, boto3 handles the *ECR registry* side of the same pipeline.
- **Interview angle:** Senior clearly separates these two concerns — Docker SDK talks to the local Docker daemon; ECR/registry management is an AWS API concern handled via boto3 — a common conflation point for less experienced candidates.

> _Full Docker fundamentals (Dockerfile, layers, multi-stage builds, networking, volumes) live in the separate Docker Handbook — this phase covers only the **Python automation layer** around Docker to avoid duplicating that content._

### Ansible custom modules
- Ansible itself is Python under the hood — custom modules are Python scripts following a specific contract: read JSON input from a temp file/stdin, perform the action, print a JSON result (`{"changed": bool, "msg": str, ...}`) to stdout.
  ```python
  from ansible.module_utils.basic import AnsibleModule

  def main():
      module = AnsibleModule(argument_spec=dict(name=dict(type="str", required=True)))
      # ... perform the actual work ...
      module.exit_json(changed=True, msg=f"Configured {module.params['name']}")

  if __name__ == "__main__":
      main()
  ```
- **Why needed:** When a required action has no existing Ansible module and shelling out via the `command`/`shell` module would break idempotency — a custom module lets you implement proper check-mode/idempotency support.
- **Cross-ref:** Full Ansible playbook/role content lives in the separate Ansible Handbook — this section covers only the Python module-authoring layer.

### Fabric
- **What it is:** Third-party (pip) high-level SSH command execution library, built on Paramiko (Phase 14) — simpler API for running commands across multiple remote hosts.
  ```python
  from fabric import Connection

  result = Connection("ec2-legacy-01.cmg.internal").run("systemctl status siebel", warn=True)
  print(result.stdout)
  ```
- **When to use vs raw Paramiko:** Fabric for straightforward multi-host command execution/deployment tasks; raw Paramiko when you need finer control (SFTP specifics, custom channel handling).
- **CMG note:** Same caveat as Paramiko — SSM Session Manager is the preferred, audited path where the SSM agent is available; Fabric/SSH is the fallback for hosts that aren't SSM-managed.

### Pulumi
- Infrastructure-as-code using real programming languages (Python included) instead of a DSL — conceptually similar to `cdktf` (Phase 16, Terraform section) but Pulumi is its own IaC engine/state backend rather than synthesizing to Terraform.
  ```python
  import pulumi_aws as aws

  bucket = aws.s3.Bucket("cmg-reports", server_side_encryption_configuration={...})
  ```
- **Interview angle (Pulumi vs cdktf vs native Terraform HCL):** Pulumi = full IaC engine with native language support; cdktf = Python/TS syntax that still compiles down to Terraform's engine/state/providers; native HCL = the ecosystem default with the largest provider/module ecosystem. Most orgs stick with native HCL unless there's a strong reason (team's language preference, need for real programming constructs) to adopt one of the code-first alternatives.

### Invoke
- Third-party (pip) task-execution library — Python's answer to `make`, used as Fabric's task-running foundation and standalone for defining project automation tasks (`invoke deploy`, `invoke test`) in a `tasks.py` file instead of a Makefile or ad hoc shell scripts.
  ```python
  # tasks.py
  from invoke import task

  @task
  def deploy(c, env="staging"):
      c.run(f"helm upgrade --install cmg-api ./charts/api -n {env}")
  ```
  Run via: `invoke deploy --env=prod`

### 🔥 Rapid Fire
- Q: Fabric vs raw Paramiko? → Fabric is a higher-level, simpler API built on Paramiko for common multi-host SSH tasks; drop to Paramiko for finer control.
- Q: Pulumi vs cdktf? → Pulumi is its own full IaC engine with native language support; cdktf synthesizes to Terraform's existing engine/state/providers.
- Q: What contract must an Ansible custom module follow? → Read JSON input, perform the action, emit a JSON result via `module.exit_json()`/`module.fail_json()`, supporting check-mode/idempotency where possible.

### paramiko

- **What it is:** Third-party (pip) SSH2 protocol library — pure-Python SSH client/server implementation.
- **Why needed in DevOps:** Automating SSH-based tasks against hosts that aren't reachable via SSM Session Manager, or for legacy EC2 boxes without the SSM agent.
- **Key API:**
  - `paramiko.SSHClient()`, `.set_missing_host_key_policy(paramiko.AutoAddPolicy())`
  - `.connect(host, username, key_filename=...)`
  - `.exec_command(cmd)` → `(stdin, stdout, stderr)`
  - `paramiko.SFTPClient` — file transfer.
- **CMG note:** On CMG, SSM Session Manager is the preferred, audited access path — `paramiko` is documented here as a fallback/legacy-integration pattern, not the primary approach.
- **Security consideration:** Never use `AutoAddPolicy()` in production without host-key pinning; store SSH keys in Secrets Manager, not on disk in plaintext.
- **Interview angle:** Senior explains trade-off — SSM Session Manager avoids open SSH ports and gives IAM-based audit trails, which is why it's preferred over raw `paramiko`/SSH in a hardened AWS estate.

## Phase 17 – Testing

*(unittest, pytest, mock, Integration Testing, API Testing, Coverage, CI Testing)*

### unittest
- Stdlib testing framework (`import unittest`, classes extending `unittest.TestCase`, `assertEqual`/`assertRaises` etc.). Verbose compared to `pytest` but requires no dependency — sometimes used for small, dependency-free scripts.

### pytest
- The de facto standard third-party test framework — plain `assert` statements, fixtures (`@pytest.fixture`), parametrization (`@pytest.mark.parametrize`), better failure output than `unittest`.
  ```python
  import pytest

  @pytest.mark.parametrize("usage,threshold,expected", [
      (90, 85, True), (50, 85, False),
  ])
  def test_disk_alert(usage, threshold, expected):
      assert (usage > threshold) == expected
  ```

### mock / unittest.mock
- Replace real dependencies (AWS calls, subprocess calls, network requests) with fakes during testing — essential for DevOps automation, since real tests shouldn't actually call AWS or run `kubectl` against production.
- `moto` (pip) — mocks the entire boto3/AWS API surface for realistic AWS automation testing without touching real infrastructure; `unittest.mock.patch` for mocking `subprocess.run` calls to test wrapper functions in isolation.
  ```python
  from unittest.mock import patch

  @patch("subprocess.run")
  def test_helm_upgrade_success(mock_run):
      mock_run.return_value.returncode = 0
      assert run_helm_upgrade("release", "chart", "ns", "values.yaml") == 0
  ```

### Integration Testing
- Tests against real (but non-production) infrastructure — e.g., a dedicated test EKS namespace/AWS account — necessarily slower and less frequent than unit tests; typically run in a separate CI stage, not on every commit.

### API Testing
- `requests` (or `pytest` + `responses`/`httpx` mocking) to test API wrapper functions against known request/response fixtures without hitting the real service every run.

### Coverage
- `coverage.py` / `pytest-cov` — measures which lines/branches are exercised by tests. **Best practice:** track coverage trend, don't chase 100% blindly — untested error-handling branches for rare AWS API failures are often more valuable to add than trivial getter tests.

### CI Testing
- `pytest` + `pytest-cov` as a required Jenkins/GitHub Actions pipeline stage, failing the build below a coverage threshold or on any test failure — mirrors the Trivy/Bandit security gates in Phase 21.
- **Interview angle:** Senior explains why `moto`/mocking matters specifically for infra automation code — tests must never have side effects on real AWS/Kubernetes resources, and slow/flaky "integration-only" testing strategies don't scale in CI.

### 🔥 Rapid Fire
- Q: Why use `moto` instead of hitting real AWS in tests? → Tests must never have side effects on real infrastructure — `moto` mocks the entire boto3 API surface.
- Q: `pytest` vs `unittest`? → `pytest` uses plain `assert`, has fixtures/parametrization, and better failure output; `unittest` is stdlib but more verbose.
- Q: Should you chase 100% test coverage? → No — track the trend; untested error-handling branches for rare failures are often more valuable than trivial getter tests.

## Phase 18 – Packaging & Distribution

### setuptools / pyproject.toml
- Modern Python packaging is `pyproject.toml`-based (PEP 517/518) — `setup.py` alone is legacy. Minimal example:
  ```toml
  [build-system]
  requires = ["setuptools>=68"]
  build-backend = "setuptools.build_meta"

  [project]
  name = "cmg-automation"
  version = "1.2.0"
  dependencies = ["boto3>=1.34", "requests>=2.31", "PyYAML>=6.0"]

  [project.scripts]
  cmg-inventory = "cmg_automation.cli:main"   # installs a CLI entry point
  ```
- **Why it matters in DevOps:** Turns an internal automation repo into a proper installable package (`pip install cmg-automation`) instead of engineers copy-pasting scripts between machines/pipelines.

### wheel
- The standard **built** distribution format (`.whl`) — installs faster than a source dist (`.tar.gz`) since no build step runs at install time. `python -m build` (via the `build` package) produces both from a `pyproject.toml` project.

### Publishing internally
- Most orgs (CMG included, given the AWS-centric stack) publish to a private index — **AWS CodeArtifact** is the natural fit: `pip install --index-url <codeartifact-url> cmg-automation`. Public PyPI publishing uses `twine upload dist/*` — not relevant for internal tooling.

### Semantic Versioning (semver)
- `MAJOR.MINOR.PATCH` — MAJOR = breaking change, MINOR = backward-compatible feature, PATCH = backward-compatible fix. Consuming teams pin `~=1.2.0` (compatible release) or exact `==1.2.0` in their `requirements.txt`/`pyproject.toml` depending on how much drift they're willing to accept automatically.

### Entry points
- `[project.scripts]` (shown above) exposes a Python function as a shell command after install — this is how a `pip install`-ed automation package becomes a real CLI tool (`cmg-inventory --namespace prod`) rather than requiring `python path/to/script.py`.

### Docker packaging (cross-ref)
- For automation that needs to run identically in Jenkins/CI regardless of host Python version, packaging as a **container image** (multi-stage `Dockerfile` installing the wheel) is often preferred over relying on the CI agent's system Python — see Phase 16 for the Docker automation layer.

### 🔥 Rapid Fire
- Q: Difference between `setup.py` and `pyproject.toml`? → `pyproject.toml` is the modern, declarative, PEP 517/518-standard way; `setup.py` is legacy/imperative.
- Q: What's a wheel? → A pre-built distribution format — faster install, no build step at install time, vs a source `.tar.gz`.
- Q: How do internal teams share a Python tool without PyPI? → Private index (e.g. AWS CodeArtifact) or an internal Git-installable package (`pip install git+https://...`).
- Q: What does `[project.scripts]` do? → Registers a CLI entry point so an installed package becomes a runnable shell command.

## Phase 19 – Database & Data Handling

> `sqlite3` below was moved from the old File Handling phase. SQLAlchemy, Postgres/MySQL drivers, and pandas are now added below.

### sqlite3

- **What it is:** Standard library embedded SQL database — no server process required.
- **Why needed in DevOps:** Lightweight local state store for automation tools (e.g., tracking processed items, local cache of audit results) where a full RDS/Postgres isn't justified.
- **Key API:**
  - `sqlite3.connect("state.db")`
  - `conn.execute("INSERT INTO ... VALUES (?, ?)", (a, b))` — always parameterize, never f-string SQL.
  - `conn.commit()`, context-manager usage (`with sqlite3.connect(...) as conn:`)
- **Common mistakes:** String-formatting SQL queries (SQL injection risk even in local tools); not closing connections in long-running scripts (file lock contention).
- **Interview angle:** Senior explains when `sqlite3` is appropriate (single-writer, local, low-concurrency state) vs when it's the wrong tool (multi-process writers, needs concurrent access — use Postgres/DynamoDB instead).

### SQLAlchemy
- **What it is:** The standard Python ORM/SQL toolkit — works with Postgres, MySQL, SQLite, and more through one API (Core for raw SQL-like queries, ORM for object-mapped tables).
- **Why needed in DevOps:** When automation needs to talk to a real application database (e.g., a CMDB, a metadata store for deployment history) rather than a flat file/sqlite.
- **Example (Core, not ORM — simpler for scripts):**
  ```python
  from sqlalchemy import create_engine, text

  engine = create_engine("postgresql://user:pass@host:5432/cmdb")
  with engine.connect() as conn:
      result = conn.execute(text("SELECT id, status FROM deployments WHERE env = :env"),
                             {"env": "prod"})
      for row in result:
          print(row.id, row.status)
  ```
- **Best practice:** Connection string credentials come from Secrets Manager (Phase 21), never hardcoded; use connection pooling (`create_engine(..., pool_size=5)`) for long-running services, not one-off scripts.

### Postgres / MySQL drivers
- `psycopg2` / `psycopg` (Postgres), `PyMySQL`/`mysqlclient` (MySQL) — the underlying DB-API drivers SQLAlchemy uses under the hood; can also be used directly for simple scripts that don't need an ORM layer.
- **Interview angle:** Senior explains why they'd reach for raw `psycopg2` in a small automation script (less overhead, more control) vs SQLAlchemy in a larger app (portability across DB engines, ORM conveniences).

### pandas (for ops/reporting scripts)
- **What it is:** Third-party (pip) data analysis library — DataFrames for tabular data manipulation.
- **Why needed in DevOps:** Turning a CSV/JSON export (EC2 inventory, cost reports, audit results) into a filtered/aggregated summary report without hand-writing loops.
  ```python
  import pandas as pd

  df = pd.read_csv("ec2_inventory.csv")
  by_type = df.groupby("instance_type")["monthly_cost"].sum().sort_values(ascending=False)
  print(by_type.head(10))
  df.to_excel("cost_report.xlsx", index=False)
  ```
- **When it's overkill:** For a handful of rows or a one-off filter, `csv`/`dict` comprehensions (Phase 2/8) are simpler — pandas earns its overhead on genuinely large/complex tabular analysis, not trivial scripts.

### 🔥 Rapid Fire
- Q: `sqlite3` vs SQLAlchemy? → `sqlite3` is a specific embedded DB; SQLAlchemy is a toolkit/ORM that works across many DB engines including sqlite.
- Q: When is pandas overkill? → Small/simple filtering tasks — plain `csv`/dict comprehensions are simpler and have no extra dependency.
- Q: Where do DB credentials come from in production scripts? → Secrets Manager/Parameter Store, never hardcoded connection strings.

## Phase 20 – Performance & Best Practices

### PEP 8 & Linting
- **PEP 8** is Python's official style guide (naming, spacing, line length). Enforced automatically via linters, not manually reviewed line-by-line in production teams.
- **flake8** — combines pycodestyle (PEP 8 checks) + pyflakes (logical errors like unused imports) + complexity checks. **pylint** — more thorough/opinionated, slower, more configuration surface. Most modern teams pick one and run it in CI as a required gate (alongside Bandit from Phase 21).

### Type Hints & mypy
- Type hints (`def deploy(name: str, replicas: int = 3) -> bool:`) don't affect runtime behavior — they're for tooling (IDE autocomplete) and static analysis.
- `mypy` — static type checker that reads hints and flags mismatches *before* runtime (`mypy src/`). Catches a real class of bugs (passing a dict where a dataclass was expected) that would otherwise only surface as a runtime `AttributeError` deep in a pipeline run.
- **Best practice:** Add type hints incrementally to legacy scripts during the "migrate legacy scripts" pattern from Phase 23's interview answers — a low-risk, high-value first pass before deeper refactoring.

### Formatting — black & isort
- **black** — opinionated, deterministic code formatter (no configuration debates — it has one style). Run via pre-commit hook or CI check (`black --check .`) so all commits are consistently formatted without manual review nitpicking.
- **isort** — sorts/groups import statements consistently (stdlib, third-party, local — each in its own block). Commonly run alongside black.
- **Why this matters for a team repo (interview angle):** Consistent formatting removes an entire category of PR review noise ("nitpick: extra blank line") so reviews focus on logic — a real signal of production team maturity, not just a nice-to-have.

### Profiling
- `cProfile` (stdlib) — `python -m cProfile -s cumulative script.py` — identifies where time is actually spent before optimizing (avoid guessing).
- `timeit` (stdlib) — micro-benchmarking small code snippets.

### Memory Optimization
- Generators over lists for large datasets (Phase 10) — flat memory usage regardless of input size.
- `__slots__` on classes with many instances — restricts instance attributes, reduces per-object memory overhead (relevant when modeling thousands of resources, e.g., an inventory of every S3 object across a large CMG account).

### Time Complexity
- Standard interview ground: know when a `list` lookup (`in list`, O(n)) should be a `set`/`dict` lookup (O(1) average) instead — a very common "why is my script slow at scale" root cause in inventory/audit scripts iterating large AWS resource lists.

### Caching
- `functools.lru_cache` — memoizes function results, useful for expensive repeated lookups within a single script run (e.g., resolving the same AMI ID's details multiple times during an inventory scan).
  ```python
  from functools import lru_cache

  @lru_cache(maxsize=256)
  def get_ami_details(ami_id):
      return ec2.describe_images(ImageIds=[ami_id])
  ```
- **Caveat:** `lru_cache` is in-process/per-run only — for caching across script runs or across distributed workers, use an external cache (Redis/DynamoDB), not `lru_cache`.

### Async Optimization
- Cross-ref Phase 12 — `asyncio` for very high-concurrency I/O workloads; not a performance tool for CPU-bound code (still single-threaded, still GIL-bound for actual Python execution).
- **Interview angle:** Senior always profiles before optimizing, and correctly separates memory optimization (generators, `__slots__`) from raw speed optimization (algorithmic complexity, caching) — a common junior mistake is optimizing the wrong bottleneck without profiling first.

### 🔥 Rapid Fire
- Q: flake8 vs pylint? → flake8 is faster/lighter (style + basic errors); pylint is deeper/more opinionated, slower.
- Q: Does mypy affect runtime? → No — type hints are erased at runtime; mypy only checks statically before execution.
- Q: `in list` vs `in set` — which is faster? → `set`/`dict` — O(1) average vs O(n) for `list`.
- Q: Fix wrong bottleneck without profiling — good or bad practice? → Bad — always profile with `cProfile` first.

## Phase 21 – Security

*(Secrets Management, Encryption, Hashing, SSL, JWT, OAuth, Secure Coding, Bandit, Safety, Dependency Scanning)*

### Secrets Management
- Never hardcode secrets in source — pull at runtime from AWS Secrets Manager or Parameter Store (`boto3`, Phase 15): `boto3.client("secretsmanager").get_secret_value(SecretId=...)`.
- `python-dotenv` (Phase 14) is fine for **local dev only** — never for production secret loading.

### Encryption & Hashing
- `hashlib` (stdlib) — `sha256`, `sha1` (avoid `md5`/`sha1` for anything security-sensitive, only fine for non-security checksums). Used for artifact integrity verification before deployment.
- `cryptography` (pip, the modern standard library for actual encryption — avoid the deprecated `pycrypto`) for symmetric/asymmetric encryption needs beyond simple hashing.
- **Rule of thumb (senior-level):** Never write custom crypto — use vetted libraries (`cryptography`, `boto3`'s KMS integration) for anything beyond checksums.

### SSL/TLS
- `ssl` module (stdlib) — used with `socket` to fetch/inspect certificate details (feeds the cert-expiry-checker project in Phase 14). `requests` handles TLS verification automatically — never set `verify=False` in production.

### JWT & OAuth
- `PyJWT` (pip) — encode/decode/verify JSON Web Tokens, common when scripts authenticate against internal APIs that use JWT-based auth.
- OAuth2 flows typically handled via `requests-oauthlib` or the specific SDK of the service being integrated (e.g., GitHub App auth) rather than hand-rolling the OAuth dance.

### Secure Coding Practices
- Parameterize all SQL (`sqlite3`, Phase 8) — never string-format queries.
- Never `shell=True` with unsanitized input (`subprocess`, Phase 14).
- `yaml.safe_load()`, never bare `yaml.load()` (Phase 8).
- Validate/sanitize all external input (API responses, file contents) before using it to construct paths, commands, or queries.

### Bandit
- Static analysis security linter for Python (`pip install bandit`, run via `bandit -r src/`) — flags common issues: `subprocess` with `shell=True`, hardcoded passwords, use of `eval()`/`exec()`, weak hashing. Should be a standard pre-commit/CI gate for any DevOps automation repo.

### Safety / Dependency Scanning
- `safety check` (or `pip-audit`) — scans `requirements.txt`/installed packages against known CVE databases. Pair with Trivy (already used for container images on CMG) for full-stack dependency + image scanning coverage in CI.
- **Interview angle:** Senior treats security scanning (Bandit + Safety/pip-audit) as a required CI gate for Python automation code, the same way Trivy is a required gate for container images on CMG — not an optional nice-to-have.

### 🔥 Rapid Fire
- Q: Bandit vs Safety/pip-audit? → Bandit scans your *code* for insecure patterns; Safety/pip-audit scans your *dependencies* for known CVEs.
- Q: Why never `shell=True` with unsanitized input? → Command injection — always pass commands as a list with `shell=False`.
- Q: Where should secrets come from in production scripts? → Secrets Manager/Parameter Store at runtime — never hardcoded or committed, never loaded from `.env` in production.

## Phase 22 – CI/CD Integration

*(Jenkins Automation, GitLab API, GitHub API, GitHub Actions, Azure DevOps API, Build Automation)*

### Jenkins Automation
- Jenkins REST API (via `requests`, Phase 13) for triggering jobs, polling build status, and reading console output programmatically — useful for building custom dashboards or cross-pipeline orchestration beyond what Jenkinsfile/Groovy alone covers.
- On CMG specifically: Python scripts invoked *from* Jenkinsfile pipeline stages (running as IAM-scoped agents) are more common than scripts calling the Jenkins API *into* Jenkins — e.g., a Python step that runs Trivy scans, parses results, and fails the build on critical CVEs.
- **Production example — failing a build on Trivy critical findings:**
  ```python
  import json, sys

  with open("trivy-report.json") as f:
      report = json.load(f)

  critical = [v for r in report.get("Results", [])
              for v in r.get("Vulnerabilities", [])
              if v["Severity"] == "CRITICAL"]

  if critical:
      print(f"BUILD FAILED: {len(critical)} CRITICAL vulnerabilities found")
      sys.exit(1)
  ```

### GitHub API / GitHub Actions
- `requests` or the `PyGithub` library against the GitHub REST/GraphQL API — automating PR checks, release tagging, branch protection audits.
- GitHub Actions can run arbitrary Python steps directly (`uses: actions/setup-python` + `run: python script.py`) — same scripting patterns apply as in Jenkins.

### GitLab API
- `python-gitlab` library (or raw `requests`) — pipeline triggers, merge request automation, project/group audits, similar shape to the GitHub equivalents.

### Azure DevOps API
- REST API via `requests`, or the `azure-devops` Python SDK for typed access — relevant if CMG or related teams integrate with Azure Boards/Repos alongside the AWS-centric stack.

### Build Automation — general pattern
- Across all these platforms, the recurring Python role is the same three things: (1) trigger/poll a pipeline via its REST API, (2) parse structured tool output (Trivy/scan reports, test results, plan JSON) to make pass/fail decisions, (3) push notifications (Slack webhook via `requests`) — the "glue" language connecting purpose-built CI/CD tools.
- **Interview angle:** Senior frames Python's CI/CD role correctly — it's not replacing Jenkins/GitHub Actions, it's the automation layer that makes decisions and does things those tools don't natively do well (custom gating logic, cross-tool orchestration, structured report parsing).

### 🔥 Rapid Fire
- Q: What's Python's actual role in a CI/CD pipeline? → The decision/glue layer — parsing structured tool output (scan reports, plan JSON) and making pass/fail calls, not replacing the CI tool itself.
- Q: How do you fail a build on a Trivy critical finding? → Parse the JSON report, check for `Severity == "CRITICAL"`, `sys.exit(1)` if any are found.
- Q: Jenkins REST API — when would you call it from Python vs write a Jenkinsfile step? → When orchestrating *across* pipelines/jobs from outside, not for logic that belongs inside a single pipeline's stages.

## Phase 23 – Interview Preparation

*(Beginner/Intermediate/Senior Questions, Live Coding, Scenario-Based Questions, Debugging Challenges, Production RCA, Hands-on Labs)*

### Beginner-level questions
- What's the difference between a list and a tuple?
- What's the difference between `==` and `is`?
- What does `*args`/`**kwargs` mean?

### Intermediate-level questions
- Explain generators vs list comprehensions and when you'd choose one over the other.
- What's the GIL, and how does it affect threading vs multiprocessing choice?
- Difference between `@staticmethod`, `@classmethod`, and a regular instance method?

### Senior-level questions (junior vs senior differentiator = *why*, not just *what*)
- "Walk me through how you'd design a Python script that syncs EC2 tags to a CMDB — what failure modes do you design for?" → senior answer covers: pagination, `ClientError` code inspection with retry/backoff, idempotency (safe to re-run), structured logging, and a dry-run mode — not just "call boto3 and loop."
- "Your automation script works locally but fails intermittently in Jenkins — how do you debug it?" → senior answer: check credential resolution differences (IAM role vs local profile), check for hardcoded paths/timezone assumptions, check concurrency/rate-limiting under CI load, reproduce with the exact same Python/library versions as the CI image.
- "When would you choose `asyncio` over `ThreadPoolExecutor` for a health-check script polling 500 endpoints?" → senior answer references the concurrency decision table in Phase 12, not just "asyncio is faster."

### Scenario-Based / Debugging Challenges
- Given a script that intermittently raises `TypeError: can't compare offset-naive and offset-aware datetimes` — diagnose and fix (tests understanding of Phase 2 `datetime` timezone-awareness).
- Given a `subprocess.run(cmd, shell=True)` call built from a Jenkins parameter string — identify the security vulnerability and rewrite it safely (tests Phase 14/23 understanding).
- A `for` loop calling `zip(instance_ids, tags)` silently drops data — explain why and fix it (tests Phase 4 `zip` truncation behavior).

### Production RCA-style Questions
- "A nightly Python cleanup job deleted more S3 objects than expected — walk me through how you'd investigate and what safeguards you'd add going forward." → expects: check `LastModified` comparison logic and datetime timezone handling, check pagination was implemented correctly, propose a `--dry-run` flag and object-count sanity threshold before any destructive `delete_object` calls going forward.

### Hands-on Lab Ideas (build these to demonstrate depth)
1. Build the EC2 Inventory script from Phase 14 with full error handling, retries, and unit tests using `moto`.
2. Build a log analyzer (Phase 14) that streams a multi-GB file via a generator and reports top error types with `Counter`.
3. Write a decorator-based retry utility (Phase 5) from scratch, then compare it to `tenacity` and explain the trade-offs.

### Senior Scenario Questions — Extended Set

Pointwise answers, cross-referenced to the phases where the full explanation lives — avoids repeating content already documented above.

**How do you design Python scripts for large-scale infrastructure automation?**
- Idempotent by default (safe to re-run), paginated API calls (Phase 15), structured logging (Phase 9), config-driven not hardcoded (env vars/Parameter Store), dry-run mode for destructive actions, retries with backoff (Phase 14 `tenacity`), and clear exception hierarchies (Phase 9) so failures are actionable, not just logged noise.

**A Python automation script works locally but fails in CI/CD — how do you debug?**
- Check credential resolution differences (local AWS profile vs Jenkins IAM-scoped agent role — Phase 15). Check for hardcoded local paths, timezone assumptions (Phase 2), and Python/library version drift between local venv and the CI container image. Reproduce locally inside the *same* Docker image the pipeline uses, not just the same OS.

**How do you manage secrets securely in Python-based DevOps tools?**
- Never hardcode or commit secrets. Pull at runtime from AWS Secrets Manager/Parameter Store via `boto3` (Phase 15/23). `.env` + `python-dotenv` is local-dev only, never production. Mask secrets before logging (Phase 9).

**When do you replace bash with Python in real projects?**
- When logic needs real data structures (parsing/filtering JSON/YAML), proper error handling beyond exit codes, unit testing, or reuse across multiple pipelines. Bash stays fine for simple, linear command sequences; Python wins once there's branching logic, structured data, or anything that needs to be tested.

**How do you design Python code to be idempotent for automation?**
- Check current state before acting (e.g., "does this S3 bucket/K8s resource already exist/match desired state?") rather than blindly creating/applying. Use upsert-style API calls where available (`helm upgrade --install`, Phase 14) instead of separate create/update branches. Make delete operations conditional and safe to re-run without erroring if the target is already gone.

**How do you handle API rate limits and retries in Python automation?**
- `tenacity`'s `@retry` with exponential backoff (Phase 14) instead of hand-rolled retry loops. For `boto3` specifically, configure adaptive retries via `Config(retries={"mode": "adaptive"})` (Phase 15) — boto3 has this built in. Always inspect the specific error code (`Throttling`, `429`) before deciding to retry vs fail fast.

**How do you package and version Python tools used by multiple teams?**
- Proper `setup.py`/`pyproject.toml` packaging with semantic versioning, published to an internal PyPI-compatible registry (e.g., CodeArtifact) rather than teams copy-pasting scripts. Pin exact dependency versions (Phase 1) so consuming teams get reproducible installs.

**How do you optimize Python scripts used in pipelines for performance?**
- Profile first with `cProfile` (Phase 20) — don't guess. Common wins: generators over full-list loading (Phase 10), `ThreadPoolExecutor` for I/O-bound parallel API calls (Phase 12), `lru_cache` for repeated lookups within a run (Phase 20). Pipeline-level win: caching the venv/dependency install layer in the CI image rather than reinstalling every run.

**How do you write unit and integration tests for automation code?**
- `pytest` + `moto` to mock AWS calls, `unittest.mock.patch` for `subprocess`/`requests` calls (Phase 17) — unit tests must never hit real infrastructure. Integration tests run against a dedicated non-prod environment in a separate, slower CI stage.

**How do you manage Python dependencies in CI/CD pipelines?**
- Pin exact versions in `requirements.txt` (Phase 1), cache the pip/venv layer in the CI image for speed, run `safety`/`pip-audit` as a security gate (Phase 21) before deploy stages run.

**How do you integrate Python with Kubernetes, cloud SDKs, and APIs?**
- Kubernetes: official `kubernetes` client for structured cluster automation, or `subprocess` wrapping `kubectl`/`helm` for simpler cases (Phase 16). Cloud: `boto3` for AWS (Phase 15). Generic APIs: `requests` with timeouts, retries, and `raise_for_status()` (Phase 13).

**How do you implement logging and observability in Python tools?**
- Structured JSON logging (Phase 9) that feeds CloudWatch Logs Insights, correlation IDs per run/job, and meaningful exit codes so pipeline stages/cron/Nagios can act on failure without parsing free-text logs.

**How do you secure Python scripts from injection and misuse?**
- Never `shell=True` with unsanitized input (Phase 14), always `yaml.safe_load` (Phase 8), parameterized SQL (Phase 8/23), input validation on anything from an external API before it touches a path/command/query, Bandit as a CI gate (Phase 21).

**How do you migrate legacy scripts to modern Python tooling?**
- Incrementally: add type hints and tests around the existing script first (safety net) before rewriting; replace `os.system()`/manual string-built shell calls with `subprocess.run()` (Phase 14); replace ad hoc `print()` debugging with `logging` (Phase 9); move hardcoded config/secrets to env vars/Secrets Manager (Phase 21) as a first-pass cleanup before any structural rewrite.

**What Python practices clearly show senior DevOps expertise?**
- Idempotency and dry-run modes by default, specific exception handling (never bare `except:`), structured/JSON logging, dependency injection for testability (Phase 6), profiling before optimizing (Phase 20), and treating security scanning (Bandit/Safety/Trivy) as a required CI gate rather than an afterthought — the recurring theme across every answer above.

> _Interview questions here are indexed to their explanatory phase above rather than duplicated in full — cross-reference the relevant phase for the complete explanation behind each answer._

---

## Phase 24 – 🔥🔥 MASTER RAPID FIRE — ALL TOPICS

> _Consolidated one-line Q&A from every phase's Rapid Fire section, in Learning-Path order — for a single night-before-interview read-through. Phase 23 (Interview Preparation) is deliberately excluded here since it's already a dedicated Q&A chapter._

**Phase 1 – Fundamentals**
- Q: `venv` vs `pyenv`? → `venv` isolates dependencies for one Python version; `pyenv` manages multiple Python versions.
- Q: What does `pip freeze` do? → Lists installed packages with exact versions, typically redirected into `requirements.txt`.
- Q: Why pin exact versions in production requirements? → Reproducible CI builds — unpinned deps can silently change behavior between runs.

**Phase 2 – Core Syntax**
- Q: `==` vs `is`? → `==` compares value; `is` compares identity — always use `is None`, never `== None`.
- Q: Why is `in` faster on a `set` than a `list`? → O(1) average (hash lookup) vs O(n) (linear scan).
- Q: `int("72.5")` — what happens? → Raises `ValueError` — must convert to `float` first, then `int()`.

**Phase 3 – Data Structures**
- Q: `defaultdict` vs regular `dict`? → `defaultdict` auto-creates a default value for missing keys, avoiding manual existence checks.
- Q: When would you use `deque` over `list`? → When you need O(1) appends/pops from *both* ends (list is O(n) at the front).
- Q: `namedtuple` vs `dataclass`? → `namedtuple` is simpler/immutable; `dataclass` supports mutability, defaults, and methods.

**Phase 4 – Control Flow**
- Q: Does `zip()` error if iterables are different lengths? → No — it silently truncates to the shortest; use `zip_longest` if that's unintended.
- Q: `match-case` minimum Python version? → 3.10+.
- Q: `for...else` — when does `else` run? → Only if the loop completes without hitting `break`.

**Phase 5 – Functions**
- Q: What does `@functools.wraps` fix? → Preserves the wrapped function's `__name__`/docstring, which a plain decorator would otherwise overwrite.
- Q: `*args` vs `**kwargs`? → `*args` collects extra positional args as a tuple; `**kwargs` collects extra keyword args as a dict.
- Q: Why avoid deep recursion in DevOps scripts? → Python has no tail-call optimization and a default recursion limit (~1000) — prefer iteration for unbounded-depth tasks.

*(map, filter, reduce, any, all, sorted, comprehensions)*

**Phase 6 – Object-Oriented Programming**
- Q: `__init__` vs `__new__`? → `__new__` creates the instance; `__init__` initializes it after creation (relevant for singleton patterns).
- Q: What enforces that subclasses implement a method? → `abc.ABC` + `@abstractmethod`.
- Q: Why use `field(default_factory=dict)` in a dataclass instead of `= {}`? → Mutable defaults shared across instances are a classic bug; dataclasses raise an error to force the safe pattern.

**Phase 7 – Modules & Packages**
- Q: Module vs package? → Module = single `.py` file; package = a directory of modules with `__init__.py`.
- Q: Why avoid `from module import *`? → Pollutes the namespace — unclear where names came from, breaks tooling/readability.
- Q: What causes `ModuleNotFoundError` in a CI container but not locally? → Usually `PYTHONPATH`/venv activation differences between local shell and the CI image.

**Phase 8 – File Handling**
- Q: `yaml.load()` vs `yaml.safe_load()`? → `safe_load` is mandatory in production — plain `load()` can execute arbitrary objects embedded in YAML.
- Q: Why `newline=""` when opening a CSV file for writing? → Prevents extra blank rows on Windows.
- Q: `os.path` vs `pathlib`? → `pathlib` is the modern, object-oriented, cross-platform-friendly choice for new code.

**Phase 9 – Error Handling & Logging**
- Q: `except Exception as e: logging.error(e)` vs `logging.exception(...)`? → `logging.exception()` (inside an `except` block) captures the full traceback; the first loses it.
- Q: Why avoid a bare `except:`? → Swallows `KeyboardInterrupt`/`SystemExit` too, hiding real bugs — always catch specific exceptions.
- Q: What are Python's 4 broad exception categories? → Syntax errors, standard/runtime exceptions, system-level exceptions (`BaseException` subclasses), and custom/user-defined exceptions.

**Phase 10 – Iterators & Generators**
- Q: Can you iterate a generator twice? → No — it's exhausted after one pass; a list can be iterated any number of times.
- Q: Why use a generator for a huge log file instead of `.readlines()`? → Flat memory usage — processes one line at a time instead of loading the whole file.
- Q: Generator expression syntax? → Parentheses `(x for x in y)`, vs brackets `[x for x in y]` for a list comprehension.

**Phase 11 – Regular Expressions**
- Q: `re.match()` vs `re.search()`? → `match()` only anchors at the start of the string; `search()` finds a match anywhere.
- Q: Why precompile a regex pattern used inside a loop? → Performance — avoids recompiling the same pattern on every iteration.
- Q: What's ReDoS? → Catastrophic backtracking from a poorly written pattern on large/adversarial input — a real production incident class.

**Phase 12 – Concurrency & Parallelism**
- Q: Does threading speed up CPU-bound Python code? → No — the GIL means only one thread executes Python bytecode at a time; use `multiprocessing` instead.
- Q: `concurrent.futures` — what does it unify? → `ThreadPoolExecutor` (I/O-bound) and `ProcessPoolExecutor` (CPU-bound) behind one API.
- Q: When does `asyncio` beat `ThreadPoolExecutor`? → Very high concurrency (thousands of connections) where thread-per-task overhead is too costly.

**Phase 13 – Networking & APIs**
- Q: `requests` vs `urllib`? → `requests` is the ergonomic modern standard; `urllib` is stdlib but far more verbose — use it only when adding a dependency isn't possible.
- Q: How do you check if a port is open in Python? → `socket.socket().connect_ex((host, port)) == 0`.
- Q: Why check DNS resolution before hitting an API in automation? → Fails fast with a clear error instead of a confusing connection timeout deep in the script.

**Phase 14 – Automation & Scripting**
- Q: How does a Python process handle graceful shutdown on `SIGTERM`? → Register a handler via `signal.signal(signal.SIGTERM, handler)` that cleans up and exits.
- Q: Why does a script that works manually fail under cron? → Cron runs with a minimal environment — no `PATH`/venv activation; always use absolute paths.
- Q: cron vs systemd — when to use which? → cron/EventBridge Scheduler for periodic tasks; systemd (or a Kubernetes Deployment) for always-on daemons that need auto-restart.

*(Log Analyzer, Health Checker, Disk Monitor, EC2 Inventory, Kubernetes Inventory, Cert Expiry Checker, Backup Automation, IAM Auditor, Cost Optimizer, Security Scanner, Deployment Automation)*

Each project below is built entirely from modules already documented above — listed here as an index of what to combine, not new content, to avoid duplication.

| Project | Core modules used |
|---|---|
| Log Analyzer | `re`, `collections.Counter`, `logging`, generators (Phase 10) for streaming large files |
| Health Checker | `requests`, `concurrent.futures.ThreadPoolExecutor`, `psutil` for host-level checks |
| Disk Monitor | `psutil`, `logging`, exit codes for cron/Nagios integration |
| EC2 Inventory | `boto3` (paginated `describe_instances`), `csv`/`json` export, `dataclasses` for structured records |
| Kubernetes Inventory | `kubernetes` Python client, `csv`/`json` export |
| Certificate Expiry Checker | `ssl`/`socket` (Phase 13) to fetch cert, `datetime`/`timedelta` for expiry math |
| Backup Automation | `shutil.make_archive`, `boto3` (S3 upload), `datetime` for naming/retention |
| IAM Auditor | `boto3` (`iam` client — list users/roles/policies), flag unused credentials via `datetime` comparisons |
| Cost Optimizer | `boto3` (Cost Explorer API, EC2/EBS inventory), flag idle/oversized/untagged resources |
| Security Scanner | `subprocess` wrapping Trivy/Bandit, `json` parsing of scan reports (pattern shown in Phase 22) |
| Deployment Automation | `subprocess` (`helm`/`kubectl`) or `kubernetes` client + `boto3`, tied together with `logging` and custom exceptions (Phase 9) |

**Design pattern common to all of these (senior-level expectation):**
1. Fetch/collect data (API call or file read).
2. Parse into structured objects (`dataclass`, not raw dicts, once the script grows past a few dozen lines).
3. Apply a rule/threshold.
4. Log structured output (Phase 9) and exit with a meaningful code for CI/cron integration.
5. Alert (Slack webhook via `requests`) on failure conditions.

> _Full worked implementations of each project will be added as dedicated sections once source scripts/notes are supplied — this index prevents duplicating the module-level documentation already written above._

*(Packaging, Versioning, Dependency Management, Configuration Management, Logging, Monitoring, Deployment, Best Practices)*

**Phase 15 – Cloud SDKs**
- Q: Why prefer IAM roles over access keys? → No long-lived credentials to leak/rotate; scoped, time-limited, auditable via CloudTrail.
- Q: Lambda invoke types? → `RequestResponse` (sync, waits for result) vs `Event` (async, fire-and-forget) vs `DryRun` (validate only).
- Q: How do you avoid only getting page 1 of EC2/S3 results? → Use the paginator (`get_paginator`), never assume a single API call returns everything.

**Phase 16 – Infrastructure Automation with Python**
- Q: Fabric vs raw Paramiko? → Fabric is a higher-level, simpler API built on Paramiko for common multi-host SSH tasks; drop to Paramiko for finer control.
- Q: Pulumi vs cdktf? → Pulumi is its own full IaC engine with native language support; cdktf synthesizes to Terraform's existing engine/state/providers.
- Q: What contract must an Ansible custom module follow? → Read JSON input, perform the action, emit a JSON result via `module.exit_json()`/`module.fail_json()`, supporting check-mode/idempotency where possible.

**Phase 17 – Testing**
- Q: Why use `moto` instead of hitting real AWS in tests? → Tests must never have side effects on real infrastructure — `moto` mocks the entire boto3 API surface.
- Q: `pytest` vs `unittest`? → `pytest` uses plain `assert`, has fixtures/parametrization, and better failure output; `unittest` is stdlib but more verbose.
- Q: Should you chase 100% test coverage? → No — track the trend; untested error-handling branches for rare failures are often more valuable than trivial getter tests.

**Phase 18 – Packaging & Distribution**
- Q: Difference between `setup.py` and `pyproject.toml`? → `pyproject.toml` is the modern, declarative, PEP 517/518-standard way; `setup.py` is legacy/imperative.
- Q: What's a wheel? → A pre-built distribution format — faster install, no build step at install time, vs a source `.tar.gz`.
- Q: How do internal teams share a Python tool without PyPI? → Private index (e.g. AWS CodeArtifact) or an internal Git-installable package (`pip install git+https://...`).
- Q: What does `[project.scripts]` do? → Registers a CLI entry point so an installed package becomes a runnable shell command.

**Phase 19 – Database & Data Handling**
- Q: `sqlite3` vs SQLAlchemy? → `sqlite3` is a specific embedded DB; SQLAlchemy is a toolkit/ORM that works across many DB engines including sqlite.
- Q: When is pandas overkill? → Small/simple filtering tasks — plain `csv`/dict comprehensions are simpler and have no extra dependency.
- Q: Where do DB credentials come from in production scripts? → Secrets Manager/Parameter Store, never hardcoded connection strings.

**Phase 20 – Performance & Best Practices**
- Q: flake8 vs pylint? → flake8 is faster/lighter (style + basic errors); pylint is deeper/more opinionated, slower.
- Q: Does mypy affect runtime? → No — type hints are erased at runtime; mypy only checks statically before execution.
- Q: `in list` vs `in set` — which is faster? → `set`/`dict` — O(1) average vs O(n) for `list`.
- Q: Fix wrong bottleneck without profiling — good or bad practice? → Bad — always profile with `cProfile` first.

**Phase 21 – Security**
- Q: Bandit vs Safety/pip-audit? → Bandit scans your *code* for insecure patterns; Safety/pip-audit scans your *dependencies* for known CVEs.
- Q: Why never `shell=True` with unsanitized input? → Command injection — always pass commands as a list with `shell=False`.
- Q: Where should secrets come from in production scripts? → Secrets Manager/Parameter Store at runtime — never hardcoded or committed, never loaded from `.env` in production.

**Phase 22 – CI/CD Integration**
- Q: What's Python's actual role in a CI/CD pipeline? → The decision/glue layer — parsing structured tool output (scan reports, plan JSON) and making pass/fail calls, not replacing the CI tool itself.
- Q: How do you fail a build on a Trivy critical finding? → Parse the JSON report, check for `Severity == "CRITICAL"`, `sys.exit(1)` if any are found.
- Q: Jenkins REST API — when would you call it from Python vs write a Jenkinsfile step? → When orchestrating *across* pipelines/jobs from outside, not for logic that belongs inside a single pipeline's stages.


