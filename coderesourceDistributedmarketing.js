%%[
/*-----Start Initialize the variables----------------*/
set @folderName=RequestParameter('folderName')
set @dataExtensionName=RequestParameter('dataExtensionName')
/*---------------------End-----------------------------*/
]%%

<script runat="server">
    // Load necessary libraries
    Platform.Load("core", "1");

    try {
        // Instantiate WSProxy object
        var api = new Script.Util.WSProxy();

        // Get folder and data extension names
        var folderName = Variable.GetValue("@folderName") || "Test";
        var dataExtensionName = Variable.GetValue("@dataExtensionName") || "Test";

        // Retrieve folder ID or create a new one if not found
        var folderId = RetrieveFolderID(folderName);
        var result;
        if (!folderId) {
            result = createDataExtensionFolder(api, folderName);
            folderId = RetrieveFolderID(folderName);
            result = createDataExtension(api, dataExtensionName, folderId);
        } else {
            result = createDataExtension(api, dataExtensionName, folderId);
        }
       
        Variable.SetValue("@status",result.Status);
        Variable.SetValue("@ErrorCode","000");
        Variable.SetValue("@StatusMessage","Success");
    } catch (ex) {
        // Catch and log any errors that occur
        var APIExceptionDE = DataExtension.Init("APIException");
        APIExceptionDE.Rows.Add({
            Message: ex.message,
            Description: ex.description,
            InnerException: ex.jintException,
            FunctionName: "DataExtensionRowsRetrieve"
        });
        Variable.SetValue("@status","Error");
        Variable.SetValue("@ErrorCode","000");
        Variable.SetValue("@StatusMessage",ex.message);
    }

    // Function to retrieve folder ID by name
    function RetrieveFolderID(folderName) {
        var filter = {
            Property: "Name",
            SimpleOperator: "equals",
            Value: folderName
        };
        var results = Folder.Retrieve(filter);
        return results[0].ID; // Return the ID of the first folder found
    }

    // Function to create a Data Extension
    function createDataExtension(api, dataExtensionName, folderId) {
        // Set the client ID
        api.setClientId({ "ID": Platform.Function.AuthenticatedMemberID() });

        // Define Data Extension configuration
        var config = {
            "CustomerKey": dataExtensionName,
            "Name": dataExtensionName,
            "CategoryID": folderId,
            "Fields": [
                // Define Data Extension fields
                { "Name": "greeting", "FieldType": "Text", "MaxLength": 255 },
                { "Name": "id", "FieldType": "Text", "MaxLength": 254, "IsRequired": true },
                { "Name": "email", "FieldType": "EmailAddress", "IsRequired": true },
                { "Name": "sfCampaignId", "FieldType": "Text", "MaxLength": 255 },
                { "Name": "sfCampaignMemberId", "FieldType": "Text", "MaxLength": 255 },
                { "Name": "sfQuickSendId", "FieldType": "Text", "MaxLength": 255 },
                { "Name": "sendFromName", "FieldType": "Text", "MaxLength": 255 },
                { "Name": "sendFromEmail", "FieldType": "Text", "MaxLength": 255 },
                { "Name": "firstName", "FieldType": "Text", "MaxLength": 50 },
                { "Name": "lastName", "FieldType": "Text", "MaxLength": 50 },
                { "Name": "sfUserId", "FieldType": "Text", "MaxLength": 255, "IsRequired": true },
                { "Name": "mobilePhone", "FieldType": "Phone" },
                { "Name": "journeyID", "FieldType": "Text", "MaxLength": 50, "IsRequired": true },
                { "Name": "sfOrgId", "FieldType": "Text", "MaxLength": 50, "IsRequired": true },
                { "Name": "smsValue", "FieldType": "Text", "MaxLength": 160 },
                { "Name": "EntryObjectId", "FieldType": "Text", "MaxLength": 255 }
            ],
            // Data retention settings
            "DataRetentionPeriodLength": 105,
            "RowBasedRetention": false,
            "ResetRetentionPeriodOnImport": true,
            "DeleteAtEndOfRetentionPeriod": false,
            "DataRetentionPeriod": "Weeks",
            "SendableDataExtensionField": {
                "Name": "id",
                "FieldType": "Text"
            },
            "SendableSubscriberField": {
                "Name": "Subscriber Key"
            },
            "IsSendable": true,
            "IsTestable": true
        };

        // Create the Data Extension and return the result
        var result = api.createItem("DataExtension", config);
        return result;
    };

    // Function to retrieve Data Extension by external key
    function RetrieveDataExtension(externalKey) {
        var api = new Script.Util.WSProxy();
        var req = api.retrieve("DataExtension", ["ObjectID"], {
            Property: "DataExtension.CustomerKey",
            SimpleOperator: "equals",
            Value: externalKey
        });
        return req.Results[0].ObjectID;
    }

    // Function to create a Data Extension folder
    function createDataExtensionFolder(api, folderName) {
        // Retrieve parent folder ID
        var req = api.retrieve("DataFolder", ["ID"], {
            Property: "Name",
            SimpleOperator: "equals",
            Value: "Data Extensions"
        });

        var parentFolderId = req.Results[0].ID;

        // Define folder configuration
        var config = {
            "Name": folderName,
            "Description": "API Created Folder",
            "ParentFolder": {
                ID: parentFolderId,
                IDSpecified: true
            },
            "IsActive": true,
            "IsEditable": true,
            "AllowChildren": true,
            "ContentType": "dataextension"
        };

        // Create the folder and return the result
        var result = api.createItem("DataFolder", config);
        return result;
    }
</script>
{
    "status": "%%=v(@status)=%%",
    "ErrorCode": "%%=v(@ErrorCode)=%%",
    "StatusMessage": "%%=v(@StatusMessage)=%%"
}                                