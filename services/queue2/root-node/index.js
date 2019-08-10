/* eslint-disable */
'use strict';

/*
#
### DEFINE ENVIROMENT
#
*/

if (process.env.NODE_ENV === 'production') {
    require('@babel/polyfill');
} else {
    require('@babel/polyfill');
    require('@babel/register');
}

/*
#
### BOOT NODE
#
*/

require('./src/boot').default().catch(function (err) {
    console.log('*** BOOT: Fatal Error');
    console.log(err);
});

// Let Docker exit on Ctrl+C
process.on('SIGINT', function() {
    process.exit();
});
