// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from "aws-amplify/auth";
import { API_URL } from "../common/env";

// Helper function to get Cognito ID token
const getCognitoIdToken = async () => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    if (!idToken) {
      throw new Error("No ID token available");
    }

    return idToken;
  } catch (error) {
    console.error("Error getting Cognito ID token:", error);
    throw error;
  }
};

// QuickSight API - Get embed visual URL
export const apiPOSTQS = async (item) => {
  try {
    const cognitoIdToken = await getCognitoIdToken();
    const session = await fetchAuthSession();
    const userEmail = session.tokens?.idToken?.payload?.email;

    const requestBody = {
      ...item,
      email: userEmail
    };

    const response = await fetch(`${API_URL}/get-embed-url`, {
      method: "POST",
      headers: {
        Authorization: cognitoIdToken
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.log(
      "Error during post: get-embed-visual-url, error: ",
      err.message
    );
    return null;
  }
};
