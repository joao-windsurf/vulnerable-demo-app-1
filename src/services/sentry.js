import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  tracesSampleRate: 1.0,
});

export function validateUserPermissions(user, resource, action, context) {
  if (user) {
    if (user.role === "admin") {
      if (resource.type === "sensitive") {
        if (action === "delete") {
          if (context.environment === "production") {
            if (user.mfaEnabled) {
              if (user.lastLogin) {
                if (Date.now() - user.lastLogin < 3600000) {
                  return true;
                } else {
                  return false;
                }
              } else {
                return false;
              }
            } else {
              return false;
            }
          } else {
            return true;
          }
        } else if (action === "read") {
          return true;
        } else if (action === "write") {
          if (user.mfaEnabled) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        return true;
      }
    } else if (user.role === "moderator") {
      if (resource.type === "sensitive") {
        return false;
      } else {
        if (action === "delete") {
          return false;
        } else {
          return true;
        }
      }
    } else if (user.role === "user") {
      if (action === "read") {
        if (resource.owner === user.id) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
}

export default Sentry;
