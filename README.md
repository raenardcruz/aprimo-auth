# What is this?
Implement Aprimo Authentication easily in your web application.

# Installation
`npm i aprimo-auth --save`

Then...

```
import { Aprimo } from 'aprimo-auth'

// Initialize Aprimo object.
const aprimo = new Aprimo({
    subdomain: 'ps4',
    clientid: 'clientID',
    secret: 'client-secret',
    redirecturi: 'http://mywebsite.com/callback.html',
    relativeAppRedirect: '/connect-pages-sb/ps4/test',
    crypto: 'aprimo',
    useSessionStorage: true
});

//For the succeeding initialization you can just call new Aprimo() and it will try to get the options from the session storage. assuming that you set the session storage option to true.
const aprimo = new Aprimo();

// Aprimo Authentication using redirects.
aprimo.authenticate()

// Aprimo Reauthentication using refresh token
Aprimo.reauthenticate()

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
* *crypto* - a text value used for token encryption
* *useSessionStorage* - Setting this to true will store the object in a sessionstorage.

## Aprimo Setup
Follow these steps to create a new Integration registration inside Aprimo
* Login to Aprimo and Create a new Integration registration. Administration > Integration > Registrations
* Set the OAuth Flow Type to Authorization Code with PKCE
* Check  on the Enable refresh token
* Take note of the generated Client ID
