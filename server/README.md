# AveFit Server

## Workout status lifecycle

Every scheduled workout in `workout_sessions` carries a `status`:

| Status      | Meaning                                                                     |
| ----------- | --------------------------------------------------------------------------- |
| `Scheduled` | Booked for a future day.                                                     |
| `Active`    | The scheduled day is ongoing and the workout is not finished yet.            |
| `Complete`  | The member finished the scheduled workout.                                   |
| `Incomplete`| The member started the workout but the day ended before it was finished.     |
| `Absent`    | The scheduled day ended without any recorded workout activity.               |

The rules are evaluated on the server from the scheduled workout date and the
application timezone, never from the member's browser clock:

- A workout becomes `Active` on its scheduled day and stays `Active` until the
  member completes it or the day ends.
- Completing a workout stores the completion timestamp and sets `Complete`
  immediately. Repeating the request is a no-op, so no duplicate completion
  record or notification is created.
- When the scheduled day ends, a workout with recorded activity becomes
  `Incomplete` and a workout without any activity becomes `Absent`.
- `Complete` is never downgraded to `Incomplete` or `Absent`.

`server/utils/workoutStatus.js` owns the evaluation. It runs once at server
startup (so days that ended while the server was down are picked up), every
five minutes, and on demand when the member or trainer lists workouts. Only
rows whose status actually changed are written, so repeated runs are safe.

Set `APP_TIMEZONE` in the server environment to override the timezone used for
the evaluation. It defaults to `Asia/Manila`, the timezone the rest of the app
uses.

## Admin access allowlist

Set `ADMIN_EMAIL` in `server/.env` to the one email address permitted to sign in to the admin portal:

```env
ADMIN_EMAIL=admin@example.com
```

For deployment, add `ADMIN_EMAIL` to the server/API environment variables instead of committing it to source control. The existing row in the `admins` table must use this email address (case-insensitive). Admin login and all authenticated admin requests are rejected for any other address, and the admin profile email cannot be changed from the settings page. Restart or redeploy the server after changing the setting.

## Admin password reset email

Admin password reset links are sent only to the `ADMIN_EMAIL` account. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and (optionally) `SMTP_FROM` in the server environment; password reset is unavailable when SMTP is not configured. The link expires after 30 minutes and can only be used once.
Set `CLIENT_URL` to the public frontend origin in deployment so the emailed link opens the correct AveFit instance.

Member feedback is emailed to `ADMIN_EMAIL`; feedback submission requires a valid `ADMIN_EMAIL` and working SMTP configuration.

Weekly BMI reminder emails use the same SMTP settings. Active, verified members with a height on file receive an email when they have not logged progress in the previous seven days. Set `CLIENT_URL` to the public frontend origin so the email's progress link opens the deployed app. In-app reminders continue to work when SMTP is unavailable.

## Browser push notifications

Browser push requires a VAPID key pair in the server environment. Generate a pair from the `server` directory:

```powershell
node -e "console.log(require('web-push').generateVAPIDKeys())"
```

Set the returned values as `WEB_PUSH_VAPID_PUBLIC_KEY` and `WEB_PUSH_VAPID_PRIVATE_KEY`, and set `WEB_PUSH_CONTACT` to a monitored `mailto:` address. Add these only to `server/.env` for local development or to the server's deployment secrets/environment; do not commit the private key or put it in a `VITE_` variable. Restart/redeploy the API after setting them. In-app notifications continue to work when browser push is not configured.
