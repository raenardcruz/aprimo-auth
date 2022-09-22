# What is this?
Implement Aprimo Authentication easily in your web application.

# Installation
`npm i aprimo-auth --save`

Then...

```
import { Aprimo } from 'aprimo-auth'

// Aprimo Authentication using redirects
Aprimo.authenticate({
    subdomain: 'ps4',
    clientid: 'clientID',
    secret: 'client-secret',
    redirectUrl: 'http://mywebsite.com/callback.html',
    relativeAppRedirect: '/connect-pages-sb/ps4/test',
    crypto: 'aprimo'
})

// Aprimo Reauthentication using refresh token
Aprimo.reauthenticate({
    subdomain: 'ps4',
    clientid: 'clientID',
    secret: 'client-secret',
    redirectUrl: 'http://mywebsite.com/callback.html',
    relativeAppRedirect: '/connect-pages-sb/ps4/test',
    crypto: 'aprimo'
})

// Get token.
Aprimo.getToken()


```

## Options
Aprimo Authentication supports 4 parameters:
* *subdomain* - aprimo client subdomain
* *clientid* - aprimo registration client id
* *secret* - aprimo registration client secret
* *redirecturi* - aprimo registration redirect uri. This Uri should handle callbacks from aprimo.
* *relativeAppRedirect* - relative path of the application url. The value placed here will be the location of the redirect after the authorixation is resolved.

## Aprimo Setup
Follow these steps to create a new Integration registration inside Aprimo
