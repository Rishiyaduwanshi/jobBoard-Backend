# **Job Board API**  

A robust backend API for a job board application where recruiters can post jobs and applicants can apply for them.  

- **Frontend:** [Job Board Client](https://jobboard-cts.pages.dev)  
- **Backend:** [Job Board Server](https://job-board-w9i4v.ondigitalocean.app/)  

## **🌟 Features**  

### 🔑 **Authentication System**  
- User signup and signin with JWT  
- Role-based access (Applicant/Recruiter)  

### 👤 **Profile Management**  
- Complete profile management for both applicants and recruiters  
- Resume/portfolio links for applicants  
- Company details for recruiters  

### 📌 **Job Management**  
- Create, read, update, and delete job listings  
- Advanced filtering (location, salary range, experience level, job type)  
- Comprehensive job details  

### 📩 **Application System**  
- Apply for jobs  
- Track application status  
- Application management for recruiters  

## **🛠 Tech Stack**  

- **Runtime:** Node.js  
- **Framework:** Express.js  
- **Database:** MongoDB with Mongoose  
- **Authentication:** JWT (JSON Web Tokens)  
- **Logging:** Winston & Morgan  

---

## **🚀 Getting Started**  

### **📌 Prerequisites**  
Ensure you have the following installed on your system:  
- **Node.js (v16+)**  
- **MongoDB**  
- **npm** or **yarn**  

### **⚡ Installation**  

1. **Clone the repository**  
   ```bash
   git clone https://github.com/rishiyaduwanshi/jobBoard-backend.git
   cd jobBoard-backend
   ```

2. **Install dependencies**  
   ```bash
   npm install
   ```

3. **Create environment configuration files**  
   - Create `.dev.env` for development  
   - Create `.env` for production  

   **Example environment variables:**  
   ```plaintext
   PORT=2622
   MODE=DEV
   MONGO_URI=mongodb://localhost:27017/jobboard
   JWT_SECRET=your_jwt_secret
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start the development server**  
   ```bash
   npm run dev
   ```

---

## **📌 API Endpoints**  

### 🔑 **Authentication**  
- `POST /api/v1/signup` - Register a new user  
- `POST /api/v1/signin` - Login with email and password  
- `POST /api/v1/signout` - Logout current user  
- `GET /api/v1/auth/me` - Get current authenticated user  

### 👤 **Profile Management**  
- `GET /api/v1/profile` - Get user profile  
- `PATCH /api/v1/profile` - Update user profile  

### 📌 **Jobs**  
- `POST /api/v1/jobs` - Create a new job (**recruiter only**)  
- `GET /api/v1/jobs` - Get all jobs with optional filters  
- `GET /api/v1/jobs/{jobId}` - Get a specific job by ID  
- `PATCH /api/v1/jobs/{jobId}` - Update a job (**recruiter only**)  
- `DELETE /api/v1/jobs/{jobId}` - Delete a job (**recruiter only**)  

### 📩 **Applications**  
- `POST /api/v1/jobs/apply` - Apply for a job (**applicant only**)  
- `GET /api/v1/applications` - Get all applications (**recruiter only**)  
- `PATCH /api/v1/applications/status` - Update application status (**recruiter only**)  

---

## **👨‍💻 Author**  
**Abhinav Prakash**  

