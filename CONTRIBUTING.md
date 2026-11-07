
## File placement (enforced)

Decide where a file lives BEFORE creating it. The contract in `.repo-layout.yml` lists the allowed top-level directories, the file types permitted in each, and the required community-standards files; `python tools/check_repo_layout.py` enforces it in CI. A new kind of file means updating the contract in the same PR.
