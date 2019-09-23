
SQL_HOST=${PG_HOST:-"postgres"}
SQL_USER=${PG_USERNAME:-"cerberus"}
SQL_DB=${PG_DATABASE:-"cerberus"}

TABLE="${2}"
FILE_PATH="/backup/$TABLE.sql"

echo ""
echo "======== PG RESTORE ========"
echo "host:      $SQL_HOST"
echo "user:      $SQL_USER"
echo "database:  $SQL_DB"
echo "target:    $FILE_PATH"
echo ""
enterToContinue
echo ""
echo ""

# echo "humble exec $SQL_HOST pg_restore --user=$SQL_USER --table=$TABLE -C -d $SQL_DB $FILE_PATH"
humble exec $SQL_HOST pg_restore --user=$SQL_USER --table=$TABLE -C -d $SQL_DB $FILE_PATH