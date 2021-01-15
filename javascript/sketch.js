class Game {
    size = {};
    sidebar = {
        perc: 15,
        offset: {
            left: 2,
            right: 2,
        },
        el: {},
    };
    people = {
        size: 12,
        space: 1,
        lst: [],
    };
    score = [];
    rate = {
        strong: 0.039,
        weak: 0.013,
        travel: 0.003,
        protection: 0.2,
        begin: {
            protection: 80,
            quarantine: 220,
            vaccinate: 500,
        },
    };
    text = {
        header: 42,
        par: 24,
        margin: 20,
        textmargin: 8,
    }
    intro_ = {
        time: 500,
        counter: 0,
    }
    result_ = {
        time: 400,
        counter: 0,
    }
    load = {
        margin: 0,
        height: 3,
    }
    qzones = [];

    constructor(windowWidth, windowHeight) {
        this.state = 'intro';
        // general measures
        this.size.x = windowWidth / 100 * (100 - this.sidebar.perc);
        this.size.y = windowHeight;
        this.sidebar.size = windowWidth / 100 * this.sidebar.perc;
        this.sidebar.el.start = this.size.x + (windowWidth / 100 * this.sidebar.offset.left);
        this.sidebar.el.stop = windowWidth - (windowWidth / 100 * this.sidebar.offset.right);
        this.sidebar.el.size = this.sidebar.el.stop - this.sidebar.el.start;
        this.sidebar.el.center = this.sidebar.el.start + this.sidebar.el.size / 2;
        this.people.rows = floor(this.size.y / (this.people.size + this.people.space));
        this.people.cols = floor(this.size.x / (this.people.size + this.people.space));
        let offset_x = this.size.x / 100 * this.text.margin;
        let len_x = this.size.x - 2 * offset_x;
        let offset_y = this.size.y / 100 * this.text.margin;
        let len_y = this.size.x - 2 * offset_y;
        this.load.x1 = offset_x + len_x / 100 * this.load.margin;
        this.load.x2 = this.size.x - offset_x - len_x / 100 * this.load.margin;
        this.load.y1 = this.size.y - offset_y - len_y / 100 * this.load.margin - len_y / 100 * this.load.height;
        this.load.y2 = this.size.y - offset_y - len_y / 100 * this.load.margin;
        // control positions
        let ysize = this.size.y * 0.6;
        let offset = (ysize / 3) / 2;
        this.sidebar.el.protect = ysize / 3 - offset;
        this.sidebar.el.quarantine = (ysize / 3) * 2 - offset;
        this.sidebar.el.vaccinate = ysize - offset;
        this.sidebar.el.bsize = this.sidebar.el.size * 0.7;
        // init people
        let index = 0;
        for (let y = 0; y <= this.people.rows; y++) {
            for (let x = 0; x < this.people.cols; x++) {
                this.people.lst[index++] = new Person(
                    (x * (this.people.size + this.people.space)) + (this.people.size / 2) + (y % 2 == 0 ? 0 : this.people.size / 2),
                    (y * (this.people.size + this.people.space)) + (this.people.size / 2),
                    this.people.size, x, y);
            }
        }
        // init score
        this.people.num = index;
        for (let i = 0; i < 200; i++) {
            this.score[i] = [0, 0];
        }
        for (let i = 0; i < this.people.lst.length; i++) {
            this.people.lst[i].findNeighbours(this.people.lst, this.people.cols);
        }
    }

    draw() {
        background(colors.background);

        // game area
        this.people.lst.forEach(person => person.draw());

        // controls
        push();
        textAlign(CENTER);
        textSize(this.text.par);
        fill(colors.background);
        strokeWeight(2);
        stroke(colors['healthy']);
        circle(this.sidebar.el.center, this.sidebar.el.protect, this.sidebar.el.bsize);
        if (this.days > this.rate.begin.protection) {
            stroke(colors['healthy1']);
            strokeWeight(3);
            circle(this.sidebar.el.center, this.sidebar.el.protect, this.sidebar.el.bsize);
            stroke(colors['healthy2']);
            strokeWeight(5);
            circle(this.sidebar.el.center, this.sidebar.el.protect, this.sidebar.el.bsize);
            stroke(colors['healthy3']);
            strokeWeight(8);
            circle(this.sidebar.el.center, this.sidebar.el.protect, this.sidebar.el.bsize);
            stroke(colors['healthy4']);
            strokeWeight(13);
            circle(this.sidebar.el.center, this.sidebar.el.protect, this.sidebar.el.bsize);
            // fill circle depending on protection status
            if (this.protection) {
                stroke(colors['healthy']);
                strokeWeight(map(this.rate.protection, 0.2, 1.0, this.sidebar.el.bsize / 2, this.sidebar.el.bsize));
                circle(this.sidebar.el.center, this.sidebar.el.protect, 1);
            }
            strokeWeight(5);
            stroke(colors.background);
            fill(colors.text);
            text('Schutz', this.sidebar.el.center, this.sidebar.el.protect + this.sidebar.perc / 4);
        }

        fill(colors.background);
        strokeWeight(2);
        stroke(colors.quarantine);
        circle(this.sidebar.el.center, this.sidebar.el.quarantine, this.sidebar.el.bsize);
        if (this.days > this.rate.begin.quarantine) {
            stroke(colors.quarantine1);
            strokeWeight(3);
            circle(this.sidebar.el.center, this.sidebar.el.quarantine, this.sidebar.el.bsize);
            stroke(colors.quarantine2);
            strokeWeight(5);
            circle(this.sidebar.el.center, this.sidebar.el.quarantine, this.sidebar.el.bsize);
            stroke(colors.quarantine3);
            strokeWeight(8);
            circle(this.sidebar.el.center, this.sidebar.el.quarantine, this.sidebar.el.bsize);
            stroke(colors.quarantine4);
            strokeWeight(13);
            circle(this.sidebar.el.center, this.sidebar.el.quarantine, this.sidebar.el.bsize);
            strokeWeight(5);
            stroke(colors.background);
            fill(colors.text);
            text('Q', this.sidebar.el.center, this.sidebar.el.quarantine + this.sidebar.perc / 4);
        }

        fill(colors.background);
        strokeWeight(2);
        stroke(colors['-8']);
        circle(this.sidebar.el.center, this.sidebar.el.vaccinate, this.sidebar.el.bsize);
        if (this.days > this.rate.begin.vaccinate) {
            stroke(colors['-81']);
            strokeWeight(3);
            circle(this.sidebar.el.center, this.sidebar.el.vaccinate, this.sidebar.el.bsize);
            stroke(colors['-82']);
            strokeWeight(5);
            circle(this.sidebar.el.center, this.sidebar.el.vaccinate, this.sidebar.el.bsize);
            stroke(colors['-83']);
            strokeWeight(8);
            circle(this.sidebar.el.center, this.sidebar.el.vaccinate, this.sidebar.el.bsize);
            stroke(colors['-84']);
            strokeWeight(13);
            circle(this.sidebar.el.center, this.sidebar.el.vaccinate, this.sidebar.el.bsize);
            strokeWeight(5);
            stroke(colors.background);
            fill(colors.text);
            text('Impfen', this.sidebar.el.center, this.sidebar.el.vaccinate + this.sidebar.perc / 4);
        }
        pop();

        // score board
        let bad = 0;
        let infected = 0;
        for (let i = 0; i < this.people.lst.length; i++) {
            let person = this.people.lst[i];
            if (person.days > 6 && person.days < 16)
                infected++;
            if (person.days == -9)
                bad++;
        }
        let size = this.size.y * 0.4;
        let offset = size * 0.1;
        let start = this.size.y - size + offset;
        push();
        fill(colors['healthy']);
        noStroke();
        rectMode(CORNERS);
        rect(this.sidebar.el.start, start, this.sidebar.el.stop, this.size.y);
        this.score.splice(0, 1);
        this.score.push([bad, infected]);
        for (let i = 0; i < this.score.length; i++) {
            let x = map(i, 0, this.score.length, this.sidebar.el.start, this.sidebar.el.stop);
            let y0 = map(this.score[i][0], 0, this.people.lst.length, start, this.size.y);
            let y1 = map(this.score[i][1], 0, this.people.lst.length, this.size.y, start);
            strokeWeight(1);
            stroke(colors['-9']);
            line(x, start, x, y0);
            stroke(colors['6']);
            line(x, this.size.y, x, y1);
        }
        pop();
    }

    dialog(header, par, legend) {
        let offset_x = this.size.x / 100 * this.text.margin;
        let offset_y = this.size.y / 100 * this.text.margin;
        let len_x = (this.size.x - 2 * offset_x) / 100 * (100 - 2 * this.text.textmargin);
        let len_y = this.size.y - 2 * offset_y;
        push();
        fill(colors.background);
        rectMode(CORNERS);
        rect(offset_x, offset_y, this.size.x - offset_x, this.size.y - offset_y);
        textAlign(CENTER);
        textSize(this.text.header);
        stroke(colors.background);
        fill(colors.text);
        text(header, this.size.x / 2, offset_y + len_y / 100 * this.text.textmargin + this.text.header);
        textAlign(LEFT);
        textSize(this.text.par);
        text(par, offset_x + len_x / 100 * this.text.textmargin, offset_y + len_y / 100 * (this.text.textmargin + 20), len_x, len_y)
        if (legend) {
            fill(colors.healthy);
            circle(offset_x + len_x / 100 * this.text.textmargin + this.text.par / 2, offset_y + len_y / 100 * (this.text.textmargin + 50), this.text.par);
            fill(colors.text);
            text('symptomfrei', offset_x + len_x / 100 * this.text.textmargin + 15 + this.text.par / 2, offset_y + len_y / 100 * (this.text.textmargin + 52));
            fill(colors['6']);
            circle(offset_x + len_x / 100 * this.text.textmargin + this.text.par / 2, offset_y + len_y / 100 * (this.text.textmargin + 60), this.text.par);
            fill(colors.text);
            text('krank', offset_x + len_x / 100 * this.text.textmargin + 15 + this.text.par / 2, offset_y + len_y / 100 * (this.text.textmargin + 62));
            fill(colors['-9']);
            circle(offset_x + len_x / 100 * this.text.textmargin + this.text.par / 2, offset_y + len_y / 100 * (this.text.textmargin + 70), this.text.par);
            fill(colors.text);
            text('immun', offset_x + len_x / 100 * this.text.textmargin + 15 + this.text.par / 2, offset_y + len_y / 100 * (this.text.textmargin + 72));
            fill(colors['-8']);
            circle(offset_x + len_x / 100 * this.text.textmargin + this.text.par / 2, offset_y + len_y / 100 * (this.text.textmargin + 80), this.text.par);
            fill(colors.text);
            text('geimpft', offset_x + len_x / 100 * this.text.textmargin + 15 + this.text.par / 2, offset_y + len_y / 100 * (this.text.textmargin + 82));
        }
        pop();
    }

    loadbar(current, max, txt) {
        let edge = 4
        let percent = map(current, 0, max, this.load.x1 + edge, this.load.x2 - edge);
        push();
        strokeWeight(2);
        stroke(colors.text);
        fill(colors.background);
        rectMode(CORNERS);
        rect(this.load.x1, this.load.y1, this.load.x2, this.load.y2);
        strokeWeight(1);
        fill(colors.text);
        rect(this.load.x1 + edge, this.load.y1 + edge, percent, this.load.y2 - edge);
        stroke(colors.background);
        strokeWeight(2);
        textAlign(CENTER);
        textSize(this.text.par);
        text(txt, (this.load.x2 - this.load.x1) / 2 + this.load.x1, this.load.y1 + this.text.par);
        pop();
    }

    initPlay() {
        this.rate.begin.quarantine = 220;
        this.people.lst.forEach(person => person.days = -1);
        this.people.lst.forEach(person => person.quarantined = false);
        for (let i = 0; i < 200; i++) {
            this.score[i] = [0, 0];
        }
        // first infection
        let p0 = this.people.lst[floor(Math.random() * this.people.lst.length)];
        p0.days = 4;
        let p1 = [];
        p0.neighbours.forEach(i => p1.push(this.people.lst[i].neighbours));
        p1 = p1.flat().filter(onlyUnique);
        p1.filter(i => !p0.neighbours.includes(i)).forEach(i => this.people.lst[i].days = floor(Math.random() * 8));
        this.days = 0;
        this.virulent = true;
        this.vaccinate = false;
        this.protection = false;
    }

    intro() {
        push();
        this.draw();
        fill(colors.background);
        rectMode(CORNERS);
        rect(0, 0, 170, 50);
        textSize(this.text.header);
        stroke(colors.background);
        fill(colors.text);
        textAlign(LEFT);
        textSize(this.text.header);
        text('Vollbild', 10, 40);
        pop();

        push();
        let timeunit = this.intro_.time / 11;
        let h = '';
        let t = '';
        let legend = false;
        this.days = 0;
        if (this.intro_.counter >= 0 * timeunit) {
            t = 'Dieses Spiel ist keine Modellierung einer realen Pandemie. Die Wirklichkeit ist viel komplizierter.';
        }
        if (this.intro_.counter >= 1 * timeunit) {
            h = 'Spielidee';
            t = 'Die kleinen Kreise können sich gegenseitig anstecken. An ihrer Farbe erkennt man, wie es ihnen geht:';
            if (this.intro_.counter < 3 * timeunit)
                legend = true;
        }
        if (this.intro_.counter >= 3 * timeunit) {
            h = 'Spielidee';
            t = 'Bekämpfe die Pandemie durch Schutzmaßnahmen, Quarantäne und Impfung!';
        }
        if (this.intro_.counter >= 4 * timeunit) {
            h = 'Schutz';
            t = 'Ein Klick auf das Schutzsymbol (oben rechts) bewirkt, dass einige Kreise sich besser schützen. Man erkennt sie an ihrer hellgrauen Farbe. Erneutes Klicken erhöht die Anzahl, senkt zugleich aber die allgemeine Vorsicht.';
            this.days = this.rate.begin.protection + 1;
        }
        if (this.intro_.counter >= 6 * timeunit) {
            h = 'Quarantäne';
            t = 'Sobald das gelbe Q erscheint, kann man durch Klicks auf das Spielfeld Quarantänezonen einrichten. Bis zu vier Quarantänezonen sind gleichzeitig möglich.';
            this.days = this.rate.begin.quarantine + 1;
        }
        if (this.intro_.counter >= 8 * timeunit) {
            h = 'Impfen';
            t = 'Ein Klick auf das Impfsymbol startet die Impfkampagne.';
            this.days = this.rate.begin.vaccinate + 1;
        }
        if (this.intro_.counter >= 9 * timeunit) {
            h = 'Spielziel';
            t = 'Je weniger Kreise zum Ende der Pandemie grün sind, desto besser. Denn die grünen Kreise stehen für schwere Krankheitsverläufe.';
        }
        if (this.intro_.counter >= 10 * timeunit) {
            h = 'Los geht\'s!';
            t = 'Zunächst entwickelt sich die Pandemie ungestört. Man muss etwas warten, bevor man sie bekämpfen kann.';
        }
        this.dialog(h, t, legend);
        this.loadbar(this.intro_.counter, this.intro_.time, 'Berühren, um zu starten');
        this.intro_.counter++;
        if (this.intro_.counter == this.intro_.time) {
            this.state = 'intro';
            this.intro_.counter = 0;
        }
    }

    play() {
        this.draw();
        if (frameCount % 1 == 0) {
            if (!this.virulent) {
                this.state = 'result';
                this.draw();
                let t = 'Nach ' + this.days + ' Tagen ist diese Pandemie nun erloschen.'
                if (this.days < this.rate.begin.quarantine) {
                    t += ' Glück gehabt! Gelegentlich versiegt eine Infektionskette durch Zufall.';
                } else {
                    let rate = floor(this.people.lst.filter(person => person.days == -9).length * 100 / this.people.lst.length);
                    t += ' ' + rate + '% der Kreise hatten einen schweren Infektionsverlauf.';
                    if (rate < 20)
                        t += ' Das ist ein ausgezeichnetes Ergebnis.';
                    else if (rate < 32)
                        t += ' Gut! Etwa halb so schlimm wie ohne Maßnahmen.';
                    else if (rate < 47)
                        t += ' Kein gutes Ergebnis. Die Maßnahmen reichten nicht aus!';
                    else
                        t += ' Schlimm! Ein schlechtes Krisenmanagement!';
                }
                this.dialog('Bewertung', t);
            } else {
                // end game when no one is virulent
                this.virulent = this.people.lst.filter(person => person.days > -1).length > 0;
                // infected may infect neighbours
                for (let i = 0; i < this.people.lst.length; i++) {
                    this.people.lst[i].infect(this.people.lst, this.rate);
                }
                // vaccinate one random person
                if (this.days > this.rate.begin.vaccinate && this.vaccinate)
                    this.people.lst[floor(Math.random() * this.people.lst.length)].vaccinate();
                // people put masks on and off
                if (this.protection) {
                    for (let i = 0; i < 8; i++) {
                        let p = this.people.lst[floor(Math.random() * this.people.lst.length)];
                        if (p.days == -1 && Math.random() <= this.rate.protection)
                            p.days = -2;
                        else if (p.days == -2)
                            p.days = -1;
                    }
                }
                this.days++;
            }
        }
    }

    result() {
        this.loadbar(this.result_.counter, this.result_.time, '');
        this.result_.counter++;
        if (this.result_.counter == this.result_.time) {
            this.state = 'intro';
            this.result_.counter = 0;
        }
    }
}


