

use 'scripts/spine/spine'
use 'scripts/model'

BrewGear.Controller ?= {}

# Stand-in dummy class
class BrewGear.Controller.Null extends Spine.Controller


class BrewGear.Controller.Recipes extends Spine.Controller
    @elements:
        'ul': 'list'
        '#recipe-item': 'template'

    constructor: ->
        super
        BrewGear.Model.Recipe.bind 'refresh change', @render
        @release ->
            BrewGear.Model.Recipe.unbind 'refresh change', @render

    render: =>
        @log 'rendering recipes'
        @list.empty()
        model = BrewGear.Model.Recipe.all()
        @list.append (@template.tmpl recipe) for recipe in model
        @list.listview 'refresh' 


class BrewGear.Controller.Recipe extends Spine.Controller
    @elements:
        '.to-fermentables': 'fermentablesLink'
        '.to-hops': 'hopsLink'
        '.to-fermentation': 'fermentationLink'
        'input[name="batch"]': 'batch'
        'input[name="name"]': 'name'

    @events:
        'change input': 'update'
        'blur input': 'update'

    update: =>
        @model.batch = @batch.val()
        @model.name = @name.val()
        @model.save()

    render: =>
        @batch.val @model.batch
        @name.val @model.name
        batch = @model.batch
        @fermentablesLink.attr('href', "#/recipes/#{batch}/fermentables")
        @hopsLink.attr('href', "#/recipes/#{batch}/hops")
        @fermentationLink.attr('href', "#/recipes/#{batch}/fermentation")



class BrewGear.Controller.Fermentables extends Spine.Controller
    @elements:
        'ul': 'list'
        '.template': 'template'
        'h3': 'name'

    render: =>
        @name = @model.name
        @list.empty()
        console.log ' model: ' + @model.fermentables
        for i, fermentable of @model.fermentables
            @list.append @template.tmpl
                name: fermentable.name
                color: fermentable.color
                amount: fermentable.amount
                hash: "#/recipes/#{@model.batch}/fermentables/#{i}"
        @list.listview 'refresh'

# vim:sw=4:et:ai
