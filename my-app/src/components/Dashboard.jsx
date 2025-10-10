// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import {
  AppLayout,
  TopNavigation,
  ContentLayout,
  Header,
  Container,
  SpaceBetween,
} from "@cloudscape-design/components";
import QuickSightVisual from "./QuickSightVisual";

function Dashboard({ user, signOut }) {
  const userName = user?.attributes?.email || user?.username || "User";

  const topNavigationUtilities = [
    {
      type: "menu-dropdown",
      text: "Admin",
      description: userName,
      iconName: "user-profile",
      items: [
        { id: "signout", text: "Sign out" }
      ],
      onItemClick: (e) => {
        if (e.detail.id === 'signout') {
          signOut();
        }
      }
    }
  ];

  return (
    <div>
      <TopNavigation
        identity={{
          href: "/",
          title: ""
        }}
        utilities={topNavigationUtilities}
      />
      <AppLayout
        navigationHide={true}
        toolsHide={true}
        content={
          <ContentLayout
            header={
              <Header
                variant="h1"
              >{/* # nosemgrep: jsx-not-internationalized */}
                Dashboard
              </Header>
            }
          >
            <SpaceBetween direction="vertical" size="l">
              <Container
                header={
                  <Header variant="h2">{/* # nosemgrep: jsx-not-internationalized */}
                    QuickSight Visual
                  </Header>
                }
              >
                <QuickSightVisual />
              </Container>
              
            </SpaceBetween>
          </ContentLayout>
        }
      />
    </div>
  );
}

export default Dashboard;