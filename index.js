import axios from "axios";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  encrypt,
  decrypt,
  urlReWrite,
} from "./functions";
import PopupMode from "./PopupModeClass";
import IFrameMode from "./IFrameModeClass";

/*
Class Description: This class authenticates the web application
*/
class Aprimo {
  constructor(options = null) {
    const key = "aprimops";
    if (options == null) {
      if (sessionStorage.getItem("PS_OPTIONS") != null) {
        options = JSON.parse(
          decrypt(sessionStorage.getItem("PS_OPTIONS"), key)
        );
      } else {
        throw "No Session Found for Aprimo Options";
      }
    } else {
      sessionStorage.setItem(
        "PS_OPTIONS",
        encrypt(JSON.stringify(options), key)
      );
    }
    this.codeVerifier = sessionStorage.getItem("codeVerifier");
    if (this.codeVerifier == null) {
      this.codeVerifier = generateCodeVerifier(128);
      sessionStorage.setItem("codeVerifier", this.codeVerifier);
    }
    let uri = `?${window.location.href.split("?")[1]}`;
    this.params = new URLSearchParams(uri);
    this.subdomain = options.subdomain;
    this.clientid = options.clientid;
    this.secret = options.secret;
    this.redirecturi = options.redirecturi;
    this.relativeAppRedirect = options.relativeAppRedirect
      ? options.relativeAppRedirect
      : "/";
    this.crypto = options.crypto ? options.crypto : "aprimo";
    this.silentRefreshInterval = options.silentRefreshInterval
      ? options.silentRefreshInterval
      : 10;
    this.authMode = options.authMode ? options.authMode : "iframe"; // possible values is popup and iframe
    this.aprimotoken = "";
  }

  connect() {
    if (this.params.has("code")) {
      var cachedParams = sessionStorage.getItem("params");
      sessionStorage.removeItem("params");
      var currentParams = new URLSearchParams(
        `?${window.location.href.split("?")[1]}`
      );
      sessionStorage.setItem("code", currentParams.get("code"));
      urlReWrite(this.relativeAppRedirect + cachedParams);
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
      var codeChallenge = generateCodeChallenge(this.codeVerifier);
      window.location.href = this.getAuthorizationUrl(codeChallenge);
    }
  }

  authenticate() {
    if (this.authMode == "iframe") {
      var iFrameAuthObj = new IFrameMode(this);
      iFrameAuthObj.authenticate();
    } else if (this.authMode == "popup") {
      var popupAuthObj = new PopupMode(this);
      popupAuthObj.authenticate();
    } else {
      console.warn(`${this.authMode} is not a valid authMode`);
    }
  }
  // Call this function to reauthenticate using the refresh token
  reauthenticate() {
    if (this.authMode == "iframe") {
      var iFrameAuthObj = new IFrameMode(this);
      iFrameAuthObj.reauthenticate();
    } else if (this.authMode == "popup") {
      var popupAuthObj = new PopupMode(this);
      popupAuthObj.reauthenticate();
    } else {
      console.warn(`${this.authMode} is not a valid authMode`);
    }
  }

  getAuthorizationUrl(codeChallenge, includeRefreshToken = false) {
    return `https://${
      this.subdomain
    }.aprimo.com/login/connect/authorize?response_type=code&state=12345&client_id=${
      this.clientid
    }&redirect_uri=${encodeURIComponent(this.redirecturi)}&scope=api${
      includeRefreshToken ? "+offline_access" : ""
    }&code_challenge_method=S256&code_challenge=${codeChallenge}`;
  }

  onGetToken(callback) {
    if (this.authMode == "iframe") {
      var iFrameAuthObj = new IFrameMode(this);
      iFrameAuthObj.subscribeToEvent(callback);
    } else if (this.authMode == "popup") {
      var popupAuthObj = new PopupMode(this);
      popupAuthObj.subscribeToEvent(callback);
    }
  }
  // Axios Get wrapper for Aprimo
  get(url, data = {}) {
    return new Promise((resolve, reject) => {
      try {
        if (data["headers"] == null) data["headers"] = {};
        data["headers"]["Authorization"] = `Bearer ${this.aprimotoken}`;
        axios
          .get(url, data)
          .then((res) => resolve(res))
          .catch((err) => reject(err));
      } catch (err) {
        reject(err);
      }
    });
  }
  // Axios Put wrapper for Aprimo
  put(url, payload, data = {}) {
    return new Promise((resolve, reject) => {
      try {
        if (data["headers"] == null) data["headers"] = {};
        data["headers"]["Authorization"] = `Bearer ${this.aprimotoken}`;
        axios
          .put(url, payload, data)
          .then((res) => resolve(res))
          .catch((err) => reject(err));
      } catch (err) {
        reject(err);
      }
    });
  }
  // Axios Post wrapper for Aprimo
  post(url, payload, data = {}) {
    return new Promise((resolve, reject) => {
      try {
        if (data["headers"] == null) data["headers"] = {};
        data["headers"]["Authorization"] = `Bearer ${this.aprimotoken}`;
        axios
          .post(url, payload, data)
          .then((res) => resolve(res))
          .catch((err) => reject(err));
      } catch (err) {
        reject(err);
      }
    });
  }
  // Axios Delete wrapper for Aprimo
  delete(url, data) {
    return new Promise((resolve, reject) => {
      try {
        if (data["headers"] == null) data["headers"] = {};
        data["headers"]["Authorization"] = `Bearer ${this.aprimotoken}`;
        axios
          .delete(url, data)
          .then((res) => resolve(res))
          .catch((err) => reject(err));
      } catch (err) {
        reject(err);
      }
    });
  }
}

export default Aprimo;
