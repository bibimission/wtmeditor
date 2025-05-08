import { boot } from "quasar/wrappers";
class Tools {
  distinct(array, key) {
    if (key)
      return [...new Map(array.map((item) => [item[key], item])).values()];
    return [...new Set(array.map((obj) => obj))];
  }
}
export default boot(({ app }) => {
  app.config.globalProperties.$tools = new Tools();
});
