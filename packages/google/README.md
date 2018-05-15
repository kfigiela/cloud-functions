
## Setup

1. Run `yarn install`

## Setup the Google Cloud Project

2. Create a Google Cloud Project
3. Enable the following APIs:
    * Google Cloud Functions
    * Google Cloud Deployment Manager
    * Google Cloud Storage
    * Stackdriver Logging
    * Google Cloud Runtime Configuration
4. Create a service account and save a JSON keyfile to a know location
5. Create a Storage Input Bucket (e.g. serverless-input-bucket)

### Create a runtime configuration 

1. Initialize a named configuration
```bash
gcloud beta runtime-config configs create [CONFIG_NAME]
```
2. Add the input and output bucket names to the configuration
```bash
gcloud beta runtime-config configs variables set INPUT_BUCKET_NAME [INPUT_BUCKET_NAME] --config-name [CONFIG_NAME]
gcloud beta runtime-config configs variables set BUCKET_NAME [OUTPUT_BUCKET_NAME] --config-name [CONFIG_NAME]
``` 

## Create `.env` to store configuration
2. Copy `.env_sample` file and fill in:
    * `GOOGLE_CLOUD_SERVICE_NAME`: the name of the Serverless service
    * `GOOGLE_CLOUD_PROJECT_NAME`: name of the Google Cloud Project
    * `GOOGLE_CLOUD_KEYFILE`: path to the downloaded keyfile
    * `GOOGLE_CLOUD_STORAGE_INPUT_BUCKET_NAME`: name of the bucket with files to be downloaded 
    * `GOOGLE_CLOUD_STORAGE_BUCKET_NAME`: name of the bucket for saving files
    
2. Then use the file with `source .env`

## Deploy

```bash
sls deploy
```

## Run
```bash
sls invoke transfer_[MEMORY]
```
or 
```bash
curl [API_GATEWAY] 
```

## [Setup Lifecycle on the Storage Output Bucket]
This will cause the Objects to be removed after 30 days.
```bash
gsutil lifecycle set tools/gsutil-lifecycle-config.json gs://[OUTPUT_BUCKET_NAME]
```

See the [official docs](https://serverless.com/framework/docs/providers/google/) for more info.
