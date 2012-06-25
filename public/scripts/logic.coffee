
use 'scripts/dci'

BrewGear.Logic = {}

# gravity points per gram per litre
POINTS_G_L = 0.3865

sg_to_brix = (sg) ->
  -0.0002112789 * sg * sg + 0.6907289 * sg - 479.4467


class BrewGear.Logic.GristPercentage

    constructor: (@recipe, @grain) ->

    totalYield: ->
        og = @recipe.plannedOg
        vol = @recipe.targetVolume
        sg_to_brix(og) * vol * 10

    plannedGU: ->
        (@recipe.plannedOg - 1) * 1000

    amountInPercentage: (percentage) ->
        """
        Percentage is in the range 0-100.
        Provide amount to be added in grammes.
        """
        extract_potential = POINTS_G_L * @grain.source.yield
        total_gravity = @plannedGU() * @recipe.targetVolume

        @grain.amount = ((percentage / 100) * total_gravity) / (extract_potential *
                (if @grain.addDuring == 'mash' then efficiency else 1))


# vim:sw=4:et:ai
