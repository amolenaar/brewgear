
use 'scripts/dci'

BrewGear.Logic = {}

# gravity points per gram per litre
POINTS_G_L = 0.3865

sg_to_brix = (sg) ->
  -0.0002112789 * sg * sg + 0.6907289 * sg - 479.4467


class BrewGear.Logic.MaltPercentage

    constructor: (@recipe, @grain) ->

    totalYield: ->
        og = @recipe.plannedOg
        vol = @recipe.targetVolume
        sg_to_brix(og) * vol * 10

    plannedGU: ->
        (@recipe.plannedOg - 1) * 1000

    percentage: ->
        extract_potential = POINTS_G_L * @grain.source.yield
        total_gravity = @plannedGU() * @recipe.targetVolume

        (100 * @grain.amount * extract_potential *
            (if @grain.addDuring == 'mash' then efficiency else 1)) / total_gravity

    amountInPercentage: (percentage) ->
        """
        Percentage is in the range 0-100.
        Provide amount to be added in grammes.
        """
        console.log 'amountInPercentage', percentage
        percentage = parseFloat(percentage) / 100
        extract_potential = POINTS_G_L * @grain.source.yield
        total_gravity = @plannedGU() * @recipe.targetVolume

        @grain.amount = (percentage * total_gravity) / (extract_potential *
                (if @grain.addDuring == 'mash' then efficiency else 1))
        console.log 'amountInPercentage', @grain, percentage, extract_potential, total_gravity


# vim:sw=4:et:ai
