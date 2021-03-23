import { buildLocalePrefixRegexp } from "url-local/locations/history";

export function initialize(appInstance) {
  let intlService = appInstance.lookup("service:intl");
  let storedLocale = localStorage.getItem("locale");
  if (storedLocale) {
    intlService.locale = storedLocale;
  } else {
    let routerService = appInstance.lookup("service:router");
    let urlLocale = intlService.locales.find((locale) => {
      let localePrefix = buildLocalePrefixRegexp(locale);
      return localePrefix.test(window.location.pathname);
    });
    intlService.locale = urlLocale || "en-us";
    localStorage.setItem("locale", intlService.locale);
  }
}

export default {
  initialize
};
