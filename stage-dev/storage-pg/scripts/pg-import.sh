#
# Imports a plain SQL backup
#

PRINT_FEEDBACK="yes"

for last; do true; done
if [ "--now" == "$last" ]; then
    PRINT_FEEDBACK="no"
fi

BACKUP_SQL_HOST=${PG_HOST:-"postgres"}
BACKUP_SQL_USER=${PG_USERNAME:-"cerberus"}
BACKUP_SQL_DB=${PG_DATABASE:-"cerberus"}

BACKUP_FILE_NAME=${P2:-"nonono"}

BACKUP_FILE_PATH="/backup/$BACKUP_FILE_NAME"
BACKUP_FILE_PATH="$BACKUP_FILE_PATH.sql"

if [ "$PRINT_FEEDBACK" == "yes" ]; then
    echo ""
    echo "======== PG IMPORT ========"
    echo "host:      $BACKUP_SQL_HOST"
    echo "user:      $BACKUP_SQL_USER"
    echo "database:  $BACKUP_SQL_DB"
    echo "target:    $BACKUP_FILE_PATH"
    echo ""
    enterToContinue
    echo ""
    echo ""
fi

humble exec postgres psql --user=$BACKUP_SQL_USER -d $BACKUP_SQL_DB --file=$BACKUP_FILE_PATH