class Person {
    constructor(x, y, size, row, col) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.row = row;
        this.col = col;
        this.days = -1;
        this.infections = 0;
        this.quarantined = false;
    }

    findNeighbours(people, cols) {
        let n = [];
        let he = this;
        people.forEach(function(she) {
            if ((dist(she.x, she.y, he.x, he.y) < (he.size * 1.3)) && (she != he))
                n.push(she.col * cols + she.row);
        });
        this.neighbours = n;
    }

    vaccinate() {
        this.days = -8;
    }

    draw() {
        if (this.quarantined) {
            strokeWeight(1);
            stroke(colors.quarantine);
        } else {
            noStroke();
        }
        fill(colors[this.days]);
        circle(this.x, this.y, this.size);
    }

    infectPerson(other) {
        if (this.quarantined == other.quarantined) {
            if ((other.days == -1) || ((other.days == -2) && (Math.random() < 0.5))) {
                if ((other.row < this.row) || ((other.row == this.row) && (other.col < this.col)))
                    other.days = 0;
                else
                    other.days = 1;
            }
        }
    }

    infect(people, rate) {
        // next day
        if (this.days >= 0 && this.days < 30) {
            this.days++;
        }
        else if (this.days == 30) {
            this.infections++;
            if (this.infections >= 3)
                this.days = -9;
            else
                this.days = -1;
        }
        // infect
        if (this.days >= 4 && this.days < 16) {
            let r = rate.strong;
            if (this.days >= 13 && this.days < 16)
                r = rate.weak;
            // neighbours
            for (let i = 0; i < this.neighbours.length; i++) {
                if (Math.random() < r)
                    this.infectPerson(people[this.neighbours[i]]);
            }
            // travel
            if (this.days >= 4 && this.days < 7 && Math.random() < rate.travel) {
                this.infectPerson(people[floor(Math.random() * people.length)]);
                if (rate.protection > 0.6 && Math.random() < 0.5) {
                    this.infectPerson(people[floor(Math.random() * people.length)]);
                }
            }
        }
    }
}


