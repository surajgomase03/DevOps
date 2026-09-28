# Shell Scripting (Bash): Interview Notes

## 1. What Is a Shell Script?

```
script.sh (text file)
     |
     v
+------------------+   reads line by line   +------------------+
| Bash interpreter | ---------------------> | commands run as  |
| (#!/bin/bash)    |                        | processes/syscalls|
+------------------+                        +------------------+
```

**Key points**
- A shell script is a text file of commands executed by an interpreter (usually **bash**).
- Used for automation: deployments, backups, health checks, log cleanup, CI/CD steps, glue between tools.
- **Shebang** (`#!/bin/bash` or `#!/usr/bin/env bash`) tells the kernel which interpreter to use.
- Each external command in a script runs as a **new process** (`fork` + `exec`); builtins run inside the shell.
- Use shell for **glue and automation**; switch to Python when logic gets complex (data structures, APIs, error handling).

```bash
#!/usr/bin/env bash
echo "Hello from $(hostname)"
```

```bash
chmod +x hello.sh         # make executable
./hello.sh                # run (uses the shebang)
bash hello.sh             # run without execute bit
source hello.sh           # run in the CURRENT shell (also: . hello.sh)
```

| Run method | New process? | Variables persist in your shell? |
|---|---|---|
| `./script.sh` / `bash script.sh` | Yes (child shell) | No |
| `source script.sh` / `. script.sh` | No | Yes |

---

## 2. Recommended Script Template

```bash
#!/usr/bin/env bash
#
# Description : What this script does
# Usage       : ./script.sh <arg1> [arg2]
#
set -euo pipefail          # strict mode (explained in section 14)
IFS=$'\n\t'                # safer word splitting

readonly SCRIPT_NAME="$(basename "$0")"
readonly LOG_FILE="/var/log/${SCRIPT_NAME%.sh}.log"

log()  { echo "$(date '+%F %T') [INFO]  $*" | tee -a "$LOG_FILE"; }
err()  { echo "$(date '+%F %T') [ERROR] $*" | tee -a "$LOG_FILE" >&2; }
die()  { err "$*"; exit 1; }

cleanup() { rm -f "${TMP_FILE:-}"; }
trap cleanup EXIT

main() {
    [[ $# -ge 1 ]] || die "Usage: $SCRIPT_NAME <arg1>"
    log "Starting with arg: $1"
    # ... logic here ...
    log "Done"
}

main "$@"
```

---

## 3. Variables

```bash
name="Suraj"              # no spaces around =
echo "$name"              # use $ to read
echo "${name}_dev"        # braces to separate from text
readonly PI=3.14          # constant
unset name                # delete
export ENV=prod           # visible to child processes
```

| Type | Scope | Example |
|---|---|---|
| Shell variable | Current shell only | `x=1` |
| Environment variable | Current shell + children | `export x=1` |
| Local variable | Inside a function | `local x=1` |

**Key points**
- **No spaces** around `=`: `x = 1` is an error (bash treats `x` as a command).
- Variables are **strings** by default; arithmetic needs `$(( ))`.
- Variables are **global by default**, even inside functions; use `local`.
- Convention: `UPPER_CASE` for env/constants, `lower_case` for local variables.

```bash
# Default values
echo "${PORT:-8080}"          # use 8080 if PORT unset or empty
echo "${PORT:=8080}"          # use AND assign it
echo "${PORT:?PORT is required}"   # exit with error if unset
```

---

## 4. Special Variables

| Variable | Meaning |
|---|---|
| `$0` | Script name |
| `$1 ... $9`, `${10}` | Positional arguments |
| `$#` | Number of arguments |
| `"$@"` | All arguments, each **preserved separately** (use this) |
| `"$*"` | All arguments as **one** string |
| `$?` | Exit status of the last command |
| `$$` | PID of the current shell/script |
| `$!` | PID of the last background process |
| `$_` | Last argument of previous command |

```bash
#!/usr/bin/env bash
echo "Script: $0, args: $#"
for arg in "$@"; do
    echo "Arg: $arg"
done
```

