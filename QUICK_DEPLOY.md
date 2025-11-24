# 🚀 Quick Deploy - 5 Minute Guide

## Fastest Way to Deploy (Vercel - Recommended)

### Step 1: Test Build Locally (2 minutes)

```bash
# Make sure everything works
npm run build
npm start
```

Visit `http://localhost:3000` and verify everything works.

### Step 2: Push to GitHub (2 minutes)

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# Create repository on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/mst-visualizer.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel (1 minute)

1. Go to **[vercel.com](https://vercel.com)**
2. Click **"Sign Up"** (use GitHub account)
3. Click **"Add New Project"**
4. Import your GitHub repository
5. Click **"Deploy"** (no configuration needed!)
6. Wait 2-3 minutes
7. **Done!** Your site is live at `https://your-project.vercel.app`

### Step 4: Share Your Live Site

- ✅ Copy your Vercel URL
- ✅ Add to your FYP report
- ✅ Share with examiners
- ✅ Add to portfolio

---

## Alternative: Deploy to Netlify

1. Go to **[netlify.com](https://netlify.com)**
2. Sign up with GitHub
3. Click **"Add new site"** → **"Import an existing project"**
4. Select your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next` (or leave default)
6. Click **"Deploy site"**
7. Done! Site live at `https://random-name.netlify.app`

---

## Troubleshooting

**Build fails?**
```bash
# Clear cache and rebuild
rm -rf node_modules .next
npm install
npm run build
```

**TypeScript errors?**
```bash
npm run lint
```

**Need help?** See `DEPLOYMENT_GUIDE.md` for detailed instructions.

---

**That's it! Your MST Visualizer is now live on the internet! 🌐**

