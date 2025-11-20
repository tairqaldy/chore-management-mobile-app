# chore-management-mobile-app

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git
- Expo CLI (optional, but recommended)

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project-4/chore-management-mobile-app/chore-management-expo-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   This will start the Expo development server. You can then:
   - Press `i` to open iOS simulator
   - Press `a` to open Android emulator
   - Press `w` to open in web browser
   - Scan QR code with Expo Go app on your phone

### Development Commands

```bash
# Start Expo development server
npm start

# Start for specific platform
npm run android    # Android emulator
npm run ios        # iOS simulator
npm run web        # Web browser

# Lint code
npm run lint
```

---

## 🌿 Branch Structure

Our repository follows this branch structure:

```
main (production)
  └── dev (development)
      ├── f-tair (Tair's feature branch)
      ├── f-francisco (Francisco's feature branch)
      ├── f-klavs (Klavs' feature branch)
      └── f-marcell (Marcell's feature branch)
```

### Branch Workflow

- **`main`**: Production-ready code. Only merged from `dev` after thorough testing.
- **`dev`**: Development branch. All feature branches merge here first.
- **`f-*`**: Individual feature branches for each developer.

---

## 📝 Git Workflow

### Starting Development

1. **Always start from `dev` branch**
   ```bash
   git checkout dev
   git pull origin dev
   ```

2. **Create or switch to your feature branch**
   ```bash
   # If branch doesn't exist, create it
   git checkout -b f-tair
   
   # If branch already exists, switch to it
   git checkout f-tair
   ```

3. **Pull latest changes from dev**
   ```bash
   git pull origin dev
   ```

### Daily Development Workflow

1. **Check your current status**
   ```bash
   git status
   ```
   ⚠️ **ALWAYS check `git status` before committing to avoid mistakes!**

2. **Make your changes and stage them**
   ```bash
   # Stage specific files
   git add app/(tabs)/index.tsx
   
   # Stage all changes (use carefully)
   git add .
   ```

3. **Commit with a clear message**
   ```bash
   git commit -m "feat: add user authentication screen"
   ```

4. **Push to your feature branch**
   ```bash
   git push origin f-tair
   ```

### Merging Process

**⚠️ IMPORTANT: Tair handles all merges. Always notify Tair before merging!**

#### Merging Feature Branch to Dev

1. **Notify Tair** via team chat/communication channel:
   ```
   "Hey Tair, I'm ready to merge f-tair into dev. Can you review and merge?"
   ```

2. **Tair will handle the merge:**
   ```bash
   # Tair will run these commands:
   git checkout dev
   git pull origin dev
   git merge f-tair
   git push origin dev
   ```

3. **After merge, update your feature branch:**
   ```bash
   git checkout f-tair
   git pull origin dev
   ```

#### Merging Dev to Main

Only Tair performs this merge after team approval and testing.

### Common Git Commands

```bash
# Check current branch
git branch

# See all branches
git branch -a

# Switch branches
git checkout dev
git checkout f-tair

# Create and switch to new branch
git checkout -b f-tair

# Pull latest changes
git pull origin dev

# Push changes
git push origin f-tair

# View commit history
git log --oneline

# View changes
git diff

# Check status (ALWAYS do this before committing!)
git status
```

### ⚠️ Important Git Rules

- **NEVER use `-f` (force) flag** - This can overwrite team members' work
- **ALWAYS check `git status`** before committing
- **ALWAYS notify Tair** before requesting a merge
- **NEVER commit directly to `main` or `dev`** - use your feature branch

---

## 📱 Expo Application Structure

```
chore-management-expo-app/
├── app/                    # Main application code
│   ├── _layout.tsx        # Root layout
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── _layout.tsx    # Tab layout
│   │   ├── index.tsx      # Home screen
│   │   └── explore.tsx    # Explore screen
│   └── modal.tsx          # Modal screen
├── components/             # Reusable components
│   ├── ui/                # UI components
│   └── ...                # Other components
├── constants/             # App constants (themes, etc.)
├── hooks/                 # Custom React hooks
├── assets/                # Images, fonts, etc.
├── docs/                  # Project documentation
└── package.json           # Dependencies and scripts
```

### Development Guidelines

