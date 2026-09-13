const { BlobServiceClient } = require("@azure/storage-blob");

const CONTAINER_NAME = "app-data";

// The storage account connection string. Set this as an Application
// Setting in the Azure Static Web App (or its linked Function App)
// called STORAGE_CONNECTION_STRING. See the README for how to get
// this value from the Azure Portal.
const CONNECTION_STRING = process.env.STORAGE_CONNECTION_STRING;

async function getContainerClient() {
  const serviceClient = BlobServiceClient.fromConnectionString(CONNECTION_STRING);
  const containerClient = serviceClient.getContainerClient(CONTAINER_NAME);
  await containerClient.createIfNotExists();
  return containerClient;
}

async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    readableStream.on("error", reject);
  });
}

module.exports = async function (context, req) {
  if (!CONNECTION_STRING) {
    context.res = {
      status: 500,
      body: "Server is missing the STORAGE_CONNECTION_STRING application setting.",
    };
    return;
  }

  const key = context.bindingData.key;
  if (!key) {
    context.res = { status: 400, body: "Missing storage key in the URL." };
    return;
  }

  const blobName = `${key}.json`;

  try {
    const containerClient = await getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    if (req.method === "GET") {
      const exists = await blockBlobClient.exists();
      if (!exists) {
        context.res = { status: 404, body: "Not found" };
        return;
      }
      const downloadResponse = await blockBlobClient.download();
      const text = await streamToString(downloadResponse.readableStreamBody);
      context.res = {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: text,
      };
      return;
    }

    if (req.method === "PUT") {
      const bodyText =
        typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      await blockBlobClient.upload(bodyText, Buffer.byteLength(bodyText), {
        blobHTTPHeaders: { blobContentType: "application/json" },
      });
      context.res = { status: 200, body: "OK" };
      return;
    }

    context.res = { status: 405, body: "Method not allowed" };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: "Storage error: " + err.message };
  }
};