**Key points**
- Always use **`"$@"`** (quoted) to pass arguments through unchanged.
- `$?` is overwritten after every command; save it if needed: `rc=$?`.

---

## 5. Quoting (Most Common Source of Bugs)

```
'single'   -> literal, nothing expanded
"double"   -> expands $var, $(cmd), \ ; prevents word splitting/globbing
no quotes  -> word splitting + globbing happen (dangerous with variables)
```

```bash
name="John Smith"
echo '$name'          # $name
echo "$name"          # John Smith
echo $name            # John Smith (but split into 2 words internally)

file="my report.txt"
rm $file              # WRONG: tries to remove "my" and "report.txt"
rm "$file"            # RIGHT
```

**Key points**
- **Always quote variable expansions**: `"$var"`, `"$(cmd)"`, `"$@"`.
- Unquoted variables undergo **word splitting** and **glob expansion** (`*` matches files).
- Use `$'...'` for escape sequences: `echo $'line1\nline2'`.

---

## 6. Command Substitution and Arithmetic

```bash
today=$(date +%F)                     # preferred (nestable)
files=$(ls | wc -l)
old=`date`                            # legacy backticks: avoid

count=5
echo $(( count * 2 + 1 ))             # 11
(( count++ ))                         # increment
echo $(( 10 / 3 ))                    # 3 (integer only)
echo "scale=2; 10/3" | bc             # 3.33 (decimals via bc)

let "x = 5 + 3"
```

**Key points**
- Bash arithmetic is **integers only**; use `bc` or `awk` for floats.
- Inside `$(( ))` you don't need `$` on variable names.

---

## 7. Exit Codes

```
0        -> success
1-255    -> failure (meaning is defined by the program)
```

| Code | Meaning |
|---|---|
| `0` | Success |
| `1` | General error |
| `2` | Misuse of shell builtin / bad usage |
| `126` | Command found but not executable |
| `127` | Command not found |
| `130` | Terminated by Ctrl+C (128 + 2) |
| `137` | Killed by SIGKILL (128 + 9), often OOM |
| `143` | Terminated by SIGTERM (128 + 15) |

```bash
grep -q "error" app.log
echo $?                     # 0 if found, 1 if not found

if grep -q "error" app.log; then
    echo "errors found"
fi

command || echo "failed"    # run right side only if left FAILS
command && echo "worked"    # run right side only if left SUCCEEDS
exit 0                      # explicit exit code
```

**Key points**
- `if` tests a command's **exit status**, not a boolean value; **0 = true**.
- A script's exit code is the exit code of its **last command** unless you call `exit`.
- CI/CD (Jenkins, GitHub Actions) decides pass/fail from the exit code.

---

## 8. Conditionals

```bash
if [[ "$env" == "prod" ]]; then
    echo "production"
elif [[ "$env" == "stage" ]]; then
    echo "staging"
else
    echo "other"
fi
```

### `[ ]` vs `[[ ]]`

| | `[ ]` (test) | `[[ ]]` (bash keyword) |
|---|---|---|
| Portability | POSIX (works in `sh`) | Bash/zsh/ksh only |
| Quoting needed | Yes, always | Safer (no word splitting) |
| Pattern match | No | `[[ $f == *.log ]]` |
| Regex | No | `[[ $x =~ ^[0-9]+$ ]]` |
| `&&` / `\|\|` inside | Use `-a` / `-o` (discouraged) | Yes |

**Recommendation:** use `[[ ]]` in bash scripts; use `[ ]` only for POSIX `sh` scripts.

### Test operators

| String | Meaning |
|---|---|
| `-z "$s"` | Empty string |
| `-n "$s"` | Non-empty string |
| `"$a" == "$b"` | Equal |
| `"$a" != "$b"` | Not equal |

| Number | Meaning |
|---|---|
| `-eq` `-ne` | Equal, not equal |
| `-lt` `-le` | Less than, less or equal |
| `-gt` `-ge` | Greater than, greater or equal |

