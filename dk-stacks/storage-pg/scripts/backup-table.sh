
SQL_HOST=${PG_HOST:-"postgres"}
SQL_USER=${PG_USERNAME:-"postgres"}
SQL_DB=${PG_DATABASE:-"postgres"}

TABLE_NAME=${2:-""}

if [ "$TABLE_NAME" == "" ]; then
    echo ""
    echo "[postgres] Table name not provided"
    echo ""
    exit 0
fi

BACKUP_DATE_FORMAT=${BACKUP_DATE_FORMAT:-"+%Y%m%d%H%M%S"}
BACKUP_DATE=$(date $BACKUP_DATE_FORMAT)
BACKUP_TABLE_NAME="${TABLE_NAME}_${SQL_HOST}"
BACKUP_TABLE_NAME="${BACKUP_TABLE_NAME}_${SQL_DB}"
BACKUP_TABLE_NAME="${BACKUP_TABLE_NAME}_${BACKUP_DATE}"

BACKUP_FILE_PATH="/backup/$BACKUP_TABLE_NAME"
BACKUP_FILE_PATH="$BACKUP_FILE_PATH.sql"

echo ""
echo "======== PG BACKUP ========"
echo "host:      $SQL_HOST"
echo "user:      $SQL_USER"
echo "database:  $SQL_DB"
echo "target:    $BACKUP_FILE_PATH"
echo ""
enterToContinue
echo ""
echo ""

humble exec $SQL_HOST pg_dump --user=$SQL_USER -Fc $SQL_DB --table=$TABLE_NAME --file=$BACKUP_FILE_PATH