var colors;
var game;

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function setup() {
    var handler = {
        get: function(target, name) {
            return target.hasOwnProperty(name) ? target[name] : color(60,60,60);
        }
    };
    colors = new Proxy({
        text: color(255),
        background: color(0),
        quarantine: color(255,255,0),
        quarantine1: color(255,255,25,200),
        quarantine2: color(255,255,50,150),
        quarantine3: color(255,255,75,100),
        quarantine4: color(255,255,100,50),
        'healthy1': color(85,85,85,200),
        'healthy2': color(110,110,110,150),
        'healthy3': color(135,135,135,100),
        'healthy4': color(170,170,170,50),
        '-9': color(24,100,0),      // dauerhaft immun
        '-8': color(0,0,200),       // geimpft, deshalb immun
        '-81': color(10,10,255,200),
        '-82': color(20,20,255,150),
        '-83': color(40,40,255,100),
        '-84': color(70,70,255,50),
        '-2': color(100,100,100),   // Mundschutz
        '6': color(255,0,0),        // ansteckend (Tage 4-5 ohne Farbe!)
        '7': color(255,0,0),        // ansteckend (Tage 4-5 ohne Farbe!)
        '8': color(255,0,0),        // ansteckend (Tage 4-5 ohne Farbe!)
        '9': color(255,0,0),        // ansteckend (Tage 4-5 ohne Farbe!)
        '10': color(255,25,25),     // ansteckend
        '11': color(255,50,50),     // ansteckend
        '12': color(255,75,75),     // ansteckend
        '13': color(255,100,100),   // schwach ansteckend
        '14': color(255,100,100),   // schwach ansteckend
        '15': color(200,150,100),   // schwach ansteckend
        '16': color(0,200,0),       // vorübergehend immun 16-30
        '17': color(0,200,0),
        '18': color(0,180,0),
        '19': color(0,180,0),
        '20': color(0,160,0),
        '21': color(0,160,0),
        '22': color(0,140,0),
        '23': color(0,140,0),
        '24': color(0,120,0),
        '25': color(0,120,0),
        '26': color(0,100,0),
        '27': color(0,100,0),
        '28': color(0,80,0),
        '29': color(0,80,0),
        '30': color(0,60,0),
    }, handler);
    game = new Game(windowWidth, windowHeight);
    createCanvas(windowWidth, windowHeight);
}

