import { AccountInfo, PublicClientApplication } from "@azure/msal-browser";

export const SCOPES = [
  "https://outlook.office365.com/SMTP.Send",
  "email",
  "openid",
  "profile",
  "offline_access",
];

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${
      import.meta.env.VITE_TENANT_ID
    }`,
    redirectUri: import.meta.env.VITE_REDIRECT_URI,
  },
  cache: {
    cacheLocation: "localStorage",
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export async function getAccessToken(): Promise<string | null> {
  const currentAccount: AccountInfo | null = msalInstance.getActiveAccount();

  if (!currentAccount) {
    console.warn("No active account. User not logged in.");
    return null;
  }

  try {
    const response = await msalInstance.acquireTokenSilent({
      scopes: SCOPES,
      account: currentAccount,
    });
    return response.accessToken;
  } catch (err) {
    console.error("Token acquisition failed:", err);
    return null;
  }
}
