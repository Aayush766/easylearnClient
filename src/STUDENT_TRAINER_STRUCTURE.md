# Prime Easy Learn portal structure

The learner and trainer areas are intentionally separated.

student/
- StudentDashboard.jsx
- StudentDashboard.css
- index.js
- modules/

trainer/
- TrainerDashboard.jsx
- TrainerDashboard.css
- index.js
- modules/

The main route is now:
- `/student` -> StudentDashboard
- `/trainer` -> TrainerDashboard

`layouts/AppLayout.jsx` is shared only for the outer shell; the dashboard/module implementations are separated by role.
