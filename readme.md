<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=azure,powershell,html,css,dotnet,nodejs,vscode" />
  </a>
</p>

<h1 align="center">Register and Import Entra ID Users from Cosmos DB and Azure Functions with DevOps</h1>
 

This Repo contains all the Pipelines needed to deploy a Solution that imports AD Users from an HTML Registration form. The form is hosted on Azure Static Apps, for later updates and enhancements.The procedure inserts the fields into Comsos DB via Azure Functions HTTP Trigger, checks for Unique ID on the nickname value, and if it is OK the data is stored. Another Function is triggered and the User details are transfromed to CSV and Stored in a Storage Blob. From there we can have an hourly or a Scheduled Trigger to start a Build Pipeline which copies the CSV into a Self Hosted DevOps Agent and uses MS Graph SDK (Powershell) to import the users to AzureAD. I have added a third Function that triggers the build Pipeline once the CSV is created ! So it is a fully automated procedure! 

A really nice Solution which integrates Azure Services & DevOps while most of the Deployment is automated.
We can add a Gate on the Build Pipeline so the procedure receives an approval, while the approver gets an Email.

## We are going to need:

- An Azure Subscription
- VS Code
- A DevOps Organization and a Self Hosted Agent with Standard Public IP
- A Microsoft 365 Tenant with some trial licenses ( This is optional as the MS Graph also assigns the users into a Group with Licenses)
- Patience!

What we are doing here is:  
- Deploy the Log Analytics Workspace
- Deploy the Cosmos DB and the VNET
- Deploy a Cosmos DB Container with Unique Key
- Deploy the Function App with an Application Basic Plan (B1)
- Configure CORS
- Integrate the Function APP with the VNET
Then Stage 2 is triggering a Build which Copies and runs a Powershell Script on the Self Hosted Agent that creates and configures the Private DNS Zone for Cosmos.
Once the Resources are up and running use the files on the repo folders.

## Steps:

This is not a small deployment . A lot of parts are integrated so it does matter how to deploy and the steps to make it work. Lets start from the resources we deploy into an Azure Subscription.

The following release pipeline has 2 Stages. First Stage deploys:

    Task 1 – Our resource group with a Log Analytics Workspace for the Application Insights (AzCli)
    Task 2 – A Virtual Network , the Cosmos DB Account with VNET Integration and Private Endpoint(Arm)
    Task 3 – Cosmos DB Container with Unique ID setting to prevent Duplicate Nickname/Email/UPN(Arm)
    Task 4 – Function App(Arm)
    Task 5 – Function App Subnet and CORS Setting(AzCli)
    Task 6 – Function App VNET Injection(Powershell)

The Second Stage takes us to just a trigger to Start a Build Pipeline that deploys the Private Endpoint and the configuration to integrate it with the Private DNS Zone for CosmosDB. The way i chose to do this step can be done only via Build Pipeline!

Now some details to clarify things. We are using Private Endpoints and Private DNS Zone therefore the VNET Injection setting from Azure Functions is mandatory. We are setting Unique ID for Cosmos DB field (nickname) so even the FirstName , LastName are the same a third field named Nickname will be checked upon and fail the HTML Signup with a message. The Nickname is handy to create a random password or the email and so on. We could use Synapse ( or Data Factory) to export the CSV, but the standard way of Azure Functions with a second Function triggering upon Cosmos DB change, was the final choice. It took me a long time to make the code work i have to admit!

The end user is hitting a URL ( Of course custom domain can be configured, either in Static Apps or Storage Account Static WebSite), and is presented with the HTML Form where inputs First Name , Last Name and Nickname. If there is no duplicate a message is returned “Sign Up Completed” , otherwise (and on any failure) ‘Sign Up Failed”. It is important to set the CORS setting in Azure Functions to * in order to accept data from any URL.

## Contribution

Contributions are welcome! If you have suggestions or improvements, feel free to fork the repository, make your changes, and submit a pull request.

The Folders contain the Release and Build Pipelines needed to deploy the basis of the Solution. Once we run the release Pipeline Stage 2 triggers the Build Pipeline which deploys the Private DNS Zone and adds the Cosmos DB Configuration of the Private Endpoint.

Contact me if you have an idea to make this better!

## Architecture

![image](https://user-images.githubusercontent.com/53148138/223159115-e4dda8f8-930e-4d7c-b6d0-8d4cb60006d9.png)
