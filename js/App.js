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
            this.stageData = this.createStage(this.stageY, this.stageX);

            this.addInsects(this.stageData, this.bees, 'bee');

            this.reversStage(this.stageData);

            this.addInsects(this.stageData, this.wasps, 'wasp');

            this.reversStage(this.stageData);
        },

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

        reversStage: function (arr) {
            arr.reverse();
            for (var y in arr) {
                arr[y] = arr[y].reverse();
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

        getTime: function () {
            var d = new Date(),
                h = this.addZero(d.getHours()),
                m = this.addZero(d.getMinutes()),
                s = this.addZero(d.getSeconds());
            return h + ":" + m + ":" + s;
        },

        addZero: function (i) {
            if (i < 10) {
                i = "0" + i;
            }
            return i;
        }
    };

    return api;

})();