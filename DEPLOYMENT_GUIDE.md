# MIT Marks Portal - Deployment Guide

## 🚀 Deploy to Render (Free Hosting)

### Step 1: Prepare Your Code
1. Push your code to GitHub:
   ```bash
   cd "c:\Users\AVIRATH GOWDA H K\OneDrive\Desktop\MIT-Marks-Portal"
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a GitHub repository and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/MIT-Marks-Portal.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy on Render
1. Go to https://render.com and sign up (free)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Render will auto-detect the `render.yaml` file
5. Click "Create Web Service"

### Step 3: Get Your Live URL
- After deployment (5-10 minutes), you'll get a URL like:
  `https://mit-marks-portal.onrender.com`
- Share this URL with your users!

---

## 🌐 Alternative: PythonAnywhere (Easier for Beginners)

### Step 1: Sign Up
1. Go to https://www.pythonanywhere.com
2. Create a free account

### Step 2: Upload Your Code
1. Open a Bash console
2. Clone your repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/MIT-Marks-Portal.git
   cd MIT-Marks-Portal/backend_django
   ```

### Step 3: Setup Virtual Environment
```bash
mkvirtualenv --python=/usr/bin/python3.10 myenv
pip install -r requirements.txt
```

### Step 4: Configure Web App
1. Go to "Web" tab → "Add a new web app"
2. Choose "Manual configuration" → Python 3.10
3. Set source code: `/home/YOUR_USERNAME/MIT-Marks-Portal/backend_django`
4. Set WSGI file to point to `backend_django.wsgi`
5. Set virtualenv: `/home/YOUR_USERNAME/.virtualenvs/myenv`

### Step 5: Run Migrations
```bash
python manage.py migrate
python manage.py collectstatic
```

### Step 6: Reload and Access
- Click "Reload" button
- Your URL: `https://YOUR_USERNAME.pythonanywhere.com`

---

## 📱 Quick Local Testing

Before deploying, test locally:
```bash
cd backend_django
python manage.py runserver
```
Access at: http://localhost:8000

---

## 🔒 Important Notes

1. **Database**: Currently using SQLite. For production with many users, consider PostgreSQL
2. **Secret Key**: Render auto-generates a secure SECRET_KEY
3. **Debug Mode**: Automatically set to False in production
4. **Static Files**: Handled by WhiteNoise (no separate server needed)

---

## 🆘 Troubleshooting

### Build Fails on Render
- Check build logs in Render dashboard
- Ensure all dependencies are in requirements.txt

### Static Files Not Loading
- Run: `python manage.py collectstatic`
- Check STATIC_ROOT in settings.py

### Database Issues
- Run migrations: `python manage.py migrate`
- Check database file permissions

---

## 📞 Support

For issues, check:
- Render Docs: https://render.com/docs
- PythonAnywhere Help: https://help.pythonanywhere.com
- Django Deployment: https://docs.djangoproject.com/en/stable/howto/deployment/
