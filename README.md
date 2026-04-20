# Smart Campus Operations Hub

A full-stack web application for managing campus facilities, bookings, incident tickets, notifications, and user roles at SLIIT.

**Module:** IT3030 — Group Project  
**Group:** Antygravity

---

## Team

| Member | Responsibility | Branches |
|--------|---------------|----------|
| Member 1 | Facilities & Resource Management | `feature/facilities-catalogue-schema` `feature/resource-mgmt-endpoints` `feature/facilities-inventory-ui` |
| Member 2 | Booking Workflow & Conflict Checking | `feature/booking-reservation-core` `feature/conflict-validation-logic` `feature/booking-calendar-view` |
| Member 3 | Incident Tickets & Technician Updates | `feature/incident-ticketing-system` `feature/technician-workflow-updates` `feature/ticket-attachments-handling` |
| Member 4 | Notifications, Roles & OAuth | `feature/oauth-integration-security` `feature/role-based-access-control` `feature/notification-service-alerts` `feature/local-auth-credentials` `feature/email-otp-verification` |

---

## Tech Stack

### Backend
- Java 21
- Spring Boot 3.4.4
- Spring Security 6 + JWT (JJWT 0.12.6)
- Spring OAuth2 Client (Google)
- Spring Data JPA + Hibernate
- Spring Mail (Gmail SMTP)
- PostgreSQL
- Lombok
- Maven

### Frontend
- React 19 + Vite 8
- React Router v7
- Axios
- GSAP + Lenis (animations)
- QRCode.react

---

## Project Structure

```
IT3030/
├── backend/                  # Spring Boot application
│   ├── src/main/java/com/sliit/smartcampus/backend/
│   │   ├── config/           # Security, CORS, static files, data seeding
│   │   ├── controller/       # REST controllers
│   │   ├── dto/              # Request and response DTOs
│   │   ├── enums/            # Role, status, type enums
│   │   ├── exception/        # Global exception handler
│   │   ├── model/            # JPA entities
│   │   ├── repository/       # Spring Data JPA repositories
│   │   ├── security/         # JWT, OAuth2, UserPrincipal
│   │   └── service/          # Business logic
│   └── src/main/resources/
│       └── application.properties
└── frontend/                 # React + Vite application
    └── src/
        ├── api/              # Axios API calls
        ├── components/       # Navbar, NotificationPanel, AdminLayout
        ├── context/          # AuthContext
        └── pages/            # All page components
```

---

## Prerequisites

- Java 21
- Maven 3.9+
- Node.js 20+
- PostgreSQL 15+
- Gmail account with App Password enabled

---

## Setup & Running

### 1. Database

Create a PostgreSQL database:

```sql
CREATE DATABASE smart_campus;
```

### 2. Backend Configuration

Edit `backend/src/main/resources/application.properties` and fill in your values:

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/smart_campus
spring.datasource.username=your_db_username
spring.datasource.password=your_db_password

# Google OAuth2
spring.security.oauth2.client.registration.google.client-id=your_google_client_id
spring.security.oauth2.client.registration.google.client-secret=your_google_client_secret

# JWT
app.jwt.secret=your_jwt_secret_key

# Admin account (this email gets ADMIN role automatically on first register)
app.admin.email=your_admin_email@gmail.com

# Gmail SMTP (use an App Password, not your regular password)
spring.mail.username=your_gmail@gmail.com
spring.mail.password=your_gmail_app_password
```

### 3. Run the Backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend runs on **http://localhost:8081**

On first startup, `DataInitializer` seeds default campus resources automatically.

### 4. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/send-otp` | None | Send OTP to email |
| POST | `/api/auth/register` | None | Register with OTP verification |
| POST | `/api/auth/login` | None | Login with email and password |
| GET | `/api/auth/me` | Token | Get current user profile |

### Users (`/api/users`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users` | Admin | List all users |
| GET | `/api/users/{id}` | Admin | Get user by ID |
| PATCH | `/api/users/{id}/role` | Admin | Change user role |
| PATCH | `/api/users/me` | Token | Update own profile |
| POST | `/api/users/me/avatar` | Token | Upload profile picture |
| DELETE | `/api/users/me` | Token | Delete own account |

