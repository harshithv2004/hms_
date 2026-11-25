# Patient Admission Management System

A full-stack Patient Admission Management web application built for the **Software Engineer Intern Round 1 assignment at DScribe (Unriddle Technologies Pvt Ltd)**.

The system allows hospital administration and medical staff to manage inpatient census records, search patients by name, filter by department/ward/doctor, monitor real-time hospital statistics, update patient information, mark patients as discharged, and permanently remove records with strict two-tier data validation.

---

## 🚀 Live Demo & Repository
- **GitHub Repository**: *(Push this workspace directly to your public GitHub repo)*
- **Live Deployment URL**: `https://<your-project-name>.vercel.app` *(Placeholder - deploy via Vercel)*
- **Database**: Neon Serverless PostgreSQL (`ep-*.neon.tech`)

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js 18+ (scaffolded with Vite)
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router DOM (v7)
- **Icons**: Lucide React
- **Validation**: Client-side mirror validation with immediate inline feedback

### Backend
- **Framework**: Python 3.13+ with Flask (REST API)
- **ORM & Database Toolkit**: Flask-SQLAlchemy & SQLAlchemy 2.0
- **PostgreSQL Driver**: `psycopg2-binary`
- **CORS Handling**: `Flask-CORS`
- **Test Framework**: `pytest`
- **Deployment**: Vercel Serverless Python Functions (`/api/index.py`) & WSGI

### Database
- **Primary / Production**: PostgreSQL (Neon Serverless PostgreSQL with SSL pooling)
- **Local Fallback**: SQLite automatically initialized if no `DATABASE_URL` is set

---

## 📋 Features

### 1. Dashboard & Census Overview
- Real-time statistics derived directly from backend SQL aggregations:
  - **Total Patients**: Cumulative patient admission count.
  - **Currently Admitted**: Active patients currently admitted in hospital wards.
  - **Discharged Patients**: Patients successfully discharged.
  - **Active Departments**: Specialty units tracking.
- Summary cards with clean hospital-grade typography and status indicators.

### 2. Patient Admission (Add Patient)
- Strict validation across all 8 mandatory fields:
  1. **Name**: Text only (letters and spaces, 2–100 characters). Numbers and special characters rejected.
  2. **Age**: Integer (0 to 120). Decimals, negatives, and non-numeric values rejected.
  3. **Gender**: Dropdown (`Male`, `Female`, `Other`).
  4. **Ward**: Dropdown (`General Ward A`, `General Ward B`, `ICU`, `Pediatrics Ward`, `Maternity Ward`, `Orthopedic Ward`, `Cardiology Ward`, `Emergency Care`).
  5. **Department**: Dropdown (`General Medicine`, `Cardiology`, `Orthopedics`, `Pediatrics`, `Neurology`, `Obstetrics & Gynecology`, `General Surgery`, `Dermatology`).
  6. **Doctor**: Dropdown synchronized with departmental staff.
  7. **Admission Date**: Date picker (must not be in the future).
  8. **Status**: Initialized as `Admitted` or `Discharged`.

### 3. Patient Directory & Management
- Responsive table with clear status badges (`Admitted` in Amber, `Discharged` in Emerald).
- Real-time search by patient name (case-insensitive substring search executed on the backend).
- Multi-dimensional filters:
  - Filter by **Ward**
  - Filter by **Department**
  - Filter by **Attending Doctor**
  - Filter by **Status**
  - **Clear Filters** button to reset filters instantly.
- **Mark as Discharged**: One-click action to discharge admitted patients with prevention of duplicate discharges.
- **Edit Patient**: Pre-loads current record into the admission form for updates.
- **Delete Patient**: Prompts a confirmation modal dialog before permanently removing the record from PostgreSQL.

---

## 🏛️ Architecture & Folder Structure

```
.
├── api/
│   └── index.py               # Vercel Serverless Function entry point
├── backend/
│   ├── app/
│   │   ├── __init__.py        # Flask app factory, CORS, and blueprint registration
│   │   ├── config.py          # Environment configuration & Neon PostgreSQL URI handling
│   │   ├── extensions.py      # SQLAlchemy db instance
│   │   ├── models.py          # Patient model schema & to_dict serializer
│   │   ├── routes.py          # REST API endpoints (GET, POST, PUT, DELETE, PATCH)
│   │   └── validation.py      # Authoritative validation logic and options catalogue
│   ├── tests/
│   │   └── test_patients.py   # Complete 17-case Pytest automated test suite
│   ├── run.py                 # Local server runner with automatic sample seed
│   └── requirements.txt       # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/        # UI Cards, Form, Table, Search/Filter, DeleteModal, Sidebar
│   │   ├── pages/             # DashboardPage, NewPatientPage, EditPatientPage
│   │   ├── services/          # Axios API communication service
│   │   ├── utils/             # Client-side validation mirror
│   │   ├── App.jsx            # Routing configuration
│   │   ├── main.jsx           # React DOM root
│   │   └── index.css          # Tailwind CSS styles
│   ├── package.json
│   └── vite.config.js         # Vite configuration with proxy to Flask
├── .env.example               # Template environment variables
├── .gitignore                 # Standard git ignore definitions
├── vercel.json                # Vercel Monorepo build and route rewrites
├── requirements.txt           # Root requirements for Vercel Python runtime
└── README.md                  # Project documentation
```

---

## 🗄️ Database Schema

### Table: `patients`

