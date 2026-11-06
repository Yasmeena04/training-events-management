<p align="center">
  <img src="assets/img/logo.png" alt="Levent — Learn, Connect, Grow" width="800">
</p>

<h1 align="center">Levent</h1>
<p align="center"><strong>Learn · Connect · Grow</strong></p>
<p align="center">Group 2 — Training Event Management System</p>

---

## About the project

Levent is a front-end website for managing and discovering training events, including **workshops, courses, and internships**. The platform provides different interfaces for participants, trainers, managers, and administrators.

The project is built using **HTML5, CSS3, and Bootstrap 5.3**.

> **Project scope:** Levent is a static front-end prototype. The pages use sample content written in HTML. Information is not saved or updated, account authentication and social sign-in are visual demonstrations only, and payment interactions are simulated. Dynamic features that require a backend or JavaScript are outside the current project scope.

## Team

| Member | Responsibilities |
| --- | --- |
| **Shaima (Team Leader)** | 1. User & Access · 6. Notifications |
| **Yasmeena** | 2. Training Requests · 3. Scheduling & Resources · 7. Attendance |
| **Shora** | 4. Catalog & Applications · 5. Payments |

## Technology stack

- **HTML5** — page structure and content
- **CSS3** — layouts, styling, and responsive design
- **Bootstrap 5.3** — CSS framework and layout utilities

There are no JavaScript files or JavaScript dependencies in this project.

## Project structure

```text
training-events-management/
├── index.html                 # Public homepage (Shaima)
├── login.html                 # Login page (Shaima)
├── register.html              # Registration page (Shaima)
├── profile.html               # User profile (Shaima)
├── alerts.html                # Notifications for all roles (Shaima)
│
├── participant/
│   ├── trainings.html         # Browse training opportunities (Shora)
│   ├── training-details.html  # Training information (Shora)
│   ├── apply.html             # Training application (Shora)
│   ├── my-trainings.html      # Participant's trainings (Shora)
│   ├── payment.html           # Simulated payment page (Shora)
│   └── certificate.html       # Participant certificate view (Yasmeena)
│
├── trainer/
│   ├── my-trainings.html      # Trainer's trainings (Yasmeena)
│   ├── new-request.html       # New training request (Yasmeena)
│   ├── attendance.html        # Attendance tracking (Yasmeena)
│   ├── applications.html      # Review applications (Yasmeena)
│   ├── statistics.html        # Trainer statistics (Shaima)
│   └── organization.html      # Organization profile (Shaima)
│
├── manager/
│   ├── requests.html          # Training requests review (Yasmeena)
│   ├── schedule.html          # Scheduling & resources (Yasmeena)
│   ├── payments.html          # Payments list (Shora)
│   └── announcements.html     # Announcements (Shaima)
│
├── admin/
│   ├── dashboard.html         # Admin dashboard (Shaima)
│   ├── users.html             # User management (Shaima)
│   ├── roles.html             # Roles & permissions (Yasmeena)
│   ├── categories.html        # Training categories (Shaima)
│   └── rooms.html             # Rooms management (Shaima)
│
├── assets/
│   ├── css/
│   │   └── style.css          # Shared styles (Yasmeena & Shaima)
│   └── img/                   # Logo and website images
│
├── docs/                      # Design document, diagrams, and wireframes (planned)
├── README.md
└── .gitignore
```

*The tree lists the planned project pages and stylesheets; items marked (planned) are not uploaded yet.*

## How to run

1. Clone the repository.
2. Open the project folder in Visual Studio Code.
3. Open `index.html` using the **Live Server** extension, or open the HTML file directly in a browser.

Bootstrap CSS is loaded from a CDN, so an internet connection is needed to load Bootstrap's styles.

## Out of scope

The following features are not included in the current project scope:

- JavaScript-based functionality or dynamic data handling
- Backend services, database storage, or real account authentication
- Real Google, Facebook, or Microsoft sign-in
- Real payment processing
- Real certificate generation (the certificate page is a static sample view only)
- Manager reports and advanced reporting
