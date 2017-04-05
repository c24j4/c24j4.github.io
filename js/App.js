var app = (function () {

    var api = {

        stageY: 5,
        stageX: 5,

        stageData: [],
        stage: null,

        bees: 4,
        wasps: 4,

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

        initData: function () {
            var countBees = 0,
                countWasps = 0;
            for (var y = 0; y < this.stageY; y++) {
                var row = [];

                for (var x = 0; x < this.stageX; x++) {
                    var queen = (y === 0 && x === 0) || (y === this.stageY - 1 && x === this.stageX - 1),
                        // splitBeesByRow = this.bees < this.stageX*2 ? this.bees / 2 : this.bees;
                        bee = y * this.stageX + x < this.bees,
                        // bee = countBees < this.bees ? (x+1)*(y+1) <= this.bees*0.6 : false,
                        wasp = y * this.stageX + x + 1 > this.stageY * this.stageX - this.wasps,
                        cell = {
                            insect: !queen && !bee && !wasp ? null : Insect.create({
                                name: (queen ? 'queen-' : '') + (bee ? 'bee' : '') + (wasp ? 'wasp' : ''),
                                defense: queen ? 50 : 30,
                                attack: queen ? 50 : 30
                            })
                        };

                        // console.debug((x+1)*(y+1) <= this.bees *0.6);

                    if (cell.insect !== null) {
                        cell.insect.setLuck();
                    }

                    if (cell.insect !== null && (cell.insect.name === 'bee' || cell.insect.name === 'queen-bee')) {
                        countBees++;
                    }

                    row.push(cell);
                }

                this.stageData.push(row);
            }
        },

        startGame: function () {
            app.start.style.display = 'none';
            app.header.style.display = 'block';
            app.content.style.display = 'block';
        },

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

        makeMove: function () {
            if (this.classList.contains('bee') || this.classList.contains('queen-bee')) {
                if (this.classList.contains('active')) {
                    this.classList.toggle('active');
                } else {
                    app.clearSelection();
                    this.classList.toggle('active');
                }
            } else {
                var selection = app.getSelection(),
                    oldX = selection ? parseInt(selection.dataset.x) - 1 : null,
                    oldY = selection ? parseInt(selection.dataset.y) - 1 : null,
                    newX = parseInt(this.dataset.x) - 1,
                    newY = parseInt(this.dataset.y) - 1,
                    insect = selection ? app.stageData[oldY][oldX]['insect'] : null,
                    exist = app.stageData[newY][newX]['insect'];
                if (exist !== null) {
                    app.consoleLog('Cell ' + newY + '/' + newX + ' is already occupied!', true);
                    app.clearSelection();
                } else {
                    if (selection) {
                        app.stageData[oldY][oldX]['insect'] = null;
                        app.stageData[newY][newX]['insect'] = insect;
                        app.render();
                    }
                }
            }
        },

        clearSelection: function () {
            var cells = [].slice.call(this.stage.getElementsByClassName('active'));
            cells.forEach(function (cell) {
                cell.classList.remove('active');
            });
        },

        getSelection: function () {
            var selection = [],
                cells = [].slice.call(this.stage.getElementsByClassName('active'));
            cells.forEach(function (cell) {
                selection.push(cell);
            });
            return selection[0];
        },

        consoleLog: function (msg, warning) {
            var errorHtml = document.createElement('div'),
                msgHtml = document.createTextNode(this.getTime() + ' - ' + msg);
            if (warning) {
                errorHtml.classList.add('warning');
            }
            errorHtml.appendChild(msgHtml);
            this.console.appendChild(errorHtml);
            errorHtml.scrollIntoView(false);
        },

        addZero: function (i) {
            if (i < 10) {
                i = "0" + i;
            }
            return i;
        },

        getTime: function () {
            var d = new Date(),
                h = this.addZero(d.getHours()),
                m = this.addZero(d.getMinutes()),
                s = this.addZero(d.getSeconds());
            return h + ":" + m + ":" + s;
        }
    };

    return api;

})();