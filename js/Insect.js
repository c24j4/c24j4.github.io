var Insect = {

    name: 'bee',
    health: 100,
    defense: 30,
    attack: 30,
    luck: 0,

    create: function (options) {
        var self = Object.create(this);

        for (var property in this) {
            self[property] = options[property] ? options[property] : this[property];
        }
        return self;
    },

    setLuck: function() {
        this.luck = Math.floor((Math.random() * 100))/100;
    }

};