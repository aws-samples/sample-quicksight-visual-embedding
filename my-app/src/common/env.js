// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Environment configuration
export const API_URL =
  import.meta.env.VITE_API_URL || "https://api.example.com";

// QuickSight configuration
export const DASHBOARD_ID = import.meta.env.VITE_DASHBOARD_ID;
export const SHEET_ID = import.meta.env.VITE_SHEET_ID;
export const VISUAL_ID = import.meta.env.VITE_VISUAL_ID;

// Helper function to construct API URLs
export const getApiURL = (endpoint) => {
  return `${API_URL}/${endpoint}`;
};