| File | Meaning |
|---|---|
| `-e f` | Exists |
| `-f f` | Regular file |
| `-d f` | Directory |
| `-r` `-w` `-x` | Readable, writable, executable |
| `-s f` | Exists and size > 0 |
| `-L f` | Symlink |
| `f1 -nt f2` | f1 newer than f2 |

```bash
[[ -f /etc/hosts ]] && echo "exists"
[[ -d "$dir" ]] || mkdir -p "$dir"
[[ "$count" -gt 10 && "$env" == "prod" ]] && echo "alert"
(( count > 10 )) && echo "big"            # arithmetic comparison

[[ "$s" =~ ^[0-9]+$ ]] && echo "number"   # regex
```

**Key points**
- **`==` compares strings; `-eq` compares numbers.** `"10" == "010"` is false, `10 -eq 010`... beware (octal in `(( ))`).
- Spaces are required inside brackets: `[[ $a == $b ]]`, not `[[$a==$b]]`.

### case statement

```bash
case "$1" in
    start)   echo "Starting..." ;;
    stop)    echo "Stopping..." ;;
    restart) "$0" stop; "$0" start ;;
    status|st) echo "Status..." ;;
    *)       echo "Usage: $0 {start|stop|restart|status}"; exit 1 ;;
esac
```

---

## 9. Loops

```bash
# for over a list
for env in dev stage prod; do
    echo "Deploying to $env"
done

# C-style
for (( i=1; i<=5; i++ )); do echo "$i"; done

# range
for i in {1..5}; do echo "$i"; done

# over files (use globs, NOT ls)
for f in /var/log/*.log; do
    [[ -e "$f" ]] || continue
    echo "Processing $f"
done

# while
count=0
while [[ $count -lt 3 ]]; do
    echo "count=$count"
    (( count++ ))
done

# read a file line by line (correct way)
while IFS= read -r line; do
    echo "Line: $line"
done < servers.txt

# until
until ping -c1 -W1 db.internal &>/dev/null; do
    echo "waiting for db..."
    sleep 2
done

# control
break       # exit loop
continue    # next iteration
```

**Key points**
- Use **`while IFS= read -r line`** to read files; `IFS=` keeps whitespace, `-r` keeps backslashes.
- **Don't** do `for f in $(ls)`; it breaks on spaces. Use globs or `find ... -print0`.
- A loop after a pipe runs in a **subshell**: variables set inside are lost.

```bash
count=0
cat file | while read -r l; do (( count++ )); done
echo "$count"     # 0  (subshell problem)

while read -r l; do (( count++ )); done < file
echo "$count"     # correct (no pipe)
```

---

## 10. Functions

```bash
greet() {
    local name="$1"          # local variable
    echo "Hello, $name"      # "return" a string via stdout
    return 0                 # return an exit STATUS (0-255)
}

msg=$(greet "Suraj")         # capture output
greet "Suraj"
echo $?                      # exit status of the function

check_disk() {
    local usage
    usage=$(df / --output=pcent | tail -1 | tr -dc '0-9')
    (( usage < 80 ))         # returns 0 (ok) or 1 (fail)
}

if check_disk; then echo "disk ok"; else echo "disk high"; fi
```

