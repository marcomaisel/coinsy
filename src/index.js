"use strict";
const Alexa = require("alexa-sdk");
var https = require("https");

var APP_ID = 'xxx';


exports.handler = (event, context, callback) => {
    var alexa = Alexa.handler(event, context);

    alexa.appId = APP_ID;
    alexa.registerHandlers(newSessionHandlers, startHandlers, getCurrencyRateHandlers, getChangeHandlers, getMarketCapHandlers, getInfoHandlers);
    alexa.execute();
};

var states = {
    STARTMODE: '_STARTMODE',
    GETRATEMODE: '_GETRATEMODE',
    GETCHANGEMODE: '_GETCHANGEMODE',
    GETMARKETCAPMODE: '_GETMARKETCAPMODE',
    GETINFOMODE: '_GETINFOMODE'
};

/**
 * NEW SESSION
 */
var newSessionHandlers = {
    /**
     * Triggered when the user opens the skill with no furter command.
     * Asks the user whether he wants to send or get a message.
     * Sends state to STARTMODE.
     */
    'LaunchRequest': function () {
        this.handler.state = states.STARTMODE;
        this.emit(":ask", 'Hallo. Zu welcher Kryptowährung möchtest du Informationen?');
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', "Bis bald!");
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', "Bis bald!");
    },
    'SessionEndedRequest': function () {
        this.emit(":tell", "Bis bald!");
    },
    /**
     * Triggered when the user opens the skill directly with the "getRate" command.
     * Sets the state to GETRATEMODE.
     */
    'GetRateIntent': function () {
        this.handler.state = states.GETRATEMODE;
        this.emitWithState("NewSession");
    },
    /**
     * Triggered when the user opens the skill directly with the "getChange" command.
     * Sets the state to GETCHANGEMODE.
     */
    'GetChangeIntent': function () {
        this.handler.state = states.GETCHANGEMODE;
        this.emitWithState("NewSession");
    },
    /**
     * Triggered when the user opens the skill directly with the "getMarketCap" command.
     * Sets the state to GETMARKETCAPMODE.
     */
    'GetMarketCapIntent': function () {
        this.handler.state = states.GETMARKETCAPMODE;
        this.emitWithState("NewSession");
    },
    /**
     * Triggered when the user opens the skill directly with the "getInfo" command.
     * Sets the state to GETINFOMODE.
     */
    'GetInfoIntent': function () {
        this.handler.state = states.GETINFOMODE;
        this.emitWithState("NewSession");
    },
    'AMAZON.HelpIntent': function () {
        let message = 'Sage Hilfe, um Anweisungen zu bekommen oder Stop, um die Anwendung zu beenden.';
        this.emit(':ask', message, message);
    },
    'Unhandled': function () {
        let message = 'Bitte nenne eine Währung, zu der du Informationen erhalten möchtest';
        this.emit(':ask', message, message);
    }
};

/**
 * STARTMODE
 */
var startHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
    'AMAZON.HelpIntent': function () {
        let message = 'Nenne eine Kryptowährung, zu welcher du Informationen erhalten möchtest';
        this.emit(':ask', message, message);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', "Bis bald!");
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', "Bis bald!");
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', "Bis bald!");
    },
    'Unhandled': function () {
        let message = 'Nenne eine Kryptowährung, zu welcher du Informationen erhalten möchtest oder Stop, um die Anwendung zu beenden.';
        this.emit(':ask', message, message);
    },
    /**
     * Triggered when the user opened the skill with no furter command and then
     * decided to call the "getInfo" command.
     * Sets the state to GETRATEMODE
     */
    'StartGetInfoIntent': function () {
        this.handler.state = states.GETINFOMODE;
        this.emitWithState("NewSession");
    }
});

/**
 * GETRATEMODE
 */
