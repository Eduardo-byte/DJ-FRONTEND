# Social Media Integration Guide

This guide explains the process to integrate and manage Facebook and Instagram connections in your application, including obtaining Long-Lived Access Tokens, refreshing tokens, and handling disconnections.

## Overview

The integration involves:

1. **Connecting Users**: Users authenticate and authorize your app to access their Facebook or Instagram accounts.
2. **Handling Long-Lived Tokens**: Tokens are exchanged, refreshed, and stored securely.
3. **Disconnecting Users**: Users can revoke access through your app.

---

## Prerequisites

1. **Facebook Developer Account**: [Sign up](https://developers.facebook.com/).
2. **Create a Facebook App**: Go to the [App Dashboard](https://developers.facebook.com/apps/) and create an app.
3. **Instagram Basic Display API**: Ensure Instagram is linked to your Facebook app if integrating Instagram.
4. **Redirect URI**: A valid HTTPS URI for OAuth callbacks.
5. **Backend API**: Required for secure token handling.

---

## Steps

### 1. Set Up OAuth Authentication

**Frontend: Handle the Connect Button**

Redirect the user to the appropriate OAuth URL for Facebook or Instagram:

#### Facebook OAuth URL

```javascript
const facebookAuthUrl = `https://www.facebook.com/v14.0/dialog/oauth?client_id=YOUR_FACEBOOK_APP_ID&redirect_uri=YOUR_REDIRECT_URI&scope=pages_messaging,pages_read_engagement,pages_manage_metadata,pages_show_list&response_type=token`;
window.location.href = facebookAuthUrl;
```

#### Instagram OAuth URL

```javascript
const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=YOUR_INSTAGRAM_APP_ID&redirect_uri=YOUR_REDIRECT_URI&scope=instagram_basic,instagram_manage_messages,instagram_manage_comments&response_type=code`;
window.location.href = instagramAuthUrl;
```

Replace `YOUR_FACEBOOK_APP_ID`, `YOUR_INSTAGRAM_APP_ID`, and `YOUR_REDIRECT_URI` with your actual app credentials and URI.

---

### 2. Handle OAuth Callback

Once the user authenticates, Facebook or Instagram redirects to your specified `redirect_uri` with either a short-lived access token or a code (for Instagram).

#### Example Backend Route to Exchange Token

**Exchange Instagram Code for Access Token:**

```javascript
app.post("/api/oauth/callback", async (req, res) => {
  const { code } = req.body;

  const url = `https://api.instagram.com/oauth/access_token`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: "YOUR_INSTAGRAM_APP_ID",
      client_secret: "YOUR_INSTAGRAM_APP_SECRET",
      grant_type: "authorization_code",
      redirect_uri: "YOUR_REDIRECT_URI",
      code,
    }),
  });

  const data = await response.json();
  res.json(data);
});
```

**Exchange Facebook Token for Long-Lived Token:**

```javascript
app.post("/api/refresh-token", async (req, res) => {
  const { shortLivedToken } = req.body;

  const url = `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_FACEBOOK_APP_ID&client_secret=YOUR_FACEBOOK_APP_SECRET&fb_exchange_token=${shortLivedToken}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.access_token) {
    res.json({ success: true, newToken: data.access_token });
  } else {
    res.status(400).json({ success: false, error: data.error.message });
  }
});
```

---

### 3. Refresh Tokens

Tokens must be refreshed periodically. Use the `/api/refresh-token` endpoint to refresh a long-lived token.

**Frontend Refresh Example:**

```javascript
const handleRefresh = async (platformName) => {
  const response = await fetch("/api/refresh-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ platform: platformName }),
  });

  const data = await response.json();
  if (data.success) {
    console.log(`${platformName} token refreshed: ${data.newToken}`);
  } else {
    console.error(`Failed to refresh token for ${platformName}:`, data.error);
  }
};
```

---

### 4. Handle Disconnection

Allow users to disconnect their accounts by deleting their stored tokens.

**Frontend Disconnect Example:**

```javascript
const handleDisconnect = async (platformName) => {
  const response = await fetch("/api/disconnect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ platform: platformName }),
  });

  const data = await response.json();
  if (data.success) {
    console.log(`${platformName} disconnected successfully.`);
  } else {
    console.error(`Failed to disconnect ${platformName}:`, data.error);
  }
};
```

**Backend Disconnect Route:**

```javascript
app.post("/api/disconnect", async (req, res) => {
  const { platform } = req.body;
  try {
    // Remove the token from your database
    await TokenModel.delete({ platform });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## Summary

1. **Connect Users**:
   - Redirect to the appropriate OAuth URL.
   - Exchange short-lived tokens for long-lived tokens.
2. **Refresh Tokens**:
   - Use the refresh endpoint to periodically update tokens.
3. **Disconnect Users**:
   - Delete tokens securely and update the connection status in your app.

This process ensures secure and efficient management of Facebook and Instagram integrations in your application.