| Column | Type | Constraints / Attributes | Description |
|---|---|---|---|
| `id` | Integer | Primary Key, Autoincrement | Unique patient ID |
| `name` | String(120) | NOT NULL, Indexed | Full patient name |
| `age` | Integer | NOT NULL | Age in years (0 - 120) |
| `gender` | String(20) | NOT NULL | Male / Female / Other |
| `ward` | String(50) | NOT NULL, Indexed | Hospital ward name |
| `department` | String(50) | NOT NULL, Indexed | Medical department |
| `doctor` | String(80) | NOT NULL, Indexed | Assigned physician |
| `admission_date` | Date | NOT NULL | Admission date (no future dates) |
| `status` | String(20) | NOT NULL, Default: `'Admitted'`, Indexed | Status (`Admitted` / `Discharged`) |
| `created_at` | DateTime | NOT NULL, UTC | Timestamp when record was created |
| `updated_at` | DateTime | NOT NULL, UTC | Timestamp when record was last updated |

---

## 🔌 REST API Specification

| Method | Endpoint | Description | Request Body / Query Params | Status Codes |
|---|---|---|---|---|
| `GET` | `/api/health` | Backend & Database health check | None | `200` |
| `GET` | `/api/options` | Centralized dropdown options | None | `200` |
| `GET` | `/api/patients` | Retrieve patients & dashboard stats | `search`, `ward`, `department`, `doctor`, `status` | `200`, `500` |
| `GET` | `/api/patients/<id>` | Retrieve a single patient | None | `200`, `404` |
| `POST` | `/api/patients` | Admit new patient | JSON Patient object | `201`, `400`, `500` |
| `PUT` | `/api/patients/<id>` | Update patient details | JSON Patient object | `200`, `400`, `404`, `500` |
| `PATCH` | `/api/patients/<id>/discharge`| Discharge an admitted patient | None | `200`, `400`, `404` |
| `DELETE`| `/api/patients/<id>` | Permanently remove patient record | None | `200`, `404`, `500` |

---

## 🧪 Automated Testing

A 17-point automated test suite verifies all business validation rules, endpoints, search, and filtering behaviors:

```bash
# Run pytest with backend in PYTHONPATH
$env:PYTHONPATH="backend"; python -m pytest backend/tests/test_patients.py -v
```

### Verified Test Cases:
1. `test_health_endpoint`: Checks status 200 and database connectivity.
2. `test_options_endpoint`: Checks dropdown options retrieval.
3. `test_get_patients`: Retrieves all patients and verifies aggregate dashboard stats.
4. `test_create_patient_success`: Successful patient admission.
5. `test_reject_empty_patient_name`: Rejects whitespace or empty names.
6. `test_reject_invalid_name`: Rejects numbers and special symbols.
7. `test_reject_age_below_zero`: Rejects negative ages.
8. `test_reject_age_above_120`: Rejects ages greater than 120.
9. `test_reject_decimal_age`: Rejects decimal/fractional ages.
10. `test_reject_invalid_dropdown_values`: Rejects invalid genders, wards, departments, or doctors.
11. `test_reject_future_admission_date`: Rejects future admission dates.
12. `test_update_patient`: Verifies updates across patient fields.
13. `test_delete_patient`: Verifies permanent deletion and subsequent 404 response.
14. `test_discharge_patient`: Verifies status change to Discharged and rejects duplicate discharges.
15. `test_search_by_name`: Verifies case-insensitive partial name substring search.
16. `test_filter_patients`: Verifies single-criteria filtering by ward, department, and doctor.
17. `test_combined_filtering`: Verifies multi-parameter combined search and filter queries.

---

## 💻 Local Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Clone & Set Up Backend
```bash
# Set up Python environment
cd backend
pip install -r requirements.txt

# (Optional) If you have a Neon PostgreSQL database URL, set it in your environment:
# $env:DATABASE_URL="postgresql://user:password@ep-sample.neon.tech/neondb?sslmode=require"
# Otherwise, it automatically creates a local SQLite database for instant development.

# Start backend server
python run.py
```
Backend API will start on **http://127.0.0.1:5000**.

### 2. Set Up Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend development server will start on **http://localhost:5173**.

---

## ☁️ Deployment Guide

### A. Database Deployment (Neon PostgreSQL)
1. Go to [neon.tech](https://neon.tech) and create a free PostgreSQL project.
2. Copy the connection string (e.g. `postgresql://user:password@ep-cool-sample.us-east-2.aws.neon.tech/neondb?sslmode=require`).

### B. Vercel Deployment
1. Install the Vercel CLI or link via GitHub at [vercel.com](https://vercel.com).
2. Configure Environment Variables in the Vercel Project Settings:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `SECRET_KEY`: A random secret key.
3. Deploy via command line:
   ```bash
   vercel --prod
   ```
   Or connect your public GitHub repository to Vercel. Vercel will:
   - Build the React Vite frontend into `frontend/dist`.
   - Provision `/api/index.py` using Vercel Serverless Python Functions to serve the Flask API.

---

## 🛡️ Security & Reliability Best Practices
- **Never Hardcode Credentials**: All database connection strings are parsed through environment variables (`DATABASE_URL`).
- **Authoritative Server Validation**: All incoming payloads are strictly validated on the Flask backend before database operations.
- **SQL Injection Prevention**: SQLAlchemy parameterized ORM queries are used throughout.
- **Clean REST HTTP Status Codes**: Explicit `200`, `201`, `400`, `404`, and `500` statuses returned with structured error messages.
