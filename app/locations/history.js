import HistoryLocation from '@ember/routing/history-location';

export default class MineLocation extends HistoryLocation {
  getURL() {
    let superResult = super.getURL(...arguments);
    superResult = superResult.replace(/^\/en/, "");
    return superResult;
  }

  formatURL(path) {
    let superResult = super.formatURL(...arguments);
    if (!superResult.startsWith("/en")) {
      superResult = `/en${superResult}`;
    }
    return superResult;
  }
}
