import HistoryLocation from '@ember/routing/history-location';
import { inject as service } from '@ember/service';

const DEFAULT_LOCALE = "en-us";

const DYNAMIC_SEGMENT = Symbol("DYNAMIC_SEGMENT");

const TRANSLATIONS = {
  "es-es": {
    "songs": ["canciones", {
      "library": ["biblioteca", {
        [DYNAMIC_SEGMENT]: [{
          "reviews": ["criticas", {}]
        }]
      }]
    }]
  }
};

export default class MineLocation extends HistoryLocation {
  @service intl;

  getURL() {
    let url = super.getURL(...arguments);
    let [bareUrl, matchedLocale] = this._stripLocalePrefix(url);
    if (matchedLocale !== DEFAULT_LOCALE) {
      bareUrl = this._reverseTranslateUrl(bareUrl, matchedLocale);
    }
    return bareUrl;
  }

  formatURL() {
    let url = super.formatURL(...arguments);
    if (this.intl.primaryLocale !== DEFAULT_LOCALE) {
      url = this._translateUrl(url);
    }
    let localePrefix = buildLocalePrefixRegexp(this.intl.primaryLocale);
    if (!url.match(localePrefix)) {
      let urlSuffix = url.startsWith("/") ? url : `/${url}`;
      url = `/${this.intl.primaryLocale}${urlSuffix}`;
    }
    return url;
  }

  _stripLocalePrefix(url) {
    let matchedLocale;
    for (let locale of this.intl.locales) {
      let prefix = buildLocalePrefixRegexp(locale);
      if (url.match(prefix)) {
        url = url.replace(prefix, "");
        matchedLocale = locale;
        break;
      }
    }
    return [url, matchedLocale];
  }

  _translateUrl(url) {
    let translations = TRANSLATIONS[this.intl.primaryLocale];
    let paths = url.split("/").filter((path) => path.length > 0);
    let translatedPaths = paths.reduce((acc, path) => {
      let translationData = getTranslationData(path, translations);

      if (translationData.isDynamicSegment) {
        acc.push(path);
      } else {
        acc.push(translationData.translatedPath);
      }
      translations = translationData.children;
      return acc;
    }, []);
    return translatedPaths.join("/")
  }

  _reverseTranslateUrl(url, locale) {
    let translations = TRANSLATIONS[locale];
    let paths = url.split("/").filter((path) => path.length > 0);
    let translatedPaths = paths.reduce((acc, path) => {
      let translationData = getReverseTranslationData(path, translations);

      if (translationData.isDynamicSegment) {
        acc.push(path);
      } else {
        acc.push(translationData.originalPath);
      }
      translations = translationData.children;
      return acc;
    }, []);
    return translatedPaths.join("/");
  }
}

function getTranslationData(path, translations) {
  let data = translations[path];
  if (data) {
    return {
      translatedPath: data[0],
      children: data[1],
    };
  } else {
    data = translations[DYNAMIC_SEGMENT];
    return {
      isDynamicSegment: true,
      children: data[0],
    };
  }
}

function getReverseTranslationData(path, translations) {
  let key = Object.keys(translations).find((key) => translations[key][0] === path) || DYNAMIC_SEGMENT;
  let children;
  let translationData = {};
  if (key === DYNAMIC_SEGMENT) {
    children = translations[key][0];
    translationData.isDynamicSegment = true;
  } else {
    children = translations[key][1];
    translationData.originalPath = key;
  }
  return {
    ...translationData,
    children,
  };
}

export function buildLocalePrefixRegexp(locale) {
  return new RegExp(`^\/${locale}\/`);
}
