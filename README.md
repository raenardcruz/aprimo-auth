# What is this?

Implement Aprimo Authentication easily in your web application.

# Installation

`npm i aprimo-auth --save`

Then...

```
import Aprimo from 'aprimo-auth'

// Initialize Aprimo object.
var aprimo = new Aprimo({
  subdomain: "<subdomain>",
  clientid: "<client id>",
  secret: "<client secret>",
  redirecturi: "<redirect URL>",
  relativeAppRedirect: "/",
  silentRefreshInterval: 10,
  authMode: "iframe",
});

// For simple connection without getting the token. This will contain the code session storage which you can use to get the token. You can visit this page and follow step 3 to get your token https://developers.aprimo.com/marketing-operations/rest-api/authorization/#module6
// You can get the codeVerifier in the session storage "codeVerifier"
// You can get the generated aprimo code in the session storage "code" and use it to get a token for your backend.
aprimo.connect()

// Aprimo Authentication using redirects. This will also get the access token from aprimo
aprimo.authenticate()

// Aprimo Reauthentication using hidden iframe or popup window
aprimo.reauthenticate()

// To get the token you should assign a function in the onGetToken event handler. This event handler will be called everytime a new token is fetched
aprimo.onGetToken((event) => {
  // Do your logic here
  // Users can access the aprimo token using event.data
});

// You can also add an event handler when the the page is authenticated.
aprimo.onAuthenticated((event) => {
  // Do your logic here
});

// Aprimo Axios Wrapper. Authorization token will be included in the request automatically
aprimo.get(url, data)
aprimo.put(url, payload, data)
aprimo.post(url, payload, data)
aprimo.delete(url, data)


```

## Events

- _onGetToken_ - This event gets triggered every time a new token is fetched using the iframe or popup method
- _onAuthenticated_ - This event gets triggered after authentication process is completed successfully and user has been logged into Aprimo

## Options

Aprimo Authentication parameters:

- _subdomain_ - [required] aprimo client subdomain
- _clientid_ - [required] aprimo registration client id
- _secret_ - [required] aprimo registration client secret
- _redirecturi_ - [required] aprimo registration redirect uri. This Uri should handle callbacks from aprimo.
- _relativeAppRedirect_ - [optional] relative path of the application url. The value placed here will be the url after the authorization is resolved. Take note that this will not trigger a page reload. [default] Default value is "/"
- _silentRefreshInterval_ - [optional] Interval in minutes to get a new token. [default] Default value is 10 minutes.
- _authMode_ - [optional] possible values is only _iframe_ or _popup_. The iframe will open a hidden iframe in your page to get new tokens while the popup will open a new window temporarily to get a new token. Please choose the appropriate mode that fits your requirements. [default] Default value is iframe

## Aprimo Setup

Follow these steps to create a new Integration registration inside Aprimo

- Login to Aprimo and Create a new Integration registration. Administration > Integration > Registrations
- Set the OAuth Flow Type to Authorization Code with PKCE
- Take note of the generated Client ID
