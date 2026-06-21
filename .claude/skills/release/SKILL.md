---
name: release
description: Publish a new release of Health Timer. Bumps the version in package.json, commits, tags, and pushes to GitHub to trigger the CI release workflow. Use when the user says "/release" or "publish a release".
---

# Release Skill

Publishes a new Health Timer release by bumping the version, tagging, and pushing to GitHub.
The GitHub Actions workflow then builds the macOS .dmg and Windows .exe and attaches them to the Release.

## Steps — execute in order, do not skip

### Step 1: Read current version

Read `health-timer/package.json` and extract the current `version` field. Show it to the user.

### Step 2: Determine new version

If the user provided a version as an argument (e.g. `/release 1.2.0`), use it directly.

Otherwise, propose three options and ask the user to choose:
- **patch** → increment last number (e.g. 0.1.0 → 0.1.1) — for bug fixes
- **minor** → increment middle number (e.g. 0.1.0 → 0.2.0) — for new features
- **major** → increment first number (e.g. 0.1.0 → 1.0.0) — for breaking changes

### Step 3: Confirm before making any changes

Show the user: "Ready to release vX.Y.Z — this will commit, tag, and push to GitHub. Confirm?"
Wait for explicit confirmation before proceeding.

### Step 4: Update package.json

Edit `health-timer/package.json` and set `"version"` to the new version string.

### Step 5: Verify working tree

Run `git status`. If there are uncommitted changes beyond `health-timer/package.json`, warn the user and ask whether to include them in the release commit or abort.

### Step 6: Commit, tag, push

Run the following commands in sequence, stopping and reporting any error:

```bash
git add health-timer/package.json
git commit -m "Release vX.Y.Z"
git tag vX.Y.Z
git push origin HEAD --tags
```

### Step 7: Report result

Confirm success and remind the user:
- The GitHub Actions workflow is now running (macOS + Windows builds take ~10 minutes)
- The Release will appear at: `https://github.com/<owner>/<repo>/releases`
- They can monitor progress in the **Actions** tab of the repository
