#!/bin/bash
set -euo pipefail

working_dir="$(dirname "$0")"
source "$working_dir/../.env.local"

# Default Values
ENV=""
STACK_PARAMS=""
MODE_SYNC=true
MODE_DEBUG=false

# Overriddable Stack Params
STACK_EC2_KEY_PAIR_NAME="UsePreviousValue=true"
STACK_ENV_MODE="UsePreviousValue=true"
STACK_NETWORK_VPC="UsePreviousValue=true"
STACK_NETWORK_SUBNET="UsePreviousValue=true"

QUEUE_DB_PASSWORD="UsePreviousValue=true"
STORAGE_DB_PASSWORD="UsePreviousValue=true"

function help() {
    echo "SHOW HELP..."
    exit 0
}

# Show help if no params were given
CHKP=${1:-} ; [ -z ${CHKP} ] && help

# Compose local properties with flag options
while [ "$#" -ne 0 ] ; do
    case "$1" in
        update-stack)
            shift
            ;;
        dev|stage|prod)
            ENV="$1"
            shift
            ;;
        -h|--help)
            help
            shift
            ;;
        --mode) # boot | init | up
            STACK_ENV_MODE="ParameterValue=${2}"
            shift 2
            ;;
        --ec2-key)
            STACK_EC2_KEY_PAIR_NAME="ParameterValue=${EC2_KEY_PAIR_NAME}"
            shift
            ;;
        --vpc-network)
            STACK_NETWORK_VPC="ParameterValue=${STACK_VPC}"
            shift
            ;;
        --vpc-subnet)
            STACK_NETWORK_SUBNET="ParameterValue=${STACK_VPC_SUBNET}"
            shift
            ;;
        --queue-pg-pwd)
            QUEUE_DB_PASSWORD="ParameterValue=${QUEUE_DATABASE_PASSWORD}"
            shift
            ;;
        --storage-pg-pwd)
            STORAGE_DB_PASSWORD="ParameterValue=${STORAGE_DATABASE_PASSWORD}"
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

STACK_PARAMS="${STACK_PARAMS} ParameterKey=EC2KeyPairName,${STACK_EC2_KEY_PAIR_NAME}"
STACK_PARAMS="${STACK_PARAMS} ParameterKey=NetworkVPCId,${STACK_NETWORK_VPC}"
STACK_PARAMS="${STACK_PARAMS} ParameterKey=NetworkSubnetId,${STACK_NETWORK_SUBNET}"
STACK_PARAMS="${STACK_PARAMS} ParameterKey=QueueDbPassword,${QUEUE_DB_PASSWORD}"
STACK_PARAMS="${STACK_PARAMS} ParameterKey=StorageDbPassword,${STORAGE_DB_PASSWORD}"

STACK_PARAMS="${STACK_PARAMS} ParameterKey=EnvironmentMode,${STACK_ENV_MODE}"
STACK_PARAMS="${STACK_PARAMS} ParameterKey=EnvironmentType,UsePreviousValue=true"
STACK_PARAMS="${STACK_PARAMS} ParameterKey=S3TemplateRoot,ParameterValue=${BUCKET_URL}"

CMD="aws"
CMD="${CMD} --region=${AWS_REGION}"
CMD="${CMD} --profile=${AWS_CLI_PROFILE}"
CMD="${CMD} cloudformation update-stack"
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
    printf "[$(date '+%FT%T%z')] %s\n" "Initiating stack update for the ${STACK_NAME} [${ENV}] stack"
    $CMD
fi
