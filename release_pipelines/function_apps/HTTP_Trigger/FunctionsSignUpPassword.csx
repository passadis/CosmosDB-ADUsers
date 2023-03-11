#r "Newtonsoft.Json"

using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
using Newtonsoft.Json;
using Microsoft.Azure.WebJobs;

public static async Task<IActionResult> Run(HttpRequest req, ILogger log, IAsyncCollector<dynamic> outputDocuments)
{
    var requestUtc = DateTime.UtcNow;

    string requestBody = null;
    using (var bodyReader = new StreamReader(req.Body))
    {
        requestBody = await bodyReader.ReadToEndAsync();
    }

    log.LogInformation($"Request body: {requestBody}");

    var formValues = System.Web.HttpUtility.ParseQueryString(requestBody);

    var password = GeneratePassword();

    var outputDocument = new 
    {
        requestUtc,
        Company = "Azure",
        firstName = formValues["firstName"],
        lastName = formValues["lastName"],
        nickname = formValues["nickname"],
        password = password
    };

    await outputDocuments.AddAsync(outputDocument);

    return new ContentResult
    {
        Content = "success",
        ContentType = "text/plain",
        StatusCode = (int)HttpStatusCode.OK
    };
}

public static string GeneratePassword()
{
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var random = new Random();
    var password = new string(
        Enumerable.Repeat(chars, 6)
                  .Select(s => s[random.Next(s.Length)])
                  .ToArray());

    return "my1P@" + password;
}