**Key points**
- `return` gives a **status code (0-255)**, not data. To return data, `echo` and capture with `$(...)`.
- Always use **`local`** for variables inside functions (avoids global leaks).
- Functions must be defined **before** they are called.
- Arguments inside a function are `$1`, `$2`, `$@` (the function's own).

---

## 11. Arrays

```bash
# indexed array
servers=(web1 web2 db1)
echo "${servers[0]}"           # web1
echo "${servers[@]}"           # all elements
echo "${#servers[@]}"          # length: 3
servers+=(cache1)              # append

for s in "${servers[@]}"; do echo "$s"; done

# associative array (bash 4+)
declare -A ports=( [http]=80 [https]=443 [ssh]=22 )
echo "${ports[https]}"
for k in "${!ports[@]}"; do echo "$k -> ${ports[$k]}"; done
```

**Key points**
- Use **`"${arr[@]}"`** (quoted) to iterate; it preserves elements with spaces.
- `${!arr[@]}` = keys/indices. `${#arr[@]}` = count.
- Associative arrays need bash 4+ (macOS default bash 3.2 lacks them).

---

## 12. String Manipulation (Parameter Expansion)

```bash
s="hello-world.tar.gz"

echo "${#s}"              # length: 17
echo "${s:0:5}"           # hello       (substring)
echo "${s#*-}"            # world.tar.gz   (remove shortest prefix up to -)
echo "${s##*.}"           # gz          (remove longest prefix up to last .)
echo "${s%.gz}"           # hello-world.tar (remove suffix)
echo "${s%%.*}"           # hello-world (remove longest suffix from first .)
echo "${s/world/bash}"    # hello-bash.tar.gz  (replace first)
echo "${s//l/L}"          # heLLo-worLd.tar.gz (replace all)
echo "${s^^}"             # UPPERCASE
echo "${s,,}"             # lowercase

path="/var/log/app/server.log"
echo "${path##*/}"        # server.log   (like basename)
echo "${path%/*}"         # /var/log/app (like dirname)
```

Memory trick: `#` removes from the **front** (# is on the left of $ on keyboard); `%` removes from the **back**. Doubled = longest match.

---

## 13. Input/Output Redirection and Pipes

```
            +---------+
 stdin(0) ->| command |-> stdout(1)
            +---------+-> stderr(2)
```

| Syntax | Meaning |
|---|---|
| `cmd > file` | stdout to file (overwrite) |
| `cmd >> file` | stdout to file (append) |
| `cmd 2> file` | stderr to file |
| `cmd > file 2>&1` | stdout **and** stderr to file |
| `cmd &> file` | same (bash shortcut) |
| `cmd 2>&1 \| tee f` | show on screen and save |
| `cmd < file` | stdin from file |
| `cmd > /dev/null 2>&1` | discard all output |
| `cmd1 \| cmd2` | pipe stdout of cmd1 to stdin of cmd2 |

```bash
ls /nope 2> errors.log
./deploy.sh > deploy.log 2>&1
./deploy.sh 2>&1 | tee -a deploy.log
command >/dev/null 2>&1 || echo "failed"
echo "error message" >&2            # print to stderr from a script
```

**Key points**
- **Order matters:** `cmd > file 2>&1` is correct; `cmd 2>&1 > file` is not (stderr goes to the terminal).
- Log **errors to stderr** (`>&2`) so callers can separate them.

### Here-doc and here-string

```bash
cat > /etc/myapp.conf <<EOF
port=${PORT}
env=${ENV}
EOF

cat <<'EOF'                # quoted delimiter: NO variable expansion
Literal $HOME here
EOF

grep "error" <<< "$log_text"    # here-string
```

### Process substitution

```bash
diff <(sort a.txt) <(sort b.txt)
```

---

## 14. Strict Mode and Error Handling

```bash
set -e            # exit immediately if a command fails
set -u            # error on undefined variables
set -o pipefail   # pipeline fails if ANY command in it fails
set -x            # print each command before running (debug)

set -euo pipefail # the standard combo
```

| Option | Without it | With it |
|---|---|---|
| `-e` | Script continues after failure | Stops at first failing command |
| `-u` | Undefined var = empty string (`rm -rf "$DIR/"` becomes `rm -rf /`!) | Error and exit |
| `pipefail` | Pipeline status = last command only | Fails if any stage fails |

```bash
# set -e does NOT trigger inside: if/while conditions, && / || chains, or ! commands
# Allow an expected failure:
grep -q pattern file || true
```

### trap (cleanup and signals)

```bash
TMP=$(mktemp -d)
cleanup() { rm -rf "$TMP"; echo "cleaned up"; }
trap cleanup EXIT                      # runs on any exit
trap 'echo "Interrupted"; exit 130' INT TERM
trap 'echo "Error on line $LINENO"' ERR
```

### Retry pattern

```bash
retry() {
    local n=1 max=5 delay=3
    until "$@"; do
        if (( n >= max )); then
            echo "failed after $n attempts" >&2
            return 1
        fi
        echo "attempt $n failed, retrying in ${delay}s..." >&2
        (( n++ )); sleep "$delay"
    done
}
retry curl -fsS https://example.com/health
```

### Lock file (prevent concurrent runs)

```bash
exec 200>/var/lock/myscript.lock
flock -n 200 || { echo "already running"; exit 1; }
```

---

## 15. Argument Parsing with getopts

```bash
#!/usr/bin/env bash
usage() { echo "Usage: $0 -e <env> [-v] [-n <count>]"; exit 1; }

verbose=false; count=1
while getopts ":e:vn:h" opt; do
    case "$opt" in
        e) env="$OPTARG" ;;
        v) verbose=true ;;
        n) count="$OPTARG" ;;
        h) usage ;;
        :) echo "Option -$OPTARG needs a value" >&2; usage ;;
        \?) echo "Invalid option -$OPTARG" >&2; usage ;;
    esac
done
shift $((OPTIND - 1))                  # remaining args are in $@

[[ -n "${env:-}" ]] || usage
echo "env=$env verbose=$verbose count=$count rest=$*"
```

```bash
./deploy.sh -e prod -v -n 3 extra_arg
```

**Key points**
- A colon after a letter (`e:`) means the option takes a value.
- Leading `:` in the optstring enables custom error handling.
- `getopts` handles short options only; use manual `while/case` loops for `--long` options.

---

## 16. Essential Text-Processing Tools

```
raw text -> grep (filter) -> sed (edit) -> awk (columns/logic) -> sort | uniq (aggregate)
```

### grep

```bash
grep "error" app.log
grep -i "error" app.log             # ignore case
grep -v "debug" app.log             # invert
grep -rn "TODO" /opt/app            # recursive with line numbers
grep -E "error|fail" app.log        # extended regex
grep -c "error" app.log             # count matching lines
grep -q "error" app.log             # quiet, use exit status
grep -A2 -B2 "Exception" app.log    # context lines
```

### sed

```bash
sed 's/old/new/' file               # replace first per line
sed 's/old/new/g' file              # replace all
sed -i 's/8080/9090/g' config.conf  # edit in place
sed -i.bak 's/a/b/' file            # in place + backup
sed -n '5,10p' file                 # print lines 5-10
sed '/^#/d' file                    # delete comment lines
sed '/^$/d' file                    # delete blank lines
```

### awk

```bash
awk '{print $1}' file                       # first column
awk -F: '{print $1, $3}' /etc/passwd        # custom delimiter
awk '$3 > 1000 {print $1}' /etc/passwd      # condition
awk '{sum += $2} END {print sum}' data.txt  # sum a column
awk 'NR==1 || /error/' app.log              # header + matching lines
```

### cut, sort, uniq, wc, tr, xargs, find

```bash
cut -d, -f1,3 data.csv
sort file | uniq -c | sort -nr | head       # frequency count (top values)
sort -k2 -n file                            # sort by 2nd column, numeric
wc -l file
tr 'a-z' 'A-Z' < file
tr -d '\r' < win.txt > unix.txt             # remove Windows line endings

find /var/log -name "*.log" -mtime +7       # older than 7 days
find /var/log -name "*.log" -mtime +7 -delete
find . -type f -size +100M
find . -name "*.sh" -exec chmod +x {} \;
find . -name "*.log" -print0 | xargs -0 rm  # safe with spaces
cat urls.txt | xargs -n1 -P4 curl -sO       # 4 parallel downloads
```

**Real example: top 5 IPs in an access log**

```bash
awk '{print $1}' access.log | sort | uniq -c | sort -nr | head -5
```

**Key points**
- `sort` before `uniq` (uniq only removes **adjacent** duplicates).
- `-print0 | xargs -0` handles filenames with spaces.
- `sed -i` differs on macOS (`sed -i ''`); GNU vs BSD tools behave differently.

---

## 17. Common DevOps Script Examples

### Disk usage alert

```bash
#!/usr/bin/env bash
set -euo pipefail
THRESHOLD=80

df -P | awk 'NR>1 {print $5, $6}' | while read -r usage mount; do
    pct=${usage%\%}
    if (( pct >= THRESHOLD )); then
        echo "ALERT: $mount is at ${pct}% on $(hostname)"
    fi
done
```

### Service health check with restart

```bash
#!/usr/bin/env bash
set -euo pipefail
SERVICE="nginx"

if ! systemctl is-active --quiet "$SERVICE"; then
    echo "$(date '+%F %T') $SERVICE down, restarting" | tee -a /var/log/healthcheck.log
    systemctl restart "$SERVICE"
    sleep 3
    systemctl is-active --quiet "$SERVICE" || { echo "restart FAILED" >&2; exit 1; }
fi
```

### Backup with rotation

```bash
#!/usr/bin/env bash
set -euo pipefail
SRC="/opt/app/data"
DEST="/backup"
KEEP_DAYS=7
STAMP=$(date +%F_%H%M)

mkdir -p "$DEST"
tar -czf "$DEST/data_${STAMP}.tar.gz" -C "$SRC" .
find "$DEST" -name "data_*.tar.gz" -mtime +"$KEEP_DAYS" -delete
echo "Backup complete: data_${STAMP}.tar.gz"
```

### Run a command on many servers

```bash
#!/usr/bin/env bash
while IFS= read -r host; do
    echo "=== $host ==="
    ssh -o ConnectTimeout=5 -o BatchMode=yes "$host" "uptime; df -h /" || echo "FAILED: $host"
done < servers.txt
```

### Wait for a port/HTTP endpoint

```bash
wait_for_http() {
    local url=$1 tries=${2:-30}
    for (( i=1; i<=tries; i++ )); do
        if curl -fsS -o /dev/null "$url"; then return 0; fi
        sleep 2
    done
    return 1
}
wait_for_http http://localhost:8080/health || { echo "app not healthy"; exit 1; }
```

### Simple deploy skeleton

```bash
#!/usr/bin/env bash
set -euo pipefail
ENV="${1:?Usage: $0 <env>}"

case "$ENV" in dev|stage|prod) ;; *) echo "invalid env: $ENV" >&2; exit 1 ;; esac

echo "Deploying to $ENV"
git pull --ff-only
./build.sh
systemctl restart myapp
curl -fsS "http://localhost:8080/health" && echo "Deploy OK"
```

---

## 18. Scheduling with cron

```
* * * * *  command
| | | | |
| | | | +-- day of week (0-7, Sun=0 or 7)
| | | +---- month (1-12)
| | +------ day of month (1-31)
| +-------- hour (0-23)
+---------- minute (0-59)
```

```bash
crontab -e            # edit your crontab
crontab -l            # list

# Examples
0 2 * * *      /opt/scripts/backup.sh >> /var/log/backup.log 2>&1   # daily 2 AM
*/5 * * * *    /opt/scripts/healthcheck.sh                            # every 5 min
0 9 * * 1-5    /opt/scripts/report.sh                                 # weekdays 9 AM
@reboot        /opt/scripts/on_boot.sh
```

**Key points**
- Cron has a **minimal environment** (short `PATH`, no profile): use **absolute paths**, or set `PATH=` at the top of the crontab.
- Always **redirect output** to a log; otherwise output goes to local mail.
- Test the exact command as the same user, with `env -i` to simulate cron's bare environment.
- Alternatives: **systemd timers** (better logging/dependencies), Jenkins, Airflow.

---

## 19. Debugging Scripts

```bash
bash -n script.sh            # syntax check only (no run)
bash -x script.sh            # trace every command
set -x ; ...code... ; set +x # trace part of a script
PS4='+ ${BASH_SOURCE}:${LINENO}: ' bash -x script.sh   # trace with file:line

shellcheck script.sh         # static analyzer: catches quoting/logic bugs
```

```bash
# Debug helper
debug() { [[ "${DEBUG:-0}" == "1" ]] && echo "[DEBUG] $*" >&2; }
DEBUG=1 ./script.sh
```

**Key points**
- **ShellCheck** is the best linter; run it in CI.
- `set -x` output goes to stderr and may expose secrets; never leave it on in production logs.

---

## 20. How Bash Processes a Command Line

```
Input line
   |
   v
1. Tokenize / parse
   |
   v
2. Brace expansion         {a,b,c}   {1..5}
   |
   v
3. Tilde expansion         ~  ->  /home/user
   |
   v
4. Parameter/variable expansion   $var  ${var}
   |
   v
5. Command substitution    $(cmd)
   |
   v
6. Arithmetic expansion    $(( ))
   |
   v
7. Word splitting          (unquoted results split on IFS)
   |
   v
8. Filename expansion (globbing)   *  ?  [a-z]
   |
   v
9. Quote removal
   |
   v
10. Redirections, then execute (builtin, function, or external via fork+exec)
```

**Key points**
- This explains why **unquoted variables** break: splitting and globbing happen **after** variable expansion.
- Command lookup order: **alias -> function -> builtin -> `$PATH` executable**.

```bash
type -a echo        # shows builtin AND /bin/echo
type ll             # alias?
```

---

## 21. Bash vs sh vs Others

| Shell | Notes |
|---|---|
| `sh` | POSIX standard shell; on Debian/Ubuntu it's `dash` (fast, no bashisms) |
| `bash` | Most common; arrays, `[[ ]]`, `(( ))`, process substitution |
| `zsh` | Default on macOS; interactive features |
| `dash` | Minimal POSIX shell used for `/bin/sh` on Ubuntu |

**Key points**
- Bash-only features (`[[ ]]`, arrays, `<<<`, `${var^^}`) **fail under `sh`/`dash`**.
- Use `#!/usr/bin/env bash` for portability across systems; use `#!/bin/sh` only for strictly POSIX scripts.
- Running `sh script.sh` ignores the shebang.

---

## 22. Must-Know Points for Interviews

1. Shebang defines the interpreter; make it executable with `chmod +x`.
2. `./script` runs in a **child shell**; `source script` runs in the **current shell**.
3. **Quote variables**: `"$var"`, `"$@"`.
4. `$?` = last exit code; **0 = success**; `if` tests exit status.
5. `[[ ]]` preferred in bash; `==` for strings, `-eq` for numbers.
6. **`set -euo pipefail`** is the standard safety net (know what each flag does and its caveats).
7. **`trap ... EXIT`** for cleanup; `trap ... ERR` for error reporting.
8. Use `local` in functions; `return` gives a status, `echo` gives data.
9. `"$@"` vs `"$*"`: `"$@"` keeps arguments separate.
10. Read files with `while IFS= read -r line; do ... done < file`.
11. Redirect order: `> file 2>&1`; errors go to `>&2`.
12. Pipes create **subshells**: variables set in a piped `while` are lost.
13. Know `grep`, `sed`, `awk`, `cut`, `sort | uniq -c`, `xargs`, `find`.
14. Cron has a minimal environment: use absolute paths and log output.
15. Use **ShellCheck**, `bash -n`, and `bash -x` for debugging.
16. Make scripts **idempotent** (safe to run twice) and give **meaningful exit codes**.
17. Never put secrets in scripts or command lines (visible in `ps` and history); use env vars, vaults, or credential stores.

---

## 23. Common Mistakes to Avoid

| Mistake | Correct Understanding |
|---|---|
| `x = 5` (spaces around `=`) | Must be `x=5`. |
| Unquoted variables: `rm $file` | Use `rm "$file"`; unquoted breaks on spaces/globs. |
| `rm -rf $DIR/*` with `$DIR` empty | Becomes `rm -rf /*`. Use `set -u`, `${DIR:?}`, and quotes. |
| `for f in $(ls)` | Breaks on spaces/newlines. Use `for f in *` or `find -print0`. |
| Using `$*` instead of `"$@"` | `"$@"` preserves argument boundaries. |
| `cat file \| while read` then using variables after | Pipe creates a subshell. Use `done < file`. |
| `[ $a == $b ]` with unquoted/empty vars | Use `[[ "$a" == "$b" ]]`. |
| Using `-eq` on strings or `==` on numbers | `-eq` is numeric; `==` is string compare. |
| `cmd 2>&1 > file` | Wrong order; use `cmd > file 2>&1`. |
| Assuming `set -e` catches everything | It is ignored in `if` conditions, `&&`/`\|\|` lists, and subshell edge cases. Check critical commands explicitly. |
| Forgetting `pipefail` | `cmd_that_fails \| tee log` returns 0 without it. |
| Ignoring `cd` failures | `cd "$dir" \|\| exit 1`; otherwise later commands run in the wrong directory. |
| Using `local x=$(cmd)` | `local` masks `cmd`'s exit status. Do `local x; x=$(cmd)`. |
| Parsing `ls` output | Use globs or `find`. |
| `echo` with backslashes/flags | Use `printf '%s\n' "$var"` for reliable output. |
| Hard-coding relative paths | Use absolute paths or `cd "$(dirname "$0")"`. |
| Missing `#!/bin/bash` but using bashisms | Fails when run with `sh`/`dash`. |
| Cron works manually but fails scheduled | Environment differs (PATH, HOME); use absolute paths and log output. |
| Using `sudo` inside scripts blindly | Run the script with the right privileges or use targeted `sudoers` rules. |
| Secrets in scripts or `set -x` output | Leaks to logs and `ps`. Use env vars/vault; avoid tracing secrets. |
| Not handling failures of `curl`/`ssh` | Use `curl -fsS`, `ssh -o BatchMode=yes -o ConnectTimeout=5`, check exit codes. |
| Parsing JSON with grep/sed | Use **`jq`**. |
| Writing a 500-line shell script for complex logic | Use Python; shell is for glue. |
| Not testing with special filenames | Test with spaces, quotes, empty input, and missing files. |

---

## 24. Interview Answer (Short Version)

> A shell script is a text file of commands executed by an interpreter such as bash, used to automate tasks like deployments, backups, and health checks. I start scripts with a shebang, use `set -euo pipefail` for safety, quote all variables, and use functions with `local` variables for structure. I rely on exit codes for control flow, `trap` for cleanup, and tools like `grep`, `sed`, `awk`, `find`, and `xargs` for text processing. I schedule them with cron or systemd timers, debug with `bash -x` and ShellCheck, and move to Python when the logic gets complex.

**Closing line to add for a Senior DevOps role:**

> "I write scripts to be idempotent, with logging, meaningful exit codes, argument validation, and retries for flaky network calls, so they behave predictably in CI/CD pipelines. For anything beyond glue logic, such as API calls or data handling, I use Python with boto3 or requests, and manage repeatable configuration with Ansible."

---

## 25. Quick Command Cheat Sheet

```bash
# Run / debug
chmod +x s.sh && ./s.sh
bash -n s.sh                 # syntax check
bash -x s.sh                 # trace
shellcheck s.sh

# Safety header
set -euo pipefail
trap 'cleanup' EXIT

# Variables & args
"${VAR:-default}"  "${VAR:?msg}"  "$#"  "$@"  "$?"  "$$"

# Tests
[[ -f f ]]  [[ -d d ]]  [[ -z "$s" ]]  [[ "$a" == "$b" ]]  (( n > 5 ))

# Loops
for x in "${arr[@]}"; do ...; done
while IFS= read -r line; do ...; done < file

# Redirection
cmd > out 2>&1     cmd >> log     cmd 2>/dev/null     cmd | tee -a log

# String ops
${s#pre} ${s##pre} ${s%suf} ${s%%suf} ${s/a/b} ${s//a/b} ${#s} ${s:0:5}

# Text tools
grep -E "a|b" f | sed 's/x/y/g' | awk '{print $1}' | sort | uniq -c | sort -nr
find . -name "*.log" -mtime +7 -print0 | xargs -0 rm

# Scheduling
crontab -e ; crontab -l
```
