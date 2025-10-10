// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const amplifyconfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_USER_POOL_WEB_CLIENT_ID,
      region: import.meta.env.VITE_AWS_REGION,
      signUpVerificationMethod: 'code',
      loginWith: {
        email: true,
        username: false
      },
      userAttributes: {
        email: {
          required: true
        }
      },
      signUpAttributes: ['email']
    }
  }
};

export default amplifyconfig;