// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as QuickSightEmbedding from "amazon-quicksight-embedding-sdk";
import { apiPOSTQS } from "../services/apiService";
import { DASHBOARD_ID, SHEET_ID, VISUAL_ID } from "../common/env";

const QuickSightVisual = ({
  dashboardId = DASHBOARD_ID,
  sheetId = SHEET_ID,
  visualId = VISUAL_ID,
  containerId = "quicksight-visual-container",
  height = "600px",
  width = "100%",
}) => {
  const containerRef = useRef(null);
  const embeddedVisualRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const embedVisual = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      setLoading(true);
      setError(null);

      // Clean up previous visual if it exists
      if (
        embeddedVisualRef.current &&
        typeof embeddedVisualRef.current.dispose === "function"
      ) {
        try {
          embeddedVisualRef.current.dispose();
        } catch (disposeError) {
          console.warn("Error disposing previous visual:", disposeError);
        }
        embeddedVisualRef.current = null;
      }

      // Get the embed URL from your API
      const res = await apiPOSTQS({
        dashboard_id: dashboardId,
        sheet_id: sheetId,
        visual_id: visualId,
      });

      console.log("API Response:", res);

      if (!res || !res.data || !res.data.embedUrl) {
        throw new Error("Failed to get embed URL from API");
      }

      const url = res.data.embedUrl;
      console.log("Embed URL:", url);

      // Create embedding context
      const embeddingContext =
        await QuickSightEmbedding.createEmbeddingContext();

      // Configure visual options
      const frameOptions = {
        url: url,
        container: `#${containerId}`,
        height: height,
        width: width,
        scrolling: "no",
        footerPaddingEnabled: true,
        onChange: (changeEvent, metadata) => {
          console.log("QuickSight event:", changeEvent.eventName, metadata);

          // When a visual loads, the onChange event will fire
          if (changeEvent.eventName === "FRAME_LOADED") {
            setLoading(false);
          }
        },
      };

      // Embed the visual
      const visual = await embeddingContext.embedVisual(frameOptions);
      embeddedVisualRef.current = visual;

      console.log("Visual embedding initiated");

      // Set a timeout in case the onChange event doesn't fire
      setTimeout(() => {
        setLoading(false);
      }, 30000); // 30 seconds timeout
    } catch (error) {
      console.error("Failed to embed QuickSight visual:", error);
      setError(`Error: ${error.message || "Unknown error occurred"}`);
      setLoading(false);
    }
  }, [dashboardId, sheetId, visualId, containerId, height, width]);

  useEffect(() => {
    console.log("call");
    embedVisual();

    // Cleanup on unmount
    return () => {
      if (
        embeddedVisualRef.current &&
        typeof embeddedVisualRef.current.dispose === "function"
      ) {
        try {
          embeddedVisualRef.current.dispose();
        } catch (disposeError) {
          console.warn("Error disposing visual on unmount:", disposeError);
        }
      }
    };
  }, [embedVisual]);

  return (
    <div style={{ width: width, height: height, position: "relative" }}>
      {loading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            zIndex: 10,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              className="spinner"
              style={{
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #3498db",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                animation: "spin 2s linear infinite",
                margin: "0 auto 20px",
              }}
            ></div>
            <p>{/* # nosemgrep: jsx-not-internationalized */}Loading visual...</p>
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#fff",
            zIndex: 10,
            padding: "20px",
          }}
        >
          <div
            style={{
              textAlign: "center",
              color: "#d32f2f",
              maxWidth: "80%",
            }}
          >
            <h3>{/* # nosemgrep: jsx-not-internationalized */}Error Loading Visual</h3>
            <p>{error}</p>
            <button
              onClick={embedVisual}
              style={{
                backgroundColor: "#2196f3",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "15px",
              }}
            >{/* # nosemgrep: jsx-not-internationalized */}
              Retry
            </button>
          </div>
        </div>
      )}

      <div
        id={containerId}
        ref={containerRef}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default QuickSightVisual;
