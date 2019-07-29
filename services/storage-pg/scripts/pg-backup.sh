#
# Creates a binary backup of the postgres database
#

PRINT_FEEDBACK="yes"

for last; do true; done
if [ "--now" == "$last" ]; then
    PRINT_FEEDBACK="no"
fi

BACKUP_DATE_FORMAT=${BACKUP_DATE_FORMAT:-"+%Y%m%d.%H%M%S"}
BACKUP_DATE=$(date $BACKUP_DATE_FORMAT)
BACKUP_FILE_FORMAT="%s___%p___%d"

BACKUP_SQL_HOST=${PG_HOST:-"postgres"}
BACKUP_SQL_USER=${PG_USERNAME:-"cerberus"}
BACKUP_SQL_DB=${PG_DATABASE:-"cerberus"}

BACKUP_FILE_NAME=${P2:-$BACKUP_FILE_FORMAT}
BACKUP_FILE_NAME="${BACKUP_FILE_NAME/\%s/$BACKUP_SQL_HOST}"
BACKUP_FILE_NAME="${BACKUP_FILE_NAME/\%p/$BACKUP_SQL_DB}"
BACKUP_FILE_NAME="${BACKUP_FILE_NAME/\%d/$BACKUP_DATE}"

BACKUP_FILE_PATH="/backup/$BACKUP_FILE_NAME"
BACKUP_FILE_PATH="$BACKUP_FILE_PATH.sql"

if [ "$PRINT_FEEDBACK" == "yes" ]; then
    echo ""
    echo "======== PG BACKUP ========"
    echo "host:      $BACKUP_SQL_HOST"
    echo "user:      $BACKUP_SQL_USER"
    echo "database:  $BACKUP_SQL_DB"
    echo "target:    $BACKUP_FILE_PATH"
    echo ""
    enterToContinue
    echo ""
    echo ""
fi

# Uncompressed
#humble exec postgres pg_dump --user=$PG_USERNAME $SQL_DATABASE --file=$BACKUP_FILE_PATH

# Compressed
humble exec postgres pg_dump --user=$BACKUP_SQL_USER -Fc $BACKUP_SQL_DB --file=$BACKUP_FILE_PATH
