import { generateCodeChallenge, urlReWrite } from "./functions";
import axios from "axios";

/*
Name: BaseAuthMode
Description: This is the base class for authentication. This contains the generic authorization logic.
*/
export default class BaseAuthMode {
  constructor(aprimo) {
    this.aprimo = aprimo;
    this.eventTarget = document.createElement("div");
  }

  getToken(codeVerifier) {
    var aprimoObj = this.aprimo;
    let uri = `?${window.location.href.split("?")[1]}`;
    let params = new URLSearchParams(uri);
    return axios.post(
      `https://${aprimoObj.subdomain}.aprimo.com/login/connect/token`,
      `grant_type=authorization_code&code=${params.get(
        "code"
      )}&redirect_uri=${encodeURIComponent(aprimoObj.redirecturi)}&client_id=${
        aprimoObj.clientid
      }&code_verifier=${codeVerifier}&client_secret=${aprimoObj.secret}`,
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
      }
    );
  }

  async authenticate() {
    var aprimoObj = this.aprimo;
    if (aprimoObj.params.has("code")) {
      if (this.isChild()) {
        // CHILD logic
        var getTokenResponse = await this.getToken(aprimoObj.codeVerifier);
        this.postMessage(getTokenResponse.data.access_token);
      } else {
        // PARENT logic
        var cachedParams = sessionStorage.getItem("params");
        var codeChallenge = generateCodeChallenge(aprimoObj.codeVerifier);
        sessionStorage.removeItem("params");
        var currentParams = new URLSearchParams(
          `?${window.location.href.split("?")[1]}`
        );
        sessionStorage.setItem("code", currentParams.get("code"));
        urlReWrite(aprimoObj.relativeAppRedirect + cachedParams);
        this.intializeEventhandler();
        this.initiateGetToken(codeChallenge);
      }
    } else {
      var splitUrl = window.location.href.split("?");
      if (splitUrl.length > 1) {
        sessionStorage.setItem(
          "params",
          `?${window.location.href.split("?")[1]}`
        );
      } else {
        sessionStorage.setItem("params", "");
      }
      var codeChallenge = generateCodeChallenge(aprimoObj.codeVerifier);
      window.location.href = aprimoObj.getAuthorizationUrl(codeChallenge, true);
    }
  }

  reauthenticate() {
    var aprimoObj = this.aprimo;
    var codeChallenge = generateCodeChallenge(aprimoObj.codeVerifier);
    this.initiateGetToken(codeChallenge);
  }

  intializeEventhandler() {
    setInterval(
      () => this.reauthenticate(),
      this.aprimo.silentRefreshInterval * 60000
    );
  }

  eventAction(event) {}

  subscribeToEvent(callback) {
    window.addEventListener("message", (event) => {
      if (event.origin === window.location.origin) {
        this.aprimo.token = event.data;
        this.eventAction(event);
        callback(event);
      }
    });
  }
}
