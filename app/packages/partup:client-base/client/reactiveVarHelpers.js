/**
 * Helpers to manipulate a reactive var for the purpose of more readable dan shorter code
 *
 * @memberOf Partup.client
 */
Partup.client.reactiveVarHelpers = {
    /**
     * Helper to increment a reactive number variable
     *
     * @memberOf Partup.client.reactiveVarHelpers
     * @param {ReactiveVar} reactive variable to increment
     * @param {Number} ammount to increment
     */
    incrementNumber: function(reactiveNumber, ammount) {
        var number = reactiveNumber.get();
        number = number + ammount;
        reactiveNumber.set(number);
    }
};
