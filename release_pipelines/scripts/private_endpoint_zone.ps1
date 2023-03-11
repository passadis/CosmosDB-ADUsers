$SubscriptionId = "xxxxxxxxxxxxxxxx"
# Resource group where the Azure Cosmos DB account and virtual network resources are located
$ResourceGroupName = "xxxxx"
# Name of the Azure Cosmos DB account
$CosmosDbAccountName = "xxxxxx"

# Resource for the Azure Cosmos DB account: Sql, SqlDedicated, MongoDB, Cassandra, Gremlin, or Table
$CosmosDbSubResourceType = "Sql"
# Name of the existing virtual network
$VNetName = "vnet-functions"
# Name of the target subnet in the virtual network
$SubnetName = "default"
# Name of the private endpoint to create
$PrivateEndpointName = "privatesql"
# Location where the private endpoint can be created. The private endpoint should be created in the same location where your subnet or the virtual network exists
$Location = "westeurope"
Connect-AzAccount -ApplicationID xxxxxxxxxxxxxx -TenantId xxxxxxxxxxxxxxxxx -CertificateThumbprint xxxxxxxxxxxxxxxxxxxxxx
Import-Module Az.PrivateDns

$cosmosDbResourceId = "/subscriptions/$($SubscriptionId)/resourceGroups/$($ResourceGroupName)/providers/Microsoft.DocumentDB/databaseAccounts/$($CosmosDbAccountName)"

$privateEndpointConnection = New-AzPrivateLinkServiceConnection -Name "myConnectionPS" -PrivateLinkServiceId $cosmosDbResourceId -GroupId $CosmosDbSubResourceType
 
$virtualNetwork = Get-AzVirtualNetwork -ResourceGroupName  $ResourceGroupName -Name $VNetName  
 
$subnet = $virtualNetwork | Select -ExpandProperty subnets | Where-Object  {$_.Name -eq $SubnetName}  
 
$privateEndpoint = New-AzPrivateEndpoint -ResourceGroupName $ResourceGroupName -Name $PrivateEndpointName -Location $Location -Subnet  $subnet -PrivateLinkServiceConnection $privateEndpointConnection -Force

#Import-Module Az.PrivateDns

# Zone name differs based on the API type and group ID you are using. 
$zoneName = "privatelink.documents.azure.com"
$zone = New-AzPrivateDnsZone -ResourceGroupName $ResourceGroupName `
  -Name $zoneName

$link  = New-AzPrivateDnsVirtualNetworkLink -ResourceGroupName $ResourceGroupName `
  -ZoneName $zoneName `
  -Name "myzonelink" `
  -VirtualNetworkId $virtualNetwork.Id  
 
$pe = Get-AzPrivateEndpoint -Name $PrivateEndpointName `
  -ResourceGroupName $ResourceGroupName

$networkInterface = Get-AzResource -ResourceId $pe.NetworkInterfaces[0].Id `
  -ApiVersion "2019-04-01"

# Create DNS configuration

$PrivateDnsZoneId = $zone.ResourceId

$config = New-AzPrivateDnsZoneConfig -Name $zoneName `
 -PrivateDnsZoneId $PrivateDnsZoneId

## Create a DNS zone group
New-AzPrivateDnsZoneGroup -ResourceGroupName $ResourceGroupName `
 -PrivateEndpointName $PrivateEndpointName `
 -Name "MyPrivateZoneGroup" `
 -PrivateDnsZoneConfig $config
