class Game {
    size = {};
    sidebar = {
        perc: 12,
        offset: {
            left: 2,
            right: 1,
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
        margin: 10,
        textmargin: 8,
    }
    intro_ = {
        time: 9,
        counter: 0,
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
            text('Schutz', this.sidebar.el.center, this.sidebar.el.protect + this.sidebar.perc / 1.2);
        }

        fill(colors.background);
        strokeWeight(2);
        stroke(colors.quarantine);
        circle(this.sidebar.el.center, this.sidebar.el.quarantine, this.sidebar.el.bsize);
        if (this.days > this.rate.begin.quarantine) {
            textSize(this.text.header);
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
            text('Q', this.sidebar.el.center, this.sidebar.el.quarantine + this.sidebar.perc);
        }

        textSize(this.text.par);
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
            // fill circle depending on vacc status
            if (this.vaccinate) {
                stroke(colors['-83']);
                strokeWeight(this.sidebar.el.bsize);
                circle(this.sidebar.el.center, this.sidebar.el.vaccinate, 1);
            }
            strokeWeight(5);
            stroke(colors.background);
            fill(colors.text);
            text('Impfen', this.sidebar.el.center, this.sidebar.el.vaccinate + this.sidebar.perc / 1.2);
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

    dialog(header, par, legend, b1, b2) {
        let start_x = this.size.x / 100 * this.text.margin;
        let start_y = this.size.y / 100 * this.text.margin;
        let stop_x = this.size.x / 100 * (100 - this.text.margin);
        let stop_y = this.size.y / 100 * (100 - this.text.margin);
        let len_x = stop_x - start_x;
        let len_y = stop_y - start_y;
        let start_x_o = start_x + (len_x / 100 * this.text.textmargin);
        let start_y_o = start_y + (len_y / 100 * this.text.textmargin);
        let step_x = (stop_x - (len_x / 100 * this.text.textmargin) - start_x_o) / 10;
        let step_y = (stop_y - (len_y / 100 * this.text.textmargin) - start_y_o) / 10;

        push();
        stroke(colors.text_background);
        fill(colors.text_background);
        rectMode(CORNERS);
        rect(start_x, start_y, stop_x, stop_y);
        textAlign(CENTER);
        textSize(this.text.header);
        fill(colors.text);
        text(header, start_x_o + 5 * step_x, start_y_o + 1 * step_y);
        textSize(this.text.par);
        if (b1 != '') {
            strokeWeight(5);
            stroke(colors.background);
            fill(colors.default_color);
            rect(start_x, stop_y, stop_x - len_x / 2, stop_y - this.text.header * 1.5);
            stroke(colors.text_background);
            fill(colors.text);
            text(b1, start_x + (len_x / 2) / 2, stop_y - this.text.header / 2);
            this.b1_start_x = start_x;
            this.b1_start_y = stop_y - this.text.header * 1.5;
            this.b1_stop_x = start_x + len_x / 2;
            this.b1_stop_y = stop_y;
        }
        if (b2 != '') {
            strokeWeight(5);
            stroke(colors.background);
            fill(colors.default_color);
            rect(start_x + len_x / 2, stop_y, stop_x, stop_y - this.text.header * 1.5);
            stroke(colors.text_background);
            fill(colors.text);
            text(b2, start_x + len_x / 2 + (len_x / 2) / 2, stop_y - this.text.header / 2);
            this.b2_start_x = start_x + len_x / 2;
            this.b2_start_y = stop_y - this.text.header * 1.5;
            this.b2_stop_x = stop_x;
            this.b2_stop_y = stop_y;
        }
        textAlign(LEFT);
        text(par, start_x_o, start_y_o + 2 * step_y, 10 * step_x, 8 * step_y);
        if (legend) {
            fill(colors.healthy);
            circle(start_x_o + 1 * step_x, start_y_o + 7 * step_y, 2 * this.text.par);
            fill(colors['6']);
            circle(start_x_o + 8 * step_x, start_y_o + 7 * step_y, 2 * this.text.par);
            fill(colors['-9']);
            circle(start_x_o + 1 * step_x, start_y_o + 8 * step_y, 2 * this.text.par);
            fill(colors['-8']);
            circle(start_x_o + 8 * step_x, start_y_o + 8 * step_y, 2 * this.text.par);
            fill(colors.text);
            text('gesund', start_x_o + 1.1 * step_x + this.text.par, start_y_o + 7 * step_y + this.text.par / 2);
            text('krank', start_x_o + 8.1 * step_x + this.text.par, start_y_o + 7 * step_y + this.text.par / 2);
            text('immun nach schwerer Erkrankung', start_x_o + 1.1 * step_x + this.text.par, start_y_o + 8 * step_y + this.text.par / 2);
            text('geimpft', start_x_o + 8.1 * step_x + this.text.par, start_y_o + 8 * step_y + this.text.par / 2);
        }
        if (this.intro_.counter == 0) { // bild
            push();
            textAlign(CENTER);
            textSize(this.text.header * 2);
            fill(colors.text);
            text('Quarantäne', start_x_o + 5 * step_x, start_y_o + 4 * step_y);
            textSize(this.text.par);
            textAlign(LEFT);
            let aspect_ratio = img.height / img.width;
            image(img, start_x + 0.2 * step_x, start_y + 0.2 * step_y, 3 * step_x, 3 * step_x * aspect_ratio); // seitenverhaeltnis
            strokeWeight(5);
            stroke(colors.background);
            fill(colors.default_color);
            rect(start_x, stop_y - (this.text.header * 1.5), stop_x, (stop_y - this.text.header * 3));
            stroke(colors.text_background);
            fill(colors.text);
            text('Mehr dazu', start_x + len_x / 2.2, stop_y - this.text.header * 2);
            this.b3_start_x = start_x;
            this.b3_start_y = stop_y - this.text.header * 3;
            this.b3_stop_x = stop_x;
            this.b3_stop_y = stop_y - this.text.header * 1.5;
            pop();
        }
        if (this.intro_.counter == 3) {
            push();
            textAlign(CENTER);
            fill(colors.background);
            stroke(colors['healthy1']);
            strokeWeight(3);
            circle(start_x + 4 * step_x, start_y + 8 * step_y, this.sidebar.el.bsize);
            strokeWeight(5);
            stroke(colors.background);
            fill(colors.text);
            text('Schutz', start_x + 4 * step_x, start_y + 8 * step_y + this.sidebar.perc / 1.2);
            pop();
            push();
            textAlign(CENTER);
            fill(colors.background);
            stroke(colors.quarantine1);
            strokeWeight(3);
            circle(start_x + 6 * step_x, start_y + 8 * step_y, this.sidebar.el.bsize);
            strokeWeight(5);
            stroke(colors.background);
            fill(colors.text);
            textSize(this.text.header);
            text('Q', start_x + 6 * step_x, start_y + 8 * step_y + this.sidebar.perc);
            pop();
            push();
            textAlign(CENTER);
            fill(colors.background);
            stroke(colors['-81']);
            strokeWeight(3);
            circle(start_x + 8 * step_x, start_y + 8 * step_y, this.sidebar.el.bsize);
            strokeWeight(5);
            stroke(colors.background);
            fill(colors.text);
            text('Impfen', start_x + 8 * step_x, start_y + 8 * step_y + this.sidebar.perc / 1.2);
            pop();
        }
        if (this.intro_.counter == 4) {
            push();
            textAlign(CENTER);
            fill(colors.background);
            stroke(colors['healthy1']);
            strokeWeight(3);
            circle(start_x + 6 * step_x, start_y + 8 * step_y, this.sidebar.el.bsize);
            strokeWeight(5);
            stroke(colors.background);
            fill(colors.text);
            text('Schutz', start_x + 6 * step_x, start_y + 8 * step_y + this.sidebar.perc / 1.2);
            pop();
        }
        if (this.intro_.counter == 5) {
            push();
            textAlign(CENTER);
            fill(colors.background);
            stroke(colors.quarantine1);
            strokeWeight(3);
            circle(start_x + 6 * step_x, start_y + 8 * step_y, this.sidebar.el.bsize);
            strokeWeight(5);
            stroke(colors.background);
            fill(colors.text);
            textSize(this.text.header);
            text('Q', start_x + 6 * step_x, start_y + 8 * step_y + this.sidebar.perc);
            pop();
        }
        if (this.intro_.counter == 6) {
            push();
            textAlign(CENTER);
            fill(colors.background);
            stroke(colors['-81']);
            strokeWeight(3);
            circle(start_x + 6 * step_x, start_y + 8 * step_y, this.sidebar.el.bsize);
            strokeWeight(5);
            stroke(colors.background);
            fill(colors.text);
            text('Impfen', start_x + 6 * step_x, start_y + 8 * step_y + this.sidebar.perc / 1.2);
            pop();
        }
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
        this.draw();

        let h = '';
        let t = '';
        let b1 = 'Weiter';
        let b2 = 'Spiel Starten';
        let legend = false;
        this.days = 0;
        if (this.intro_.counter == -1) {
            h = 'Impressum';
            t = 'QUARANTÄNE\n\nSpielidee: Prof. Dr. Bernhard Ganter\nProgrammierung: Tim Häring / Bernhard Ganter\nVersion 1.0, 2021\n\nErlebnisland Mathematik\nEine Kooperation der Fakultät Mathematik der TU Dresden\nund der Technischen Sammlungen Dresden\nJunghansstr. 1-3\n01277 Dresden';
            b1 = 'Zum Spiel';
            b2 = '';
        }
        if (this.intro_.counter == 0) {
            // TODO bild
            b1 = 'Zum Spiel';
            b2 = 'Impressum';
        }
        if (this.intro_.counter == 1) {
            b1 = 'Zur Spielanleitung';
            t = 'Dieses Spiel ist keine Modellierung einer realen Pandemie. Dazu müssten auf dem Spielfeld nicht nur ein paar tausend, sondern viele Millionen Spielpunkte dargestellt werden. Um ein Spielerlebnis zu ermöglichen und die Wirkung verschiedener Maßnahmen zum Infektionsschutz deutlich zu machen, unterscheiden sich auch die Zahlenangaben im Spiel von der Wirklichkeit. So liegt der Anteil der „schwer Erkrankten“ am Ende des Spiels fast immer um ein Vielfaches über den Verhältnissen bei einer realen Pandemie. Ein Anteil der schweren Infektionen von 20% wäre in der Wirklichkeit eine Katastrophe, ist im Spiel aber ein gutes Ergebnis. Damit das Spiel nicht zu schnell endet, müssen die einzelnen Punkte außerdem viermal von einer Infektion genesen, bevor sie dauerhaft immun sind. Auch die in Tagen angegebene Dauer des Spiels hat nichts mit dem realen Verlauf einer Pandemie zu tun. Die Wirklichkeit ist viel komplizierter als das Spiel.';
        }
        if (this.intro_.counter == 2) {
            h = 'Spielidee';
            t = 'Die kleinen Kreise können sich gegenseitig anstecken. An ihrer Farbe erkennst du, wie es ihnen geht:';
            legend = true;
        }
        if (this.intro_.counter == 3) {
            h = 'Spielidee';
            t = 'Bekämpfe die Pandemie, indem du Schutzmaßnahmen ergreifst, Gruppen von Punkten unter Quarantäne stellst und ein Impfprogramm startest.';
        }
        if (this.intro_.counter == 4) {
            h = 'Schutz';
            t = 'Wenn du auf das graue Schutzsymbol klickst, werden einige der grauen Punkte heller. Sie sind besser geschützt und stecken sich weniger leicht an. Je häufiger du klickst, desto mehr Punkte sind geschützt. Gleichzeitig sinkt aber die allgemeine Vorsicht.';
            this.days = this.rate.begin.protection + 1;
        }
        if (this.intro_.counter == 5) {
            h = 'Quarantäne';
            t = 'Sobald im gelben Kreis das Q erscheint, kannst du durch Klicken auf das Spielfeld Quarantänezonen einrichten. Bis zu 4 Quarantänezonen gleichzeitig sind möglich.';
            this.days = this.rate.begin.quarantine + 1;
        }
        if (this.intro_.counter == 6) {
            h = 'Impfen';
            t = 'Mit einem Klick auf das blaue Impfsymbol startest du die Impfkampagne.';
            this.days = this.rate.begin.vaccinate + 1;
        }
        if (this.intro_.counter == 7) {
            h = 'Spielziel';
            t = 'Sobald es keine ansteckenden (roten) Punkte mehr gibt, kommt die Pandemie zum Stillstand. Wichtiger als die Dauer der Pandemie ist die Zahl der schwer Erkrankten. Im Spiel ist es desto besser, je weniger Punkte am Ende grün sind. Denn die grünen Punkte stehen für schwere Krankheitsverläufe.';
        }
        if (this.intro_.counter == 8) {
            h = 'Los geht\'s!';
            t = 'Los geht’s! Zunächst entwickelt sich die Pandemie ungestört. Nach einiger Zeit kannst du beginnen, ihre Ausbreitung zu bekämpfen.';
            b1 = 'Anleitung neu starten';
        }
        this.dialog(h, t, legend, b1, b2);
        if (this.intro_.counter == this.intro_.time) {
            this.state = 'intro';
            this.intro_.counter = 0;
        }
    }

    play() {
        this.draw();
        if (!this.virulent) {
            this.intro_.counter = 1;
            this.state = 'result';
            let t = 'Nach ' + this.days + ' Tagen ist diese Pandemie nun erloschen.'
            if (this.days < this.rate.begin.quarantine) {
                t += '\n\nGlück gehabt! Gelegentlich versiegt eine Infektionskette durch Zufall.';
            } else {
                let rate = floor(this.people.lst.filter(person => person.days == -9).length * 100 / this.people.lst.length);
                t += ' ' + rate + '% der Kreise hatten einen schweren Infektionsverlauf.\n\n';
                if (rate < 20)
                    t += 'Das ist ein ausgezeichnetes Ergebnis.';
                else if (rate < 32)
                    t += 'Gut! Etwa halb so schlimm wie ohne Maßnahmen.';
                else if (rate < 47)
                    t += 'Kein gutes Ergebnis. Die Maßnahmen reichten nicht aus!';
                else
                    t += 'Schlimm! Ein schlechtes Krisenmanagement!';
            }
            this.dialog('Bewertung', t, false, 'Anleitung', 'Neu Starten');
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

    result() {
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
var img;

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
        text_background: color(30),
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
    img = loadImage('logo1.png');
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
            let start = false;
            if (mouseX >= game.b2_start_x && mouseX <= game.b2_stop_x &&
                mouseY >= game.b2_start_y && mouseY <= game.b2_stop_y) {
                if (game.intro_.counter == 0) {
                    game.intro_.counter = -1;
                } else { // skip
                    game.state = 'play';
                    game.initPlay();
                }
            } else {
                if (game.intro_.counter == 0) {
                    if (mouseX >= game.b3_start_x && mouseX <= game.b3_stop_x &&
                        mouseY >= game.b3_start_y && mouseY <= game.b3_stop_y) {
                        game.intro_.counter += 1;
                    } else {
                        game.intro_.counter += 2;
                    }
                } else {
                    game.intro_.counter += 1;
                }
            }
            break;
        case 'play':
            if (dist(mouseX, mouseY, game.sidebar.el.center, game.sidebar.el.protect) < (game.sidebar.el.bsize / 2)) {
                if ((game.rate.begin.protection < game.days) && !game.protection) {
                    game.protection = true;
                } else if (game.protection) {
                    game.rate.protection = 0.3 + 0.7 * game.rate.protection;
                    if (game.rate.begin.quarantine > game.days)
                        game.rate.begin.quarantine += 20;
                }
            } else if (game.size.x > mouseX && game.size.y > mouseY) {
                if (game.rate.begin.quarantine < game.days) {
                    // find closest person to click
                    let x = 0;
                    let y = 0;
                    let d = 2 * game.people.size;
                    game.people.lst.forEach(function(person) {
                        if (dist(person.x, person.y, mouseX, mouseY) <= d) {
                            x = person.x;
                            y = person.y;
                            d = dist(person.x, person.y, mouseX, mouseY);
                        }
                    });
                    // put people in quarantine
                    let q = [];
                    game.people.lst.forEach(function(person) {
                        if (dist(person.x, person.y, x, y) < 3.28 * game.people.size) {
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
            if (mouseX >= game.b1_start_x && mouseX <= game.b1_stop_x &&
                mouseY >= game.b1_start_y && mouseY <= game.b1_stop_y) { // intro
                game.intro_.counter = 0;
                game.state = 'intro';
                // reset score
                for (let i = 0; i < 200; i++) {
                    game.score[i] = [0, 0];
                }
                for (let i = 0; i < game.people.lst.length; i++) {
                    game.people.lst[i].days = 0;
                }
            } else if (mouseX >= game.b2_start_x && mouseX <= game.b2_stop_x &&
                mouseY >= game.b2_start_y && mouseY <= game.b2_stop_y) { // play again
                game.state = 'play';
                game.initPlay();
            }
            break;
        default:
    }
}
