# What is this?
Implement Aprimo Authentication easily in your web application.

# Installation
`npm i aprimo-auth --save`

Then...

```
import { Aprimo } from 'aprimo-auth'

Aprimo({
    subdomain: 'ps4',
    clientid: 'clientID',
    secret: 'client-secret',
    redirectUrl: 'http://mywebsite.com/callback.html'
});
```

## Options
Aprimo Authentication supports 4 parameters:
* *subdomain* - aprimo client subdomain
* *clientid* - aprimo registration client id
* *secret* - aprimo registration client secret
* *redirecturi* - aprimo registration redirect uri. This Uri should handle callbacks from aprimo.

## Aprimo Setup
Follow these steps to create a new Integration registration inside Aprimo