1. **Screen Development**: Add new screens in `app/(tabs)/` or create new route folders
2. **Components**: Place reusable components in `components/`
3. **Styling**: Use StyleSheet or theme constants from `constants/theme.ts`
4. **Navigation**: Use Expo Router for navigation (file-based routing)

### Testing Your Changes

1. **Start the development server**
   ```bash
   npm start
   ```

2. **Test on your preferred platform**
   - Use Expo Go app on your phone (scan QR code)
   - Use iOS simulator (Mac only)
   - Use Android emulator
   - Use web browser

3. **Check for errors**
   - Watch the terminal for compilation errors
   - Check the Expo DevTools in your browser
   - Use `npm run lint` to check code quality

---

## 💬 Commit Message Guidelines

Write clear, descriptive commit messages:

### Format
```
<type>: <description>

[optional body]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```bash
# Good commit messages
git commit -m "feat: add user login screen"
git commit -m "fix: resolve navigation issue on Android"
git commit -m "docs: update API documentation"
git commit -m "style: format code with prettier"
git commit -m "refactor: simplify authentication logic"

# Bad commit messages (avoid these)
git commit -m "update"
git commit -m "fix stuff"
git commit -m "changes"
```

### Before Committing Checklist

1. ✅ Run `git status` to see what you're committing
2. ✅ Make sure you're on your feature branch (`f-tair`, `f-francisco`, etc.)
3. ✅ Test your changes locally
4. ✅ Write a clear commit message
5. ✅ Don't commit unnecessary files (node_modules, .env, etc.)

---

## 📚 Documentation Workflow

### Committing Documentation to Dev

**Anyone can commit documentation directly to `dev` branch** (no merge needed for docs only).

### Steps:

1. **Switch to dev branch**
   ```bash
   git checkout dev
   git pull origin dev
   ```

2. **Add only the documentation file**
   ```bash
   git add docs/Analysis.md
   # or
   git add docs/README.md
   # or specific doc file
   ```

3. **Commit with clear message**
   ```bash
   git commit -m "docs: add user analysis document"
   ```

4. **Push to dev**
   ```bash
   git push origin dev
   ```

5. **Switch back to your feature branch**
   ```bash
   git checkout f-tair
   ```

### Documentation Guidelines

- Use **simple, clear language**
- Make documentation **iterative** - update as you learn more
- Place all docs in `docs/` folder
- Use descriptive filenames (e.g., `Analysis.md`, `API.md`, `Architecture.md`)

### Example Documentation Commits

```bash
# Adding a new document
git checkout dev
git add docs/Analysis.md
git commit -m "docs: add initial user analysis"
git push origin dev
git checkout f-tair

# Updating existing document
git checkout dev
git add docs/README.md
git commit -m "docs: update setup instructions"
git push origin dev
git checkout f-tair
```

---

## 🆘 Troubleshooting

### Common Issues

**Issue**: "Your branch is behind 'origin/dev'"
```bash
git checkout dev
git pull origin dev
git checkout f-tair
git merge dev
```

**Issue**: Merge conflicts
- Don't panic! Contact Tair for help
- Never use `-f` flag to force push

**Issue**: Accidentally committed to wrong branch
```bash
# Undo last commit (keeps changes)
git reset --soft HEAD~1
# Switch to correct branch
git checkout f-tair
# Commit again
git commit -m "your message"
```

**Issue**: Expo server not starting
```bash
# Clear cache
npm start -- --clear
# Or reinstall dependencies
rm -rf node_modules
npm install
```

---

## 📞 Team Communication

- **For merges**: Always notify Tair before requesting a merge
- **For questions**: Use team chat/communication channel
- **For blockers**: Don't hesitate to ask for help
- **For documentation**: Commit directly to dev (no merge needed)

---

## ✅ Quick Reference

### Daily Workflow
```bash
# 1. Check status
git status

# 2. Switch to dev and pull latest
git checkout dev
git pull origin dev

# 3. Switch to your feature branch
git checkout f-tair

# 4. Make changes, then commit
git add .
git commit -m "feat: your feature description"
git push origin f-tair

# 5. Notify Tair for merge
```

### Starting Fresh Day
```bash
git checkout dev
git pull origin dev
git checkout f-tair
git pull origin dev
npm start
```

---

**Remember**: Always check `git status`, never use `-f`, and notify Tair before merging! 🚀

