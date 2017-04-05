/**
 * Application file
 */
var app = (function () {

    var api = {

        // Configuration params
        stageY: 5,
        stageX: 5,

        stageData: [],
        stage: null,

        bees: 4,
        wasps: 4,

        /**
         * Init function. These method initialise the app.
         */
        init: function () {

            this.start = document.getElementById('start');
            this.header = document.getElementById('header');
            this.content = document.getElementById('content');
            this.stage = document.getElementById('stage');
            this.console = document.getElementById('console');

            this.initData();

            this.start.getElementsByTagName('button')[0].onclick = this.startGame;

            this.render();
        },

        /**
         * Data initialisation function
         */
        initData: function () {
            this.stageData = this.createStage(this.stageY, this.stageX);

            this.addInsects(this.stageData, this.bees, 'bee');

            this.reversStage(this.stageData);

            this.addInsects(this.stageData, this.wasps, 'wasp');

            this.reversStage(this.stageData);

            this.stageData[0][0].insect.name = 'queen-bee';
            this.stageData[0][0].insect.defense = 50;
            this.stageData[0][0].insect.attack = 50;

            this.stageData[this.stageY - 1][this.stageX - 1].insect.name = 'queen-wasp';
            this.stageData[this.stageY - 1][this.stageX - 1].insect.defense = 50;
            this.stageData[this.stageY - 1][this.stageX - 1].insect.attack = 50;
        },

        /**
         * Stage creation method
         *
         * @param   rows    number of rows
         * @param   colls   number of columns
         * @returns {Array} stage colection
         */
        createStage: function (rows, colls) {
            var arr = [],
                count = 0;

            for (var y = 0; y < rows; y++) {
                var row = [];
                for (var x = 0; x < colls; x++) {
                    var cell = {
                        id: count + 1,
                        insect: false
                    };
                    row.push(cell);
                    count++;
                }
                arr.push(row);
            }

            return arr;
        },

        /**
         * Add insect method
         *
         * @param   arr     location
         * @param   nr      number of insects
         * @param   name    name of insects
         */
        addInsects: function (arr, nr, name) {
            var count = 0;
            for (var y in arr) {
                for (var x in arr[y]) {
                    var test = ((parseInt(x) + 1) * (parseInt(x) + 1) + (parseInt(y) + 1) * (parseInt(y) + 1)) / 2;
                    if (test <= nr && count < nr) {
                        arr[y][x].insect = Insect.create({
                            name: name
                        });
                        arr[y][x].insect.setLuck();
                        count++;
                    }
                }
            }
        },

        /**
         * Helper method for reversing the stage
         *
         * @param   arr Array   stage collection
         */
        reversStage: function (arr) {
            arr.reverse();
            for (var y in arr) {
                arr[y] = arr[y].reverse();
            }
        },

        /**
         * Rander stage method
         */
        render: function () {
            this.stage.innerHTML = '';
            var rowCount = 0;
            this.stageData.forEach(function (row) {
                var cellCount = 0,
                    rowHtml = document.createElement('div');

                rowHtml.classList.add('row');
                rowHtml.style.height = 'calc((100% - 0px) / ' + app.stageY + ')';

                row.forEach(function (cell) {
                    var cellHtml = document.createElement('div'),
                        insectHtml = document.createElement('div');

                    insectHtml.classList.add('insect');
                    insectHtml.innerHTML = '&nbsp;';

                    cellHtml.appendChild(insectHtml);
                    cellHtml.classList.add('cell');
                    cellHtml.style.width = 'calc(100% / ' + app.stageX + ')';
                    cellHtml.setAttribute('data-y', '' + (rowCount + 1));
                    cellHtml.setAttribute('data-x', '' + (cellCount + 1));
                    cellHtml.setAttribute('id', 'cell_' + cell.id);

                    if (cell.insect) {
                        cellHtml.classList.add(cell.insect.name);
                    }

                    cellHtml.onclick = app.makeMove;

                    rowHtml.appendChild(cellHtml);
                    cellCount++;
                });

                app.stage.appendChild(rowHtml);
                rowCount++;
            });
        },

        /**
         * Start game acction
         */
        startGame: function () {
            app.start.style.display = 'none';
            app.header.style.display = 'block';
            app.content.style.display = 'block';
        },

        /**
         * Move insects on the stage and start attacking if anny enemy is around
         */
        makeMove: function () {
            // If there is a bee selected add a yellow border
            if (this.classList.contains('bee') || this.classList.contains('queen-bee')) {
                if (this.classList.contains('active')) {
                    this.classList.toggle('active');
                } else {
                    app.clearSelection();
                    this.classList.toggle('active');
                }
            } else {
                // If there is no bee, means that this is the new position selected to move the bee
                var selection = app.getSelection(),

                    // Get necessary coordinates
                    oldX = selection ? parseInt(selection.dataset.x) - 1 : null,
                    oldY = selection ? parseInt(selection.dataset.y) - 1 : null,
                    newX = parseInt(this.dataset.x) - 1,
                    newY = parseInt(this.dataset.y) - 1,

                    // Get insect object from the old position
                    insect = selection ? app.stageData[oldY][oldX]['insect'] : null,

                    // Test if there is an insect in the new position
                    exist = app.stageData[newY][newX]['insect'] || false;

                // If there is an insect in the current position
                if (exist) {

                    // if there is a bee selected
                    if (selection) {

                        // check if it`s a wasp and if it is log a message
                        if (exist.name === 'wasp' || exist.name === 'queen-wasp') {
                            app.consoleLog('You can not move a bee onto a wasp!', 'warning');
                        }
                        /*else {
                            app.consoleLog('Cell ' + newY + '/' + newX + ' is already occupied!', 'warning');
                            app.clearSelection();
                        }*/
                    } else {
                        // else display a mesage that wasps ca not be moved by the user
                        app.consoleLog('You can not move wasps!', 'warning');
                    }
                } else {
                    // Otherwise move the bee to the new position
                    if (selection) {
                        app.stageData[oldY][oldX]['insect'] = false;
                        app.stageData[newY][newX]['insect'] = insect;
                        app.render();

                        // after moving to the new position...
                        setTimeout(function () {
                            var attack = app.findSurroundingInsect('wasp', newY, newX);

                            // check if there is an enemy...
                            if (attack.length > 0) {
                                app.attackInsect(attack, app.stageData[newY][newX], true); // an attack
                            }
                        }, 0);
                    }
                }
            }
        },

        /**
         * Attack action method
         *
         * @param attack    Array   collection of insects which will be attacked
         * @param attacker  Object  attacker insect object
         * @param fightBack boolean is going to fight back?
         */
        attackInsect: function (attack, attacker, fightBack) {
            // attack all enemies around
            attack.forEach(function (cell) {
                // log the attack action
                var fightMsg = fightBack ? 'attacking' : 'fighting back';
                app.consoleLog('Insect "' + attacker.insect.name + '" is ' + fightMsg + ' "' + cell.insect.name + '"!');

                setTimeout(function () {
                    // highlight the attacked enemy(es)
                    var cellHtml = document.getElementById('cell_' + cell.id);
                    cellHtml.setAttribute('class', cellHtml.getAttribute('class') + ' attacked');

                    setTimeout(function () {
                        // calculate the damage
                        var damage = attacker.insect.attack * attacker.insect.luck - cell.insect.defense * cell.insect.luck,
                            roundDamage = app.roundUp(Math.abs(damage), 2),
                            attack = app.roundUp(roundDamage * 0.25, 2);

                        // set the damage
                        cell.insect['health'] -= roundDamage;
                        cell.insect['attack'] -= attack;

                        // log the damage
                        app.consoleLog('Insect ' + cell.insect.name + ' lost ' + roundDamage + ' points of health and ' + attack + ' points of attack skill.');

                        // then fight back
                        if (fightBack) {

                            // test if the enemy is ded...
                            if (cell.insect.health <= 0 || isNaN(cell.insect.health)) {

                                // ...and eliminate it from the stage
                                cell.insect = false;
                                app.render();

                                // check if the game is over
                                if(app.isOver()){
                                    // and if it is show the message
                                    app.showOver(app.isOver());
                                }
                            } else if (attacker.insect.health <= 0 || isNaN(attacker.insect.health)) {
                                // if the enemy is not ded, check if the bee did not died in the last fight,
                                // and if it did eliminate it from the stage
                                attacker.insect = false;
                                app.render();

                                // check if the game is over
                                if(app.isOver()){
                                    // and if it is show the message
                                    app.showOver(app.isOver());
                                }
                            } else {
                                // if nether the enemy or the bee is ded, it means that the wasp can fight back
                                app.attackInsect([attacker], cell, false);
                            }
                        }
                        // after fight clear the highlight
                        cellHtml.setAttribute('class', cellHtml.getAttribute('class').replace(' attacked', ''));
                    }, 1000);
                }, 100);
            });
            app.render();
        },

        /**
         * Test if game is over
         * @returns {*} int/boolean false if game is not over, 1 if wasps win, 2 if bees win
         */
        isOver: function() {
            var queenBees = document.getElementsByClassName('queen-bee'),
                queenWasps = document.getElementsByClassName('queen-wasp');

            if(queenBees.length === 0) {
                return 1;
            } else if (queenWasps.length === 0) {
                return 2;
            } else {
                return false;
            }
        },

        /**
         * Display end game message
         * @param over
         */
        showOver: function (over) {
            if (over === 2) {
                document.getElementById('win').style.display = 'block';
            } else {
                document.getElementById('lost').style.display = 'block';
            }
        },

        /**
         * Helper method for clearing insect selection
         */
        clearSelection: function () {
            var cells = [].slice.call(this.stage.getElementsByClassName('active'));
            cells.forEach(function (cell) {
                cell.classList.remove('active');
            });
        },

        /**
         * Get the selected bee
         * @returns {*}
         */
        getSelection: function () {
            var selection = [],
                cells = [].slice.call(this.stage.getElementsByClassName('active'));
            cells.forEach(function (cell) {
                selection.push(cell);
            });
            return selection[0];
        },

        /**
         * Helper function to log actions and messages in console
         * @param msg           message
         * @param className     message style class name
         */
        consoleLog: function (msg, className) {
            var logHtml = document.createElement('div'),
                msgHtml = document.createTextNode(this.getTime() + ' - ' + msg);
            logHtml.classList.add(className ? className : 'info');
            logHtml.appendChild(msgHtml);
            this.console.appendChild(logHtml);
            logHtml.scrollIntoView(false);
        },

        /**
         * Time Helper
         * @returns {string}
         */
        getTime: function () {
            var d = new Date(),
                h = this.addZero(d.getHours()),
                m = this.addZero(d.getMinutes()),
                s = this.addZero(d.getSeconds());
            return h + ':' + m + ':' + s;
        },

        /**
         * Add zero to time helper
         * @param i
         * @returns {*}
         */
        addZero: function (i) {
            if (i < 10) {
                i = '0' + i;
            }
            return i;
        },

        /**
         * Helper method to find if there are insects around the new move position
         * @param name
         * @param y
         * @param x
         * @returns {Array.<*>}
         */
        findSurroundingInsect: function (name, y, x) {
            var data = app.stageData,
                surroundingCells = [
                    data[y][x - 1] || false,
                    data[y][x + 1] || false
                ];

            if (app.stageData[y - 1]) {
                surroundingCells.push(data[y - 1][x] || false);
                surroundingCells.push(data[y - 1][x - 1] || false);
                surroundingCells.push(data[y - 1][x + 1] || false);
            }

            if (app.stageData[y + 1]) {
                surroundingCells.push(data[y + 1][x] || false);
                surroundingCells.push(data[y + 1][x - 1] || false);
                surroundingCells.push(data[y + 1][x + 1] || false);
            }

            return surroundingCells.filter(function (cell) {
                return cell && cell.insect ? cell.insect.name === name || cell.insect.name === 'queen-' + name : false;
            });
        },

        /**
         * Math helper to to shorten decimal places
         * @param num
         * @param precision
         * @returns {number}
         */
        roundUp: function (num, precision) {
            return Math.ceil(num * precision) / precision;
        }
    };

    return api;

})();