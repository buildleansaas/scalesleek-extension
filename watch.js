const chokidar = require("chokidar");
const ChromeRemoteInterface = require("chrome-remote-interface");

const EXTENSION_ID = "ajfkgcknkbipmplinhofominaiikfnff";
const EXTENSION_PAGE = `chrome-extension://${EXTENSION_ID}/popup.html`;

async function reloadExtension() {
  try {
    const client = await ChromeRemoteInterface();
    const { Page } = client;

    await Page.enable();
    await Page.navigate({ url: EXTENSION_PAGE });

    console.log("Extension reloaded");
    client.close();
  } catch (err) {
    console.error("Cannot connect to Chrome:", err);
  }
}

const watcher = chokidar.watch(".", { ignored: /node_modules|[\/\\]\./, persistent: true });

watcher.on("change", (path) => {
  console.log(`File ${path} has been changed`);
  reloadExtension();
});

console.log("Watching for file changes...");