function draw() {
    switch (game.state) {
        case 'intro':
            game.intro();
            break;
        case 'play':
            game.play();
            break;
        case 'result':
            game.result();
            break;
        default:
    }
}

function windowResized() {
    setup(); // restart the game when the window size changes
}

function mousePressed() {
    switch (game.state) {
        case 'intro':
            if (mouseX < 170 && mouseY < 50) {
                // fullscreen button
                let fs = fullscreen();
                fullscreen(!fs);
            } else {
                // start the game
                game.intro_.counter = 0;
                game.state = 'play';
                game.initPlay();
            }
            break;
        case 'play':
            if (dist(mouseX, mouseY, game.sidebar.el.center, game.sidebar.el.protect) < (game.sidebar.el.bsize / 2)) {
                if ((game.rate.begin.protection < game.days) && !game.protection) {
                    game.protection = true;
                } else if (game.protection) {
                    game.rate.protection = 0.3 + 0.7 * game.rate.protection;
                    if (game.rate.begin.quarantine > game.days)
                        console.log(game.rate.protection, game.rate.begin.quarantine, game.days); // TODO investigate
                        game.rate.begin.quarantine += 20;
                }
            } else if (game.size.x > mouseX && game.size.y > mouseY) {
                if (game.rate.begin.quarantine < game.days) {
                    // find closest person to click
                    let pr = 0;
                    let pc = 0;
                    let d = 1000;
                    game.people.lst.forEach(function(person) {
                        if (dist(person.x, person.y, mouseX, mouseY) <= d) {
                            pc = person.row;
                            pr = person.col;
                            d = dist(person.x, person.y, mouseX, mouseY);
                        }
                    });
                    // put people in quarantine
                    let q = [];
                    game.people.lst.forEach(function(person) {
                        if (dist(person.col, person.row, pr, pc) < 4) {
                            q.push(person.col * game.people.cols + person.row);
                        }
                    });
                    if (game.qzones.length > 3) {
                        let q_old = game.qzones.splice(0, 1).flat();
                        q_old.forEach(i => game.people.lst[i].quarantined = false);
                        game.qzones.push(q);
                    } else {
                        game.qzones.push(q);
                    }
                    q.forEach(i => game.people.lst[i].quarantined = true);
                }
            } else if (dist(mouseX, mouseY, game.sidebar.el.center, game.sidebar.el.vaccinate) < (game.sidebar.el.bsize / 2)) {
                if (game.rate.begin.vaccinate < game.days) {
                    game.vaccinate = true;
                }
            }
            break;
        case 'result':
            break;
        default:
    }
}
