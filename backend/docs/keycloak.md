# Keycloak, the short way

Everything this project needs is already set in [`platform/keycloak/foundation-realm.json`](../platform/keycloak/foundation-realm.json), which Keycloak imports on its first start. Most days you never open the admin console. These are the only places worth knowing.

## Try it as a user

Nothing to configure: this is what the people using your project see.

1. Open http://localhost:8081/realms/foundation/account and choose **Register**.
2. Use any address. The verification email arrives in Mailpit at http://localhost:8025; open it and follow the link.
3. Back in the account page, open **Account security → Signing in**:
   - **Set up Authenticator application** shows a QR code for an app like Aegis, Google Authenticator or 1Password.
   - **Set up Passkey** uses the browser's passkey: fingerprint, face, PIN or a security key.
4. Sign out, then sign in again: Keycloak asks for the second factor or offers the passkey.

Forgotten passwords work the same way: **Forgot password?** on the sign-in page, then the link in Mailpit.

## The admin console: five screens

Open http://localhost:8081/admin and sign in as `admin` with `KEYCLOAK_ADMIN_PASSWORD` from `.env`. **First pick the `foundation` realm** in the drop-down at the top left: `master` is only for administering Keycloak itself.

| To | Go to |
|---|---|
| See, disable or delete a person, reset their password or remove a passkey | **Users** → the person → *Details*, *Credentials* |
| Make someone an administrator of the services | **Users** → the person → *Role mapping* → *Assign role* → `admin` |
| Invite people into a team or a customer | **Organizations** → *Create organization* → the organization → *Members* → *Invite member*; the invitation goes by email |
| Turn self-registration, email verification or "remember me" on and off | **Realm settings** → *Login* |
| Add sign-in with Google, GitHub and others | **Identity providers** → pick one → paste the client id and secret from that provider |

Anything else (flows, client scopes, mappers, events) can stay as it is.

## When something looks wrong

| Symptom | Cause |
|---|---|
| "Invalid username or password" on the admin console | You are on the `master` realm with a `foundation` user, or the other way round. |
| No email arrives | Open Mailpit: every email stops there locally, none goes out. |
| A change in `foundation-realm.json` has no effect | Keycloak imports the file only into an empty database. Make the change in the console, or start over with `docker compose down -v`, which deletes all data. |
| A service answers 401 with a valid sign-in | The token expired after 5 minutes; the client should refresh it. |