var getCurrencyRateHandlers = Alexa.CreateStateHandler(states.GETRATEMODE, {

    /**
     * Triggered when state is set to GETRATEMODE.
     * Gets currency rate from the server with the Get Request and reads it out to the user.
     */
    "NewSession": function () {
        this.emit('NewSession');

        var slots = this.event.request.intent.slots;

        //Get cryptoCurrency
        var cryptoCurry = slots.cryptoCurrency.value;

        /*function slotValue(slot, useId){
        let value = slot.value;
        let resolution = (slot.resolutions && slot.resolutions.resolutionsPerAuthority && slot.resolutions.resolutionsPerAuthority.length > 0) ? slot.resolutions.resolutionsPerAuthority[0] : null;
        if(resolution && resolution.status.code == 'ER_SUCCESS_MATCH'){
            let resolutionValue = resolution.values[0].value;
            value = resolutionValue.id && useId ? resolutionValue.id : resolutionValue.name;
            }
        return value;
        }
        
        var cryptoCurry = slotValue(this.event.request.intent.slots.cryptoCurrency,true);*/

        //Get currency
        var curry = slots.currency.value;

        getData(cryptoCurry, (myResult) => {
            if (curry == "dollar") {
                let rateDollar = Math.floor((Number(myResult[0].price_usd)) * 100) / 100;
                let toldMessage = 'Der ' + cryptoCurry + ' Kurs liegt bei $' + rateDollar;
                this.emit(':tell', toldMessage);
            } else {
                let rateEuro = Math.floor((Number(myResult[0].price_eur)) * 100) / 100;
                let toldMessage = 'Der ' + cryptoCurry + ' Kurs liegt bei ' + rateEuro + '€';
                this.emit(':tell', toldMessage);
            }
        });
    },
    "AMAZON.HelpIntent": function () {
        let message = 'Mir ist leider ein Fehler unterlaufen. Bitte sage "Stop" und öffne die Anwendung erneut';
        this.emit(':ask', message, message);
    },
    "AMAZON.StopIntent": function () {
        this.emit(':tell', "Bis bald!");
    },
    "AMAZON.CancelIntent": function () {
        this.emit(':tell', "Bis bald!");
    },
    "SessionEndedRequest": function () {
        this.emit(':tell', "Bis bald!");
    },
    'Unhandled': function () {
        let message = 'Mir ist leider ein Fehler unterlaufen. Bitte sage "Stop" und öffne die Anwendung erneut';
        this.emit(':ask', message, message);
    }
});

/**
 * GETCHANGEMODE
 */
var getChangeHandlers = Alexa.CreateStateHandler(states.GETCHANGEMODE, {

    /**
     * Triggered when state is set to GETCHANGEMODE.
     * Gets currency changes (24h, 1d, 7d) from the server with the Get Request and reads it out to the user.
     */
    "NewSession": function () {
        this.emit('NewSession');

        var slots = this.event.request.intent.slots;

        //Get cryptoCurrency
        var cryptoCurry = slots.cryptoCurrency.value;

        getData(cryptoCurry, (myResult) => {
            let changeHour = myResult[0].percent_change_1h;
            changeHour = changeHour.replace('.', ',');
            let changeDay = myResult[0].percent_change_24h;
            changeDay = changeDay.replace('.', ',');
            let changeWeek = myResult[0].percent_change_7d;
            changeWeek = changeWeek.replace('.', ',');
            let toldMessage = 'Es folgen die Preisschwankungen von ' + cryptoCurry + '. In den letzten 60 Minuten: ' + changeHour + '%. In den letzten 24 Stunden: ' + changeDay + '%. In den letzten 7 Tagen: ' + changeWeek + '%.';
            this.emit(':tell', toldMessage);
        });

    },
    "AMAZON.HelpIntent": function () {
        let message = 'Mir ist leider ein Fehler unterlaufen. Bitte sage "Stop" und öffne die Anwendung erneut';
        this.emit(':ask', message, message);
    },
    "AMAZON.StopIntent": function () {
        this.emit(':tell', "Bis bald!");
    },
    "AMAZON.CancelIntent": function () {
        this.emit(':tell', "Bis bald!");
    },
    "SessionEndedRequest": function () {
        this.emit(':tell', "Bis bald!");
    },
    'Unhandled': function () {
        let message = 'Mir ist leider ein Fehler unterlaufen. Bitte sage "Stop" und öffne die Anwendung erneut';
        this.emit(':ask', message, message);
    }
});

/**
 * GETMARKETCAPMODE
 */
