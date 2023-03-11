const { BlobServiceClient } = require("@azure/storage-blob");
const { DefaultAzureCredential } = require("@azure/identity");
const stream = require("stream");
const csv = require("csv-parser");
const moment = require("moment");
const accountName = "strkp09";
const containerName = "data";

module.exports = async function (context, documents) {
    context.log(`Cosmos DB trigger function processed ${documents.length} documents`);

    // Create a BlobServiceClient object which will be used to create a container client
    const defaultAzureCredential = new DefaultAzureCredential({
        additionallyAllowedTenants: ["*"]
        });
    const blobServiceClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net/csv/`,
        defaultAzureCredential);

    // Get a reference to a container
   
   const containerClient = blobServiceClient.getContainerClient(containerName);

    // Create a new blob name
    //const directoryName = "addata";
    const blobName = 'users.csv';
 
 
 // Check if the file already exists in the container
    const blobClient = containerClient.getBlockBlobClient(blobName);
    const exists = await blobClient.exists();
    let csvData = '';
    if (exists) {
        // If the file exists, download it and append new values
        const downloadResponse = await blobClient.download();
        const existingCsvData = await streamToString(downloadResponse.readableStreamBody);
        csvData = existingCsvData.trim() + '\n';
    } else {
        // If the file does not exist, add the column headers
        csvData = 'id,firstName,lastName,nickname,password\n';
    }

    // Parse the input documents and append them to the CSV data
    for (const document of documents) {
        const csvRow = {
            'id': document.id,
            'firstName': document.firstName,
            'lastName': document.lastName,
            'nickname': document.nickname,
            'password': document.password            
        };
        const values = Object.values(csvRow).join(',');
        csvData += values + '\n';
    }

    // Upload the CSV data to a Storage Blob
    const uploadOptions = { blobHTTPHeaders: { blobContentType: 'text/csv' } };
    await blobClient.upload(csvData, csvData.length, uploadOptions);

    context.log(`Uploaded CSV data to blob: ${blobName}`);
};

// Helper function to convert a ReadableStream to a string
async function streamToString(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on("data", (data) => {
            chunks.push(data.toString());
        });
        readableStream.on("end", () => {
            resolve(chunks.join(""));
        });
        readableStream.on("error", reject);
    });
}