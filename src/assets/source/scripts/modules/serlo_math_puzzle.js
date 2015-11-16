/*global define*/

define('math_puzzle_init', ['jquery', 'd3', 'math_puzzle_touchop'], function ($, d3, touchop) {

    var makePuzzle = function (parent, obj) {
        d3.select(parent).select("svg").remove();
        var svg = d3.select(parent)
            .append("svg")
            .attr('width','100%')
            .attr('height','100%')
            .attr('viewBox','0 0 600 400');

        svg.attr('data-goal', obj.split(/=/)[0]);

        // Emoticon
        var emog = svg.append('g')
            .attr('transform',"translate(500,20)")
            .attr('xlink:href',"index.html");
        emog.append('g')
            .attr('id',"top:notwin")
            .append('image')
            .attr('xlink:href',"http://files.liquidizer.org/touchop/common/frowny.svg")
            .attr('width',81).attr('height',81);
        emog.append('g')
            .attr('id',"top:win")
            .attr('opacity',0.0)
            .append('image')
            .attr('xlink:href',"http://files.liquidizer.org/touchop/common/smiley.svg")
            .attr('width',81).attr('height',81);

        // insert the operators
        addOperand(svg)
          .attr('transform','translate(250,150)')
          .attr('id','answer');
        var x=100;
        var ops = obj.replace(/.*= */,'').split(/ +/);
        var palette = addPalette(svg);
        for (var i in ops) {
            var elt = ops[i];
            var op = palette.append('g')
              .attr('transform','translate('+parseInt(x)+','+parseInt(20)+')')
              .on('mousedown', detachFromPalette);
            x += 100;
            switch (elt) {
                case "/" : addDivide(op); break;
                case "*" : addTimes(op); break;
                case "+" : addPlus(op); break;
                case "-" : addMinus(op); break;
                default :
                  if (elt.match(/[a-zA-Z0-9.]+/)) addAtom(op, elt);
                  break;
            }
        }
        touchop.setupCanvas(svg[0][0]);

        // detach an element from the palette
        function detachFromPalette() {
            var elt = d3.event.currentTarget;
            var copy = elt.firstChild.cloneNode(true);
            elt.appendChild(copy);
            touchop.setupElement(copy)
            copy.dispatchEvent(new MouseEvent('mousedown',
              {clientX : d3.event.clientX, clientY : d3.event.clientY}));
        }

        // A palette for holding items
        function addPalette(elt) {
          var palette = elt.append('g')
            .attr('class','palette')
            .attr('transform','translate(0,330)')
            .attr('data-layout','paletteLayout(obj)')
            .attr('data-ismovable','false');
          palette.append('rect')
            .attr('width',600).attr('height',70).attr('fill','lightblue');
          return palette;
        }

        // A literal placed on the screen
        function addLiteral(elt, value) {
            var len = value.toString().replace(/ /g,'').length;
            elt.append('rect')
                .attr('class','background')
                .attr('height','60')
                .attr('rx','5')
                .attr('ry','5')
                .attr('width', 30+30*len)
                .attr('x', -15*len);
            elt.append('text')
                .attr('transform','translate(15,45)')
                .attr('class','atom')
                .text(value.toString());
        }

        // Atomic element with text
        function addAtom(elt, value) {
            var g = elt.append('g')
                .attr("data-value",value)
                .attr('data-ismovable', 'true');
            addLiteral(g,value);
            g[0][0].addEventListener('mousedown',touchop.msDown);
        }

        // Generic drop area for operator arguments
        function addOperand(elt, blocked) {
            var g = elt.append('g')
                .attr('data-layout','snap(obj)')
                .attr('class','operand');
            g.append('rect')
                .attr('height','50')
                .attr('width','50')
                .attr('rx',5).attr('ry',5)
                .attr('class','background');
            return g;
        }

        // Division operator
        function addDivide(elt) {
            var g = elt.append('g')
                .attr('data-value',"#1 / #2")
                .attr('data-priority',"99")
                .attr('data-layout',"verticalLayout(obj)")
            g[0][0].addEventListener('mousedown',touchop.msDown);
            g.append('rect')
                .attr('class',"background")
                .attr('rx',5).attr('ry',5);
            g.append('g')
                .attr('transform',"scale(0.8)")
                .attr('data-priority',"100");
            addOperand(g);
            g.append('rect')
                .attr('width',80)
                .attr('height',3)
                .attr('data-layoutOpt',"stretch");
            g.append('g')
                .attr('transform',"scale(0.8)")
                .attr('data-priority',"100");
            addOperand(g);
        }

        // Multiplication operator
        function addTimes(elt) {
            var g = elt.append('g')
                .attr('data-value',"#1 * #2")
                .attr('data-priority',"100")
                .attr('data-layout',"horizontalLayout(obj)")
            g[0][0].addEventListener('mousedown',touchop.msDown);
            g.append('rect')
                .attr('class','background')
                .attr('rx',5).attr('ry',5);
            addOperand(g);
            g.append('text').text('*');
            addOperand(g);
        }

        // Addition operator
        function addPlus(elt) {
            var g = elt.append('g')
                .attr('data-value',"#1 + #2")
                .attr('data-priority',"120")
                .attr('data-layout',"horizontalLayout(obj)")
            g[0][0].addEventListener('mousedown',touchop.msDown);
            g.append('rect')
                .attr('class','background')
                .attr('rx',5).attr('ry',5);
            addOperand(g);
            g.append('text').text('+');
            addOperand(g);
        }

        // Difference operator
        function addMinus(elt) {
            var g = elt.append('g')
                .attr('data-value',"#1 - #2")
                .attr('data-priority',"111")
                .attr('data-layout',"horizontalLayout(obj)")
            g[0][0].addEventListener('mousedown',touchop.msDown);
            g.append('rect')
                .attr('class','background')
                .attr('rx',5).attr('ry',5);
            addOperand(g);
            g.append('text').text('-');
            addOperand(g);
        }
    };

    $.fn.MathPuzzle = function () {
        return $(this).each(function () {
            makePuzzle(this, $(this).data('source'));
        });
    };

    return { makePuzzle : makePuzzle }
});
