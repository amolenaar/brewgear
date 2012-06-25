
use 'scripts/dci'

BrewGear.Logic = {}

map = _.map
zip = _.zip
reduce = _.reduce
forEach = _.forEach

sg_to_brix = (sg) ->
  -0.0002112789 * sg * sg + 0.6907289 * sg - 479.4467


class BrewGear.Logic.GristPercentage

    constructor: (@recipe, @grain) ->

    totalYield: ->
        og = @recipe.plannedOg
        vol = @recipe.targetVolume
        sg_to_brix(og) * vol * 10

    percentage: ->
        parseInt(@grain.amount / @recipe.totalAmount() * 100)

    amountInPercentage: (percentage) ->
        """
        Percentage is in the range 0-100.
        """

        @grain.percentage = percentage / 100

        efficiency = @recipe.efficiency

        new_total_amount = @totalYield() / reduce(
            map(@recipe.fermentables, ((f) ->
                f.source.yield *
                (1.0 - f.source.moisture) *
                f.percentage *
                (if f.addDuring == 'mash' then efficiency else 1))),
            ((memo, e) -> memo + e), 0)

        forEach(@recipe.fermentables, (f) ->
            f.amount = parseInt(new_total_amount * f.percentage))


# vim:sw=4:et:ai
