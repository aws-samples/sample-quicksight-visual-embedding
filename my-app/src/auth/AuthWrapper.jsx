
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import "./auth.css";

function AuthWrapper({ children }) {
  const formFields = {
    signUp: {
      email: {
        order: 1,
        placeholder: 'Enter your email address',
        label: 'Email *',
        inputProps: { required: true }
      },
      password: {
        order: 2,
        placeholder: 'Enter your password',
        label: 'Password *'
      },
      confirm_password: {
        order: 3,
        placeholder: 'Confirm your password',
        label: 'Confirm Password *'
      }
    },
    signIn: {
      username: {
        placeholder: 'Enter your email address',
        label: 'Email'
      }
    }
  };

  return (
    <Authenticator
      formFields={formFields}
      signUpAttributes={['email']}
      hideSignUp={true}
    >
      {({ signOut, user }) => children({ signOut, user })}
    </Authenticator>
  );
}

export default AuthWrapper;