### Resources (`/api/resources`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/resources` | None | List all resources |
| GET | `/api/resources/{id}` | None | Get resource by ID |
| POST | `/api/resources` | Admin | Create resource |
| PUT | `/api/resources/{id}` | Admin | Update resource |
| DELETE | `/api/resources/{id}` | Admin | Delete resource |

### Bookings (`/api/bookings`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bookings` | Token | Create booking |
| GET | `/api/bookings/my` | Token | Get my bookings |
| GET | `/api/bookings/{id}` | Token | Get booking by ID |
| PATCH | `/api/bookings/{id}/cancel` | Token | Cancel booking |
| GET | `/api/bookings` | Admin | Get all bookings |
| PUT | `/api/bookings/{id}/review` | Admin | Approve or reject |
| GET | `/api/bookings/analytics` | Admin | Usage analytics |
| GET | `/api/bookings/verify/{code}` | Admin | Verify QR check-in code |
| PATCH | `/api/bookings/checkin/{code}` | Admin | Perform check-in |

### Tickets (`/api/tickets`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/tickets` | Token | Create ticket (multipart) |
| GET | `/api/tickets/my` | Token | Get my tickets |
| GET | `/api/tickets/{id}` | Token | Get ticket by ID |
| GET | `/api/tickets` | Admin/Tech/Manager | All tickets |
| PATCH | `/api/tickets/{id}` | Admin/Tech/Manager | Update status or assign |
| DELETE | `/api/tickets/{id}` | Admin | Delete ticket |
| POST | `/api/tickets/{id}/comments` | Token | Add comment |
| PUT | `/api/tickets/comments/{id}` | Token | Edit comment |
| DELETE | `/api/tickets/comments/{id}` | Token | Delete comment |
| GET | `/api/tickets/attachments/{file}` | None | Download attachment |

### Notifications (`/api/notifications`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | Token | Get my notifications |
| GET | `/api/notifications/unread-count` | Token | Get unread count |
| PATCH | `/api/notifications/{id}/read` | Token | Mark one as read |
| PATCH | `/api/notifications/read-all` | Token | Mark all as read |
| DELETE | `/api/notifications/{id}` | Token | Delete notification |
| PATCH | `/api/notifications/preferences` | Token | Update muted types |

---

## User Roles

| Role | Access |
|------|--------|
| `USER` | Submit tickets, make bookings, manage own profile |
| `TECHNICIAN` | View and update assigned tickets |
| `MANAGER` | View and update all tickets |
| `ADMIN` | Full access — manage users, resources, bookings, tickets |

The email set in `app.admin.email` is automatically assigned `ADMIN` role on registration.

---

## Authentication Flow

**Email/Password:**
1. Send OTP → `POST /api/auth/send-otp`
2. Verify OTP and register → `POST /api/auth/register`
3. Login → `POST /api/auth/login`
4. Use returned JWT as `Authorization: Bearer <token>` on all requests

**Google OAuth2:**
1. Redirect to `http://localhost:8081/oauth2/authorize/google`
2. After Google login, backend issues JWT
3. Browser is redirected to `http://localhost:5173/oauth2/redirect?token=...`
4. Frontend stores token and logs user in

---

## Testing

Postman test guides are in the project root:

- `postman-member-1.txt` — Resource management endpoints
- `postman-member-2.txt` — Booking workflow endpoints
- `postman-member-3.txt` — Ticket and technician endpoints
- `postman-member-4.txt` — Auth, roles, and notification endpoints

Or use the VS Code REST Client extension with `member4.http`.

---

## Environment Notes

- Backend: `http://localhost:8081`
- Frontend: `http://localhost:5173`
- Vite proxies `/api`, `/oauth2`, and `/uploads` to the backend automatically
- Uploaded files are stored in `backend/uploads/`
- The database schema is auto-created by Hibernate on first run (`ddl-auto=update`)
