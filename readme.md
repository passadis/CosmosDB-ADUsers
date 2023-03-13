# Register and Import AD Users from Cosmos DB and Azure Functions with HTML and Static Apps 

This Repo contains all the Pipelines needed to deploy a recent Solution that imports AD Users from an HTML Registration form. The form is hosted on Azure Static Apps, for later updates and enhancements.The procedure inserts the fields into Comsos DB via Azure Functions HTTP Trigger, checks for Unique ID on the nickname value, and if it is OK the data is stored. Another Function is triggered and the User details are transfromed to CSV and Stored in a Storage Blob. From there we can have an hourly or a Scheduled Trigger to start a Build Pipeline which copies the CSV into a Self Hosted DevOps Agent and uses MS Graph SDK (Powershell) to import the users to AzureAD. I have added a third Function that triggers the build Pipeline once the CSV is created ! So it is a fully automated procedure! 

A really nice Solution which integrates Azure Services & DevOps while most of the Deployment is automated.
![image](https://user-images.githubusercontent.com/53148138/223159115-e4dda8f8-930e-4d7c-b6d0-8d4cb60006d9.png)

## We are going to need:

- An Azure Subscription
- VS Code
- A DevOps Organization
- A Microsoft 365 Tenant with some trial licenses ( This is optional as the MS Graph also assigns the users into a Group with Licenses)
- Patience!

Here is a more detailed Diagram with the components we use. Remeber every Resource has Private Endpoint and we are using Service Principals for the Authentication and Authorization Tasks.
![image](https://user-images.githubusercontent.com/53148138/224698198-ce966da8-1d5c-43b2-8e06-25744e26c265.png)


What we are doing here is:  
- Deploy the Log Analytics Workspace
- Deploy the Cosmos DB and the VNET
- Deploy a Cosmos DB Container with Unique Key
- Deploy the Function App with an Application Basic Plan (B1)
- Configure CORS
- Integrate the Function APP with the VNET
Then Stage 2 is triggering a Build which Copies and runs a Powershell Script on the Self Hosted Agent that creates and configures the Private DNS Zone for Cosmos.
Once the Resources are up and running use the files on the repo folders


The Folders contain the Release and Build Pipelines needed to deploy the basis of the Solution. Once we run the release Pipeline Stage 2 triggers the Build Pipeline which deploys the Private DNS Zone and adds the Cosmos DB Configuration of the Private Endpoint

Contact me if you have an idea to make this better!
