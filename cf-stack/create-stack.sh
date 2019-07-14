#!/bin/bash
set -euo pipefail

working_dir="$(dirname "$0")"
source "$working_dir/../.env.local"

# Default Values
ENV=""
STACK_PARAMS=""
MODE_SYNC=true
MODE_DEBUG=false

function help() {
    echo "SHOW HELP..."
    exit 0
}

# Show help if no params were given
CHKP=${1:-} ; [ -z ${CHKP} ] && help

# Compose local properties with flag options
while [ "$#" -ne 0 ] ; do
    case "$1" in
        create-stack)
            shift
            ;;
        dev|prod)
            ENV="$1"
            shift
            ;;
        -h|--help)
            help
            shift
            ;;
        --no-sync)
            MODE_SYNC=false
            shift
            ;;
        --debug)
            MODE_SYNC=false
            MODE_DEBUG=true
            shift
            ;;
        *)
            help
            shift
            ;;
    esac
done

# Make sure we have an ENVIRONMENT after parsing all
[ -z ${ENV} ] && help

BUCKET_URL="https://s3-${AWS_REGION}.amazonaws.com/${STACK_BUCKET}/${STACK_NAME}/${ENV}"

# Provided from enviroment variables
STACK_PARAMS="${STACK_PARAMS} ParameterKey=EC2KeyPairName,ParameterValue=${EC2_KEY_PAIR_NAME}"
STACK_PARAMS="${STACK_PARAMS} ParameterKey=QueueDbPassword,ParameterValue=${QUEUE_DATABASE_PASSWORD}"
STACK_PARAMS="${STACK_PARAMS} ParameterKey=StorageDbPassword,ParameterValue=${STORAGE_DATABASE_PASSWORD}"
STACK_PARAMS="${STACK_PARAMS} ParameterKey=NetworkVPCId,ParameterValue=${STACK_VPC}"
STACK_PARAMS="${STACK_PARAMS} ParameterKey=NetworkSubnetId,ParameterValue=${STACK_VPC_SUBNET}"

STACK_PARAMS="${STACK_PARAMS} ParameterKey=EnvironmentType,ParameterValue=${ENV}"
STACK_PARAMS="${STACK_PARAMS} ParameterKey=EnvironmentMode,ParameterValue=boot"
STACK_PARAMS="${STACK_PARAMS} ParameterKey=S3TemplateRoot,ParameterValue=${BUCKET_URL}"

CMD="aws"
CMD="${CMD} --region=${AWS_REGION}"
CMD="${CMD} --profile=${AWS_CLI_PROFILE}"
CMD="${CMD} cloudformation create-stack"
CMD="${CMD} --stack-name "${STACK_NAME}-${ENV}""
CMD="${CMD} --template-url "${BUCKET_URL}/master.yaml""
CMD="${CMD} --parameters ${STACK_PARAMS}"
CMD="${CMD} --capabilities  ${STACK_CAPABILITIES}"

# Sync templates
printf "[$(date '+%FT%T%z')] %s\n" "Starting update stack for $ENV environment"
if [ $MODE_SYNC = true ] ; then
    printf "[$(date '+%FT%T%z')] %s\n" "Syncing templates to S3 bucket"
    humble stack sync $ENV
else
    printf "[$(date '+%FT%T%z')] %s\n" "--nosync used, skipping S3 sync"
fi

# Execute AWS Statement
if [ $MODE_DEBUG = true ] ; then
    echo "--debug used, showing generated aws statement:"
    echo ""
    echo $CMD
else
    printf "[$(date '+%FT%T%z')] %s\n" "Initiating stack create for the ${STACK_NAME} [${ENV}] stack"
    $CMD
fi
