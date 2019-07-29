#
# Restore a binary backup of the postgres database
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
    echo "======== PG RESTORE ========"
    echo "host:      $BACKUP_SQL_HOST"
    echo "user:      $BACKUP_SQL_USER"
    echo "database:  $BACKUP_SQL_DB"
    echo "target:    $BACKUP_FILE_PATH"
    echo ""
    enterToContinue
    echo ""
    echo ""
fi

# Compressed
echo "1. destroy current db"
humble down --volumes
sudo rm -rf /docker-data/pg
echo "2. start an empty db (and wait)"
humble up -d postgres
sleep 60
echo "3. run the restore"
humble exec postgres pg_restore --user=$BACKUP_SQL_USER -C -d $BACKUP_SQL_DB $BACKUP_FILE_PATH


# Old stuff
#humble exec postgres dropdb --user=$BACKUP_SQL_USER $BACKUP_SQL_DB
#humble exec postgres createdb -T template0 --user=$BACKUP_SQL_USER $BACKUP_SQL_DB