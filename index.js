import axios from "axios";
import CryptoJS from "crypto-js";

function generateCodeVerifier(length) {
    var text = "";
    var possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
function generateCodeChallenge(code_verifier) {
    return base64URL(CryptoJS.SHA256(code_verifier));
}
function encrypt(message, key) {
    var encrypted = CryptoJS.AES.encrypt(message, key);
    return encrypted;
}
function decrypt(encrptedMessage, key) {
    var decrypted = CryptoJS.AES.decrypt(encrptedMessage, key);
    return decrypted.toString(CryptoJS.enc.Utf8);
}
function base64URL (value) {
    return value
      .toString(CryptoJS.enc.Base64)
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  };

class Aprimo {
    constructor (options = null) {
        const key = "aprimops";
        if (options == null) {
            if (sessionStorage.getItem("PS_OPTIONS") != null) {
                options = JSON.parse(decrypt(sessionStorage.getItem("PS_OPTIONS"), key));
            } else {
                throw "No Session Found for Aprimo Options"
            }
        } else if (options.useSessionStorage) {
            sessionStorage.setItem("PS_OPTIONS", encrypt(JSON.stringify(options), key));
        }
        this.subdomain = options.subdomain;
        this.clientid = options.clientid;
        this.secret = options.secret;
        this.redirecturi = options.redirecturi;
        this.relativeAppRedirect = options.relativeAppRedirect;
        this.crypto = options.crypto;
    }
    // Function to add authentication in your web application. NOTE: will redirect you to application
    authenticate() {
        return new Promise((resolve, reject) => {
            // Step 1: Check for Query String Parameter Code.
            let uri = window.location.search.substring(1);
            let params = new URLSearchParams(uri);
            if (params.has("code")) { // Check if the url has code in its querystring parameter
                let codeVerifier = sessionStorage.getItem("codeVerifier"); // Get the stored Code verifier in the session storage
                let urlParam = sessionStorage.getItem("params"); // Get the stored Url parameters from the session storage
                sessionStorage.removeItem("codeVerifier"); // Remove the session storage for security purposes
                sessionStorage.removeItem("params"); // Remove the session storage for security purposes
                window.history.replaceState( // Replace history to remove the query string parameter added by Aprimo
                    {},
                    document.title,
                    this.relativeAppRedirect + urlParam);
            // Step 2: Call Aprimo Authentication URL
                axios
                .post(`https://${this.subdomain}.aprimo.com/login/connect/token`,
                    `grant_type=authorization_code&code=${params.get("code")}&redirect_uri=${this.redirecturi}&client_id=${this.clientid}&code_verifier=${codeVerifier}&client_secret=${this.secret}`,
                    {
                        headers: { "content-type": "application/x-www-form-urlencoded" },
                    })
                .then((res) => {
                    let token = JSON.stringify({
                        accessToken: res.data.access_token,
                        refreshToken: res.data.refresh_token
                    });
                    sessionStorage.setItem("authToken", encrypt(token, this.crypto)); // Store the encypted token in session storage
                    resolve("Authenticated");
                })
                .catch((err) => {
                    reject(`Error in Authentication: ${err.response.data}`); // Throw Error
                });
            } else {
                var codeVerifier = generateCodeVerifier(128); // Generate a Code verifier
                sessionStorage.setItem("codeVerifier", codeVerifier); // Store the Code Verifier in a sessionstorage for reloading
                sessionStorage.setItem("params", location.search); // Store the Parameter in a session storage since Redirect Uri does not contain any parameters
                var codeChallenge = generateCodeChallenge(codeVerifier); // Generate a Code Challenger using a Code verifier
                // Redirect into the client login page
                window.location.href = `https://${this.subdomain}.aprimo.com/login/connect/authorize?response_type=code&state=12345&client_id=${this.clientid}&redirect_uri=${this.redirecturi}&scope=api+offline_access&code_challenge_method=S256&code_challenge=${codeChallenge}`;
            }
        })
    }
    // Call this function to reauthenticate using the refresh token
    reauthenticate() {
        return new Promise((resolve, reject) => {
            let token = JSON.parse(decrypt(sessionStorage.getItem("authToken"))); // get the token from the session storage.
            axios
              .post(`https://${this.subdomain}.aprimo.com/login/connect/token`,
                `grant_type=refresh_token&refresh_token=${token.refreshToken}`,
                {
                  headers: {
                    "content-type": "application/x-www-form-urlencoded",
                    Authorization:
                      "Basic " +
                      btoa(
                        `${this.clientid}:${this.secret}`
                      ),
                  },
                }
              )
              .then((res) => {
                let token = JSON.stringify({
                    accessToken: res.data.access_token,
                    refreshToken: res.data.refresh_token
                });
                sessionStorage.setItem("authToken", encrypt(token, this.crypto)); // Set Sessiong storage for the token
                resolve("Re-Authenticated");
              })
              .catch((err) => {
                reject( `Error in Re-Authentication: ${err.response.data}`); // throw an error
              });
          });
    }
    // Call this function to get the access token when calling an API.
    getToken() {
        if (sessionStorage.getItem("authToken") != null) {
            let token = JSON.parse(decrypt(sessionStorage.getItem("authToken"), this.crypto));
            return token.accessToken // Return the access token to user
        } else {
            throw "Authorization Token Not Found. Please refresh the page to reathenticate."
        }
    }
    // Axios Get wrapper for Aprimo
    get(url, data = {}) {
        return new Promise((resolve, reject) => {
            try {
                data["headers"]["Authorization"] = `Bearer ${this.getToken()}`;
                axios
                    .get(url, data)
                    .then((res) => resolve(res))
                    .catch((err) => reject(err));
            } catch(err) {
                reject(err)
            }
            
        });
    }
    // Axios Put wrapper for Aprimo
    put(url, payload, data = {}) {
        return new Promise((resolve, reject) => {
            try {
                data["headers"]["Authorization"] = `Bearer ${this.getToken()}`;
                axios
                    .put(url, payload, data)
                    .then((res) => resolve(res))
                    .catch((err) => reject(err));
            } catch (err) {
                reject(err)
            }
        });
    }
    // Axios Post wrapper for Aprimo
    post(url, payload, data = {}) {
        return new Promise((resolve, reject) => {
            try {
                data["headers"]["Authorization"] = `Bearer ${this.getToken()}`;
                axios
                    .post(url, payload, data)
                    .then((res) => resolve(res))
                    .catch((err) => reject(err));
            } catch(err) {
                reject(err)
            }
        });
    }
    // Axios Delete wrapper for Aprimo
    delete(url, data) {
        return new Promise((resolve, reject) => {
            try {
                data["headers"]["Authorization"] = `Bearer ${this.getToken()}`;
                axios
                    .delete(url, data)
                    .then((res) => resolve(res))
                    .catch((err) => reject(err));
            } catch(err) {
                reject(err)
            }
        });
    }
}

export default Aprimo;