/*global define*/

define('math_puzzle_init', ['jquery', 'd3', 'math_puzzle_touchop'], function ($, d3, touchop) {

    var open = null,
        touch = false;

    // prevent unintended scrolling
    window.addEventListener('touchmove', function(evt) {
        if (open && touch) evt.preventDefault();
    });

    var makePuzzle = function (parent, obj) {
        // status image
        var emog = d3.select(parent)
            .append('div')
            .attr('class', 'status');

        // svg canvas
        var svg = d3.select(parent)
            .append("svg")
            .attr('width','100%')
            .attr('viewBox','0 0 600 400');

        // open/close logic
        d3.select(parent).style('height', '90px');
        var toggle = function() {
            open = (open === parent) ? null : parent;
            window.dispatchEvent(new Event('resize'));
            if (!open) touch=false;
        }
        window.addEventListener('resize', function() {
            d3.select(parent).classed('open', open === parent);
            if (open === parent && touch) {
                var width = Math.min(window.innerWidth-20, 3/2*(window.innerHeight-20));
                var height = Math.min(window.innerHeight-20, 2/3*(window.innerWidth-20));
                d3.select(parent)
                    .style('position','absolute')
                    .style('z-index', 20)
                    .style('outline-width',Math.max(window.innerHeight-height,window.innerWidth-width)+'px')
                    .style('top', window.scrollY + (window.innerHeight-height)/2)
                    .style('left', window.scrollX + (window.innerWidth-width)/2)
                    .transition()
                    .style('width',width)
                    .style('height',height)
            } else if (open === parent && !touch) {
                d3.select(parent)
                    .transition()
                    .style('height',svg[0][0].offsetHeight);
            } else {
                d3.select(parent)
                    .transition()
                    .style('z-index', 0)
                    .style('outline-width','1px')
                    .style('position','static')
                    .style('width','auto')
                    .style('height', '90px')
            }
        });
        emog.on('click', function() { toggle(); });
        emog.on('touchstart', function() { touch=true; });

        // arrow
        svg.append('path')
            .attr('d','m 321,278 c -6,0 -10,2 -12,5 -8,1 -10,5 -11,8 l -29,-10 -3,0 c 3,5 0,9 -5,9 1,0 2,1 4,2 l 26,9 c -1,2 0,2 0,4 18,6 35,21 45,12 l 13,4 c 0,0 7,-22 8,-25 -3,-1 -8,-3 -8,-3 0,-4 -4,-7 -8,-11 -6,-4 -11,-4 -15,-4 z m -58,2 c -4,0 -7,4 -4,8 7,1 8,-4 4,-8 z m 13,-60 -62,46 34,0 c -5,24 -48,50 -97,55 l 117,0 c 5,-6 10,-13 13,-20 l 0,0 -23,-10 c -7,-3 -2,-16 8,-13 l 22,7 c 2,-6 3,-10 4,-17 l 32,0 z')
            .style('fill','lightgray');

        // insert the operators
        addOperand(svg)
          .attr('transform','translate(250,150)')
          .attr('data-goal', obj.split(/=/)[0]);
        var ops = obj.replace(/.*= */,'').split(/ +/);
        var palette = addPalette(svg);
        for (var i in ops) {
            var elt = ops[i];
            var op = palette.append('g')
                .on('mousedown', detachFromPalette)
                .on('touchstart', detachFromPalette);

            switch (elt) {
                case "^" : addPower(op); break;
                case "/" : addDivide(op); break;
                case "*" : addTimes(op); break;
                case "+" : addPlus(op); break;
                case "-" : addMinus(op); break;
                case "pi" : addAtom(op, "Math.PI", '\u03C0'); break;
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
            touchop.setupElement(elt.firstChild);
            touchop.msDown(d3.event);
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
        function addAtom(elt, value, text) {
            var g = elt.append('g')
                .attr("data-value",value)
                .attr('data-ismovable', 'true');
            addLiteral(g,text || value);
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

        function addOperator(elt) {
            var g = elt.append('g');
            g.append('rect')
                .attr('class',"background")
                .attr('rx',5).attr('ry',5);
            return g;
        }

        function addPower(elt) {
          var g = addOperator(elt)
            .attr('data-value', 'Math.pow(#1, #2)')
            .attr('data-priority', 91)
            .attr('data-layout','horizontalLayout(obj)');
          addOperand(g);
          var exponent = g.append('g').attr('data-priority',80);
          exponent.append('rect')
            .attr('y',50).attr('width',1).attr('height',1);
          addOperand(exponent.append('g').attr('transform','scale(0.6) translate(0,-50)'));
        }

        function addDivide(elt) {
            var g = addOperator(elt)
                .attr('data-value',"#1 / #2")
                .attr('data-priority',"99")
                .attr('data-layout',"verticalLayout(obj)");
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
            var g = addOperator(elt)
                .attr('data-value',"#1 * #2")
                .attr('data-priority',"100")
                .attr('data-layout',"horizontalLayout(obj)");
            addOperand(g);
            g.append('text').text('*');
            addOperand(g);
        }

        // Addition operator
        function addPlus(elt) {
            var g = addOperator(elt)
                .attr('data-value',"#1 + #2")
                .attr('data-priority',"120")
                .attr('data-layout',"horizontalLayout(obj)");
            addOperand(g);
            g.append('text').text('+');
            addOperand(g);
        }

        // Difference operator
        function addMinus(elt) {
            var g = addOperator(elt)
                .attr('data-value',"#1 - #2")
                .attr('data-priority',"111")
                .attr('data-layout',"horizontalLayout(obj)");
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
