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
    let path = super.getURL(...arguments);
    path = this._stripLocalePrefix(path);
    // TODO: reverse-translate url from this.intl.currentLocale
    return path;
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

  _stripLocalePrefix(path) {
    for (let locale of this.intl.locales) {
      let prefix = buildLocalePrefixRegexp(locale);
      path = path.replace(prefix, "");
    }
    return path;
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

export function buildLocalePrefixRegexp(locale) {
  return new RegExp(`^\/${locale}\/`);
}
