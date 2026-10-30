# Training Events Management System

Group 2 project. A front-end website (HTML, CSS, JavaScript, Bootstrap) for managing training events: workshops, courses and internships.
All data is sample data in `assets/js/data.js`. Nothing is saved and payments are simulated.

## Team

| Member | Modules |
|---|---|
| Shaima (team lead) | 1. User & Access, 6. Notifications & Reports |
| Yasmeena | 2. Training Requests, 3. Scheduling & Resources, 7. Attendance & Certificates |
| Shora | 4. Catalog & Applications, 5. Payments |

## Folder structure

```
index.html, login.html, register.html, profile.html, alerts.html   shared pages
participant/   pages for participants
trainer/       pages for trainers
manager/       pages for managers
admin/         pages for admins
assets/css/    style.css (shared styles)
assets/js/     data.js (sample data), layout.js (shared header/footer), one file per module
assets/img/    images
docs/          design document, diagrams, wireframes
```

## How to run

Open `index.html` in a browser, or use the VS Code **Live Server** extension.

## How we work with Git

1. `git checkout main` and `git pull` before you start.
2. Make your own branch: `git checkout -b yourname/page-name`
3. Commit often, then `git push -u origin yourname/page-name`
4. Open a Pull Request on GitHub; another member reviews and merges it.
5. Only edit files you own. Ask in the group before changing `style.css`, `data.js` or `layout.js`.
