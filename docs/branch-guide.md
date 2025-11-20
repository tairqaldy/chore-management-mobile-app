# Branch Guide - Simple Workflow for Our Team

## 🌳 Our Branch Structure

Think of branches like a tree:

```
main (production - the final code)
  └── dev (development - where we test together)
      ├── f-tair (Tair's work)
      ├── f-francisco (Francisco's work)
      ├── f-klavs (Klavs' work)
      └── f-marcell (Marcell's work)
```

**Simple rule:** 
- Your feature branch (`f-yourname`) → goes to `dev`
- `dev` → goes to `main`
- You cannot skip `dev` and go straight to `main`

---

## 🚀 Starting Your Day

### Step 1: Get the latest code from dev

```bash
# Switch to dev branch
git checkout dev

# Get latest changes from GitHub
git pull origin dev
```

### Step 2: Switch to your feature branch

```bash
# If you already have your branch
git checkout f-tair

# If you need to create a new branch (first time only)
git checkout -b f-tair
```

### Step 3: Make sure your branch is up to date

```bash
# Pull latest dev changes into your branch
git pull origin dev
```

---

## 💻 Working on Your Feature

### Daily workflow:

1. **Check what you changed**
   ```bash
   git status
   ```
   This shows you what files you modified. **Always check this first!**

2. **Add your changes**
   ```bash
   # Add specific file
   git add app/(tabs)/index.tsx
   
   # Or add all changes (be careful!)
   git add .
   ```

3. **Commit with a clear message**
   ```bash
   git commit -m "feat: add login button"
   ```
   
   **Good commit messages:**
   - `feat: add user profile screen`
   - `fix: resolve navigation bug`
   - `style: update button colors`
   - `docs: add setup instructions`

4. **Push to your branch**
   ```bash
   git push origin f-tair
   ```

---

## 🔄 Merging Your Work to Dev

### When you're ready to share your work:

1. **Make sure everything is pushed**
   ```bash
   git status
   git push origin f-tair
   ```

2. **Notify Tair**
   Send a message like:
   ```
   "Hey Tair, I'm ready to merge f-tair into dev. Can you review?"
   ```

3. **Tair will create a Pull Request (PR)**
   - Tair will review your code
   - If everything looks good, Tair will merge it
   - Your code will be in `dev` branch

4. **After merge, update your branch**
   ```bash
   git checkout dev
   git pull origin dev
   git checkout f-tair
   git pull origin dev
   ```

---

## 📋 Common Commands Cheat Sheet

### Check where you are
```bash
# See current branch
git branch

# See what changed
git status
```

### Switch branches
```bash
# Go to dev
git checkout dev

# Go to your feature branch
git checkout f-tair
```

### Get latest code
```bash
# From dev branch
git checkout dev
git pull origin dev

# Update your feature branch with dev changes
git checkout f-tair
git pull origin dev
```

### Save your work
```bash
# See what changed
git status

# Add changes
git add .

# Commit
git commit -m "your message here"

# Push
git push origin f-tair
```

---

## ⚠️ Important Rules

### ✅ DO:
- Always check `git status` before committing
- Work on your own feature branch (`f-yourname`)
- Pull latest `dev` before starting new work
- Write clear commit messages
- Notify Tair before merging

### ❌ DON'T:
- Never use `-f` (force push) - it can break things!
- Never commit directly to `main` or `dev`
- Never skip `dev` and merge straight to `main`
- Never commit without checking `git status` first

---

## 🎯 Real Example Workflow

Let's say you want to add a new button:

### Morning (starting work):
```bash
# 1. Get latest code
git checkout dev
git pull origin dev

# 2. Switch to your branch
git checkout f-tair
git pull origin dev
```

### Working:
```bash
# 3. Make your changes (edit files in your code editor)

# 4. Check what you changed
git status
# Output shows: app/(tabs)/index.tsx modified

# 5. Add your changes
git add app/(tabs)/index.tsx

# 6. Commit
git commit -m "feat: add submit button to home screen"

# 7. Push
git push origin f-tair
```

### When ready to share:
```bash
# 8. Make sure everything is pushed
git status
git push origin f-tair

# 9. Notify Tair: "Ready to merge f-tair to dev"
```

### After Tair merges:
```bash
# 10. Update your branch
git checkout dev
git pull origin dev
git checkout f-tair
git pull origin dev
```

---

## 🆘 Troubleshooting

### "Your branch is behind"
```bash
git checkout dev
git pull origin dev
git checkout f-tair
git pull origin dev
```

### "I'm on the wrong branch"
```bash
# Check current branch
git branch

# Switch to correct branch
git checkout f-tair
```

### "I made a mistake in my commit"
```bash
# Undo last commit (keeps your changes)
git reset --soft HEAD~1

# Now you can fix and commit again
git add .
git commit -m "fixed: correct message"
```

### "I accidentally committed to dev"
```bash
# Don't panic! Switch to your branch first
git checkout f-tair

# Then cherry-pick your commit (ask Tair for help if needed)
```

---

## 📞 Need Help?

- **For merges**: Always contact Tair
- **For questions**: Ask in team chat
- **For problems**: Don't hesitate to ask - better safe than sorry!

---

## 🎓 Quick Reference

**Starting work:**
```bash
git checkout dev && git pull origin dev
git checkout f-tair && git pull origin dev
```

**Saving work:**
```bash
git status
git add .
git commit -m "your message"
git push origin f-tair
```

**Ready to merge:**
1. Push everything
2. Notify Tair
3. Wait for merge
4. Update your branch

**Remember:** 
- Check `git status` always
- Never use `-f`
- Work on your feature branch
- Notify Tair before merging

---

Happy coding! 🚀

