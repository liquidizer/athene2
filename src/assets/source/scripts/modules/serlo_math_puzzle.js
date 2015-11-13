/*global define*/

define('math_puzzle_init', ['jquery', 'd3', 'math_puzzle_touchop'], function ($, d3, touchop) {
    d3.ns.prefix.top = 'http://www.dadim.de/touchop';

    var makePuzzle = function (parent, obj) {

        var svg = d3.select(parent)
            .append("svg")
            .attr('width','100%')
            .attr('height','100%')
            .attr('viewBox','0 0 600 400');
        svg.on('mousemove', touchop.msMove);
        svg.on('touchmove', touchop.msMove);
        svg.on('mouseup', touchop.msUp);
        svg.on('touchend', touchop.msMove);
        svg.on('mousedown', touchop.msBlur);
        svg.on('touchstart', touchop.msBlur);

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
        var x=100, y=200;
        var ops = obj.replace(/.*= */,'').split(/ +/);
        for (var i in ops) {
            var elt = ops[i];
            var op = svg.append('g')
              .attr('transform','translate('+parseInt(x)+','+parseInt(y)+')');
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
        touchop.deepLayout(svg[0][0], true);


        // A literal placed on the screen
        function addLiteral(elt, value) {
            console.log('add literal');
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
                //.attr("onmousedown",'touchop.msDown(evt)')
                .attr("top:value",value)
                .attr("top:play",500)
                .attr('data-ismovable', 'true');
            addLiteral(g,value);
            g.on('mousedown', touchop.msDown);
        }

        // Generic drop area for operator arguments
        function addOperand(elt) {
            var g = elt.append('g')
                .attr('top:layout','snap(obj)')
                .attr('class','operand');
            g.append('rect')
                .attr('height','50')
                .attr('width','50')
                .attr('rx',5).attr('ry',5)
                .attr('class','background');
        }

        // Division operator
        function addDivide(elt) {
            var g = elt.append('g')
                //.attr('onmousedown','touchop.msDown(evt)')
                .attr('top:value',"#1 / #2")
                .attr('top:priority',"99")
                .attr('top:layout',"verticalLayout(obj)")
                .attr('data-ismovable', 'true');
            g.on('mousedown',touchop.msDown);
            g.append('rect')
                .attr('class',"background")
                .attr('rx',5).attr('ry',5);
            g.append('g')
                .attr('transform',"scale(0.8)")
                .attr('top:priority',"100");
            addOperand(g);
            g.append('rect')
                .attr('width',80)
                .attr('height',3)
                .attr('top:layoutOpt',"stretch");
            g.append('g')
                .attr('transform',"scale(0.8)")
                .attr('top:priority',"100");
            addOperand(g);
        }

        // Multiplication operator
        function addTimes(elt) {
            var g = elt.append('g')
                //.attr('onmousedown',"touchop.msDown(evt)")
                .attr('top:value',"#1 * #2")
                .attr('top:priority',"100")
                .attr('top:layout',"horizontalLayout(obj)")
                .attr('data-ismovable', 'true');
            g.on('mousedown',touchop.msDown);
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
                //.attr('onmousedown',"touchop.msDown(evt)")
                .attr('top:value',"#1 + #2")
                .attr('top:priority',"120")
                .attr('top:layout',"horizontalLayout(obj)")
                .attr('data-ismovable', 'true');
            g.on('mousedown',touchop.msDown);
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
                //.attr('onmousedown',"touchop.msDown(evt)")
                .attr('top:value',"#1 - #2")
                .attr('top:priority',"111")
                .attr('top:layout',"horizontalLayout(obj)")
                .attr('data-ismovable', 'true');
            g.on('mousedown',touchop.msDown);
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
