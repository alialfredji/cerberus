/* eslint-disable */
'use strict';

/**
 * Production Run
 */
if (process.env.NODE_ENV === 'production') {
    require('@babel/polyfill');
    require('./build/src/boot').default().catch(function (err) {
        console.log('*** BOOT: Fatal Error');
        console.log(err);
    });

/**
 * Development Run
 */
} else {
    require('@babel/polyfill');
    require('@babel/register');

    require('./src/boot').default().catch((err) => {
        console.log('*** BOOT: Fatal Error');
        console.log(err);
    })
}

// Let Docker exit on Ctrl+C
process.on('SIGINT', function() {
    process.exit();
});
