export function initialize(appInstance) {
  let intlService = appInstance.lookup("service:intl");
  let locale = localStorage.getItem("locale") || "en-us";
  intlService.locale = locale;
}

export default {
  initialize
};
