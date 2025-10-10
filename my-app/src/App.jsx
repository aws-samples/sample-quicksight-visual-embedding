// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import AuthWrapper from "./auth/AuthWrapper";
import Dashboard from "./components/Dashboard";
import "@cloudscape-design/global-styles/index.css";
import "./App.css";

function App() {
  return (
    <div className="App">
      <AuthWrapper>
        {({ signOut, user }) => (
          <Dashboard user={user} signOut={signOut} />
        )}
      </AuthWrapper>
    </div>
  );
}

export default App;
