// Backwards-compatible alias. The single Better Auth client lives in ./auth;
// do not create another client here or it will lose the JWT/additional-field
// plugins and the client-origin base URL.
export * from "./auth";
