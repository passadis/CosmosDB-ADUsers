const axios = require('axios');

module.exports = async function (context, myBlob) {
    //const PAT = process.env.PersonalAccessToken; // Replace with your Azure DevOps personal access token
    const ORGANIZATION_URL = process.env.AzureDevOpsCollectionURL; // Replace with your Azure DevOps organization URL
    const PROJECT_NAME = process.env.ProjectName; // Replace with your Azure DevOps project name
    const PIPELINE_ID = process.env.definitionId; // Replace with your Azure DevOps build pipeline ID

    const buildUrl = `${ORGANIZATION_URL}/${PROJECT_NAME}/_apis/build/builds?api-version=7.1-preview.7`;

    const requestBody = {
        definition: { id: PIPELINE_ID }
    };
    var axios = require('axios');
    var data = JSON.stringify({
      "definition": {
        "id": 10
      }
    });
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
        url: 'https://dev.azure.com/passadis/demo-azureheads/_apis/build/builds?api-version=7.1-preview.7',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': 'Basic PAT_HERE', 
        },
        data : data
      };
      axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });
    try {
        const response = await axios.post(buildUrl, requestBody, config);
        context.log(`Build queued with ID: ${response.data.id}`);
    } catch (error) {
        context.log(`Failed to queue build: ${error.message}`);
    }
};