var getMarketCapHandlers = Alexa.CreateStateHandler(states.GETMARKETCAPMODE, {

    /**
     * Triggered when state is set to GETMARKETCAPMODE.
     * Gets the market cap from the server with the Get Request and reads it out to the user.
     */
    "NewSession": function () {
        this.emit('NewSession');

        var slots = this.event.request.intent.slots;

        //Get cryptoCurrency
        var cryptoCurry = slots.cryptoCurrency.value;

        getData(cryptoCurry, (myResult) => {
            let marketCapEuro = Math.floor((Number(myResult[0].market_cap_eur)));
            let marketCapDollar = Math.floor((Number(myResult[0].market_cap_usd)));
            let toldMessage = 'Die Marktkapitalisierung von ' + cryptoCurry + ' beträgt ' + marketCapEuro + '€, beziehungsweise $' + marketCapDollar + ' Dollar';
            this.emit(':tell', toldMessage);
        });

    },
    "AMAZON.HelpIntent": function () {
        let message = 'Mir ist leider ein Fehler unterlaufen. Bitte sage "Stop" und öffne die Anwendung erneut';
        this.emit(':ask', message, message);
    },
    "AMAZON.StopIntent": function () {
        this.emit(':tell', "Bis bald!");
    },
    "AMAZON.CancelIntent": function () {
        this.emit(':tell', "Bis bald!");
    },
    "SessionEndedRequest": function () {
        this.emit(':tell', "Bis bald!");
    },
    'Unhandled': function () {
        let message = 'Mir ist leider ein Fehler unterlaufen. Bitte sage "Stop" und öffne die Anwendung erneut';
        this.emit(':ask', message, message);
    }
});

/**
 * GETINFOMODE
 */
var getInfoHandlers = Alexa.CreateStateHandler(states.GETINFOMODE, {

    /**
     * Triggered when state is set to GETINFOMODE.
     * Gets all data from the server with the Get Request and reads it out to the user.
     */
    "NewSession": function () {
        this.emit('NewSession');

        var slots = this.event.request.intent.slots;

        //Get cryptoCurrency
        var cryptoCurry = slots.cryptoCurrency.value;

        getData(cryptoCurry, (myResult) => {
            let rateDollar = Math.floor((Number(myResult[0].price_usd)) * 100) / 100;
            let rateEuro = Math.floor((Number(myResult[0].price_eur)) * 100) / 100;
            let changeHour = myResult[0].percent_change_1h;
            changeHour = changeHour.replace('.', ',');
            let changeDay = myResult[0].percent_change_24h;
            changeDay = changeDay.replace('.', ',');
            let changeWeek = myResult[0].percent_change_7d;
            changeWeek = changeWeek.replace('.', ',');
            let marketCapEuro = Math.floor((Number(myResult[0].market_cap_eur)));
            let marketCapDollar = Math.floor((Number(myResult[0].market_cap_usd)));

            let toldMessage = 'Der ' + cryptoCurry + ' Kurs liegt bei ' + rateEuro + '€, beziehungsweise $' + rateDollar + '. Die Preisschwankungen betragen: In den letzten 60 Minuten: ' + changeHour + '%. In den letzten 24 Stunden: ' + changeDay + '%. In den letzten 7 Tagen: ' + changeWeek + '%. ' + 'Die Marktkapitalisierung beträgt ' + marketCapEuro + '€, beziehungsweise $' + marketCapDollar;
            this.emit(':tell', toldMessage);
        });
    },
    "AMAZON.HelpIntent": function () {
        let message = 'Mir ist leider ein Fehler unterlaufen. Bitte sage "Stop" und öffne die Anwendung erneut';
        this.emit(':ask', message, message);
    },
    "AMAZON.StopIntent": function () {
        this.emit(':tell', "Bis bald!");
    },
    "AMAZON.CancelIntent": function () {
        this.emit(':tell', "Bis bald!");
    },
    "SessionEndedRequest": function () {
        this.emit(':tell', "Bis bald!");
    },
    'Unhandled': function () {
        let message = 'Mir ist leider ein Fehler unterlaufen. Bitte sage "Stop" und öffne die Anwendung erneut';
        this.emit(':ask', message, message);
    }
});

// END of Intent Handlers ---------------------------------------------------------------------

/**
 * receiveCurrencyRate
 * Get Request that returns a JSON object. 
 * The messages are returned in callback.
 */
function getData(myData, callback) {

    let options = {
        method: 'GET',
        host: 'api.coinmarketcap.com',
        path: '/v1/ticker/' + encodeURIComponent(myData) + '/?convert=EUR',
    };

    var req = https.request(options, res => {
        res.setEncoding('utf8');
        var returnData = "";

        res.on('data', chunk => {
            returnData = returnData + chunk;
        });

        res.on('end', () => {

            var curryData = JSON.parse(returnData);

            callback(curryData);

        });

    });
    req.end();

}