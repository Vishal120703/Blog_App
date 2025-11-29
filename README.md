# Blog Website - Complete Blogging Platform

A full-featured blog website built with Node.js, Express, MongoDB, and EJS. This platform allows users to create, edit, delete, and manage blog posts with features like likes, comments, search, and user authentication.

## Features

### User Features
- ✅ User Registration & Login (JWT-based authentication)
- ✅ Create, Edit, and Delete Blog Posts
- ✅ Upload Images for Blog Posts
- ✅ Like Posts
- ✅ Comment on Posts
- ✅ Search Functionality
- ✅ User Dashboard with Post Management
- ✅ View Post Statistics (Views, Likes)

### Security Features
- ✅ Password Hashing (bcrypt)
- ✅ JWT Token Authentication
- ✅ Session Management
- ✅ Input Validation & Sanitization
- ✅ File Upload Validation (Image types only, size limits)
- ✅ Protected Routes
- ✅ CSRF Protection Ready

### UI/UX Features
- ✅ Responsive Design (Bootstrap 5)
- ✅ Modern and Clean Interface
- ✅ Error & Success Messages
- ✅ 404 Error Page
- ✅ Contact Page
- ✅ Dynamic Navigation (shows login/logout based on auth state)

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Template Engine**: EJS
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Styling**: Bootstrap 5
- **Password Hashing**: bcryptjs

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mongoDB
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/Student
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   SESSION_SECRET=your_super_secret_session_key_change_this_in_production
   PORT=3000
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # Windows
   mongod
   
   # Linux/Mac
   sudo systemctl start mongod
   ```

5. **Run the application**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   
   Open your browser and navigate to: `http://localhost:3000`

## Project Structure

```
mongoDB/
├── config/
│   └── dbConnect.js          # MongoDB connection configuration
├── middleware/
│   ├── loggerMiddleware.js   # JWT authentication middleware
│   └── optionalAuth.js       # Optional auth for public pages
├── models/
│   ├── postData.js           # Blog post schema
│   └── userData.js           # User schema
├── routes/
│   ├── home.js               # Home page & post routes
│   ├── users.js              # Authentication routes
│   ├── allFiles.js           # Blog post CRUD operations
│   ├── about.js              # About page
│   └── contact.js            # Contact page
├── views/
│   ├── element/              # Reusable components (header, navbar, footer)
│   ├── index.ejs             # Home page
│   ├── login.ejs             # Login page
│   ├── signup.ejs            # Registration page
│   ├── dashboard.ejs         # User dashboard
│   ├── blog_post.ejs         # Create post page
│   ├── edit_post.ejs         # Edit post page
│   ├── single_post.ejs       # Single post view
│   ├── about.ejs             # About page
│   ├── contact.ejs           # Contact page
│   └── 404.ejs               # 404 error page
├── uploads/                  # Uploaded images directory
├── public/                   # Static files
├── app.js                    # Main application file
└── package.json              # Dependencies
```

## API Routes

### Public Routes
- `GET /` - Home page (list all blog posts)
- `GET /post/:id` - View single blog post
- `GET /about` - About page
- `GET /contact` - Contact page
- `GET /user/login` - Login page
- `GET /user/signup` - Registration page
- `POST /user/login` - Login authentication
- `POST /user/signup` - User registration
- `POST /post/:id/like` - Like a post (requires auth)
- `POST /post/:id/comment` - Comment on a post (requires auth)

### Protected Routes (Require Authentication)
- `GET /user/dashboard` - User dashboard
- `GET /user/dashboard/post` - Create new post page
- `POST /user/dashboard/post` - Create new post
- `GET /user/dashboard/post/edit/:id` - Edit post page
- `POST /user/dashboard/post/edit/:id` - Update post
- `DELETE /user/dashboard/post/delete/:id` - Delete post
- `GET /user/logout` - Logout

## Features in Detail

### Authentication
- JWT-based authentication with 7-day token expiration
- Secure password hashing using bcrypt (10 salt rounds)
- Session management for flash messages
- Protected routes with middleware

### Blog Post Management
- Create posts with title, category, content, and optional image
- Edit existing posts (only by owner)
- Delete posts (only by owner)
- Image upload with validation (JPEG, PNG, GIF, WebP, AVIF)
- File size limit: 5MB

### Social Features
- Like/Unlike posts
- Comment on posts
- View count tracking
- Like count tracking

### Search
- Search across title, content, category, and author
- Case-insensitive search
- Real-time search results

## Security Considerations

1. **Environment Variables**: Never commit `.env` file. Use `.env.example` as a template.
2. **JWT Secret**: Use a strong, random secret key in production.
3. **Password Security**: Passwords are hashed using bcrypt.
4. **File Upload**: Only image files are allowed with size restrictions.
5. **Input Validation**: All user inputs are validated and sanitized.
6. **Authentication**: Protected routes require valid JWT tokens.

## Development

### Adding New Features

1. Create routes in `routes/` directory
2. Add corresponding views in `views/` directory
3. Update navigation in `views/element/navbar.ejs` if needed
4. Add middleware for authentication if required

### Database Models

- **User Model**: Stores user credentials (name, username, email, password)
- **Blog Model**: Stores blog posts (title, category, content, image, author, views, likes, comments)

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env` file
- Verify MongoDB port (default: 27017)

### Authentication Issues
- Clear browser cookies
- Check JWT_SECRET in `.env` file
- Verify token expiration

### File Upload Issues
- Check `uploads/` directory exists
- Verify file size (max 5MB)
- Ensure file type is allowed

## Future Enhancements

- [ ] Pagination for blog posts
- [ ] Rich text editor for blog content
- [ ] User profiles
- [ ] Email notifications
- [ ] Social media sharing
- [ ] Tags system
- [ ] Admin panel
- [ ] Image optimization
- [ ] Rate limiting
- [ ] API documentation

## License

ISC

## Author

Vishal Gupta

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
