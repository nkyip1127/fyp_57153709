# Deployment Guide - MST Visualizer Website

This guide provides step-by-step instructions for publishing your MST Visualizer as a live website.

---

## 🚀 Quick Start: Deploy to Vercel (Recommended)

**Vercel is the easiest option for Next.js projects** - it's made by the creators of Next.js and requires minimal configuration.

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Prepare Your Code:**
   ```bash
   # Make sure your code is committed to Git
   git add .
   git commit -m "Ready for deployment"
   ```

2. **Push to GitHub:**
   - Create a repository on GitHub (if you haven't already)
   - Push your code:
     ```bash
     git remote add origin https://github.com/yourusername/mst-visualizer.git
     git push -u origin main
     ```

3. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login (you can use GitHub account)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your site will be live at `https://your-project-name.vercel.app`

4. **Custom Domain (Optional):**
   - In Vercel dashboard, go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   # In your project directory
   vercel
   ```
   - Follow the prompts
   - Choose production deployment
   - Your site will be deployed and you'll get a URL

4. **For Production:**
   ```bash
   vercel --prod
   ```

---

## 🌐 Alternative: Deploy to Netlify

### Method 1: Netlify Dashboard

1. **Push to GitHub** (same as Vercel step 1-2)

2. **Deploy on Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/Login (GitHub account works)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Configure build settings:
     - **Build command:** `npm run build`
     - **Publish directory:** `.next` (or leave default)
   - Click "Deploy site"
   - Wait for build to complete
   - Your site will be live at `https://random-name.netlify.app`

3. **Update Netlify Configuration:**
   Create `netlify.toml` in project root:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"
   
   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

### Method 2: Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

---

## 📦 Static Export (For GitHub Pages or Any Static Hosting)

If you want to deploy as a static site (no server-side features), you can export your Next.js app:

### Step 1: Update `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Enable static export
  images: {
    unoptimized: true, // Required for static export
  },
  // Disable features that require server
  trailingSlash: true,
}

module.exports = nextConfig
```

### Step 2: Build Static Files

```bash
npm run build
```

This creates an `out` folder with all static files.

### Step 3: Deploy to GitHub Pages

1. **Install gh-pages package:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add deploy script to `package.json`:**
   ```json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d out"
     }
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

4. **Enable GitHub Pages:**
   - Go to your GitHub repository
   - Settings → Pages
   - Source: `gh-pages` branch
   - Your site will be at `https://yourusername.github.io/repository-name`

### Step 4: Deploy to Any Static Host

Upload the `out` folder contents to:
- **GitHub Pages** (as above)
- **Cloudflare Pages**
- **AWS S3 + CloudFront**
- **Any web hosting service**

---

## 🐳 Deploy with Docker (For VPS/Cloud Servers)

### Step 1: Create `Dockerfile`

Create `Dockerfile` in project root:

```dockerfile
# Use the official Node.js runtime as base image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Step 2: Update `next.config.js` for Standalone

```javascript
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Enable standalone output
}
```

### Step 3: Build and Run

```bash
# Build Docker image
docker build -t mst-visualizer .

# Run container
docker run -p 3000:3000 mst-visualizer
```

### Step 4: Deploy to Cloud Services

- **AWS ECS/EC2**
- **Google Cloud Run**
- **Azure Container Instances**
- **DigitalOcean App Platform**
- **Railway** (supports Docker)

---

## 🚂 Deploy to Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login:**
   ```bash
   railway login
   ```

3. **Initialize:**
   ```bash
   railway init
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

Railway auto-detects Next.js and deploys automatically.

---

## ☁️ Deploy to Render

1. **Create Account:** [render.com](https://render.com)

2. **New Web Service:**
   - Connect your GitHub repository
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
   - Environment: Node

3. **Deploy:**
   - Click "Create Web Service"
   - Render will build and deploy automatically

---

## 🔧 Pre-Deployment Checklist

Before deploying, ensure:

### 1. Test Build Locally

```bash
# Build the project
npm run build

# Test production build locally
npm start
```

Visit `http://localhost:3000` and test all features.

### 2. Environment Variables (if needed)

If you add environment variables later, create `.env.local`:
```env
NEXT_PUBLIC_APP_NAME=MST Visualizer
```

For Vercel/Netlify, add these in their dashboard under Environment Variables.

### 3. Update README

Update your README with:
- Live demo link
- Deployment instructions
- Project description

### 4. Optimize Images (if you add any)

Next.js Image component is already optimized, but ensure any images are optimized.

### 5. Check for Errors

```bash
# Run linter
npm run lint

# Fix any errors
npm run lint -- --fix
```

---

## 📝 Recommended Deployment Steps

**For FYP Demo/Portfolio (Recommended: Vercel):**

1. ✅ Push code to GitHub
2. ✅ Deploy to Vercel (takes 5 minutes)
3. ✅ Get live URL: `https://your-project.vercel.app`
4. ✅ Add to your portfolio/resume
5. ✅ Share with FYP examiners

**Why Vercel?**
- ✅ Free tier (perfect for FYP)
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Zero configuration
- ✅ Instant deployments on git push
- ✅ Made by Next.js creators

---

## 🔗 Quick Links

- **Vercel:** https://vercel.com
- **Netlify:** https://netlify.com
- **GitHub Pages:** https://pages.github.com
- **Railway:** https://railway.app
- **Render:** https://render.com

---

## 🆘 Troubleshooting

### Build Fails

**Error: Module not found**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

**Error: TypeScript errors**
```bash
# Fix TypeScript errors
npm run lint
# Or disable strict mode temporarily in tsconfig.json
```

### Deployment Fails

**Check build logs:**
- Vercel/Netlify show build logs in dashboard
- Look for specific error messages
- Common issues: missing dependencies, TypeScript errors, environment variables

### Site Not Loading

**Check:**
- Build completed successfully
- No runtime errors in browser console
- Correct deployment URL
- HTTPS enabled (should be automatic)

---

## 📊 Performance Tips

After deployment:

1. **Check Lighthouse Score:**
   - Open Chrome DevTools
   - Run Lighthouse audit
   - Aim for 90+ scores

2. **Optimize Bundle Size:**
   - Check bundle analyzer: `npm install @next/bundle-analyzer`
   - Remove unused dependencies

3. **Enable Caching:**
   - Vercel/Netlify handle this automatically
   - Static assets are cached

---

## 🎯 Final Steps

1. **Test Live Site:**
   - Visit your deployed URL
   - Test all features
   - Check on mobile devices
   - Verify algorithm works correctly

2. **Update Documentation:**
   - Add live demo link to README
   - Update FYP report with deployment URL

3. **Share:**
   - Share with FYP examiners
   - Add to portfolio
   - Include in resume

---

**Your site will be live and accessible worldwide! 🌍**

