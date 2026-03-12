import { google } from "googleapis";

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectURI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback";

export const oauth2Client = new google.auth.OAuth2(
  clientID,
  clientSecret,
  redirectURI
);

export function getAuthUrl(scopes: string[], state?: string) {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    include_granted_scopes: true,
    state,
    prompt: "consent", // Force refresh token
  });
}

export async function getTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export function setCredentials(tokens: any) {
  oauth2Client.setCredentials(tokens);
}

export async function getAuthenticatedClient(tokens: any, onTokensUpdate?: (newTokens: any) => Promise<void>) {
  const client = new google.auth.OAuth2(clientID, clientSecret, redirectURI);
  client.setCredentials(tokens);

  client.on("tokens", (newTokens) => {
    if (onTokensUpdate) {
      onTokensUpdate(newTokens);
    }
  });

  return client;
}
