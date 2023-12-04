import BaseAuthMode from "./BaseAuthModeClass";

/*
Name: IFrameMode
Description: This class extends the base class BaseAuthMode to fit the scenario for using iFrame to get new tokens.
*/
export default class IFrameMode extends BaseAuthMode {
  constructor(aprimo) {
    super(aprimo);
  }

  initiateGetToken(codeChallenge) {
    var iframe = document.createElement("iframe");
    iframe.id = "auth";
    iframe.src = this.aprimo.getAuthorizationUrl(codeChallenge);
    iframe.style.display = "none";
    document.body.appendChild(iframe);
  }

  isChild() {
    return window.self !== window.top;
  }

  postMessage(message) {
    window.parent.postMessage(message, window.location.origin);
  }

  eventAction(event) {
    super.eventAction(event);
    var authiFrame = document.getElementById("auth");
    document.body.removeChild(authiFrame);
  }
}
