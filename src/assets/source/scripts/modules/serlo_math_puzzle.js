/*global define*/

define('math_puzzle_init', ['jquery', 'd3', 'math_puzzle_touchop'], function ($, d3, touchop) {
    d3.ns.prefix.top = 'http://www.dadim.de/touchop';

    var makePuzzle = function (parent, obj) {
        console.log(parent);
        eval("obj="+obj);
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

        // insert the background image
        if (obj.image) {
            svg.style('background-image','url('+obj.image+')');
            svg.style('background-repeat','no-repeat');
            svg.style('background-position','50 100');
        }

        // insert question text
        if (obj.question) {
            var test = svg.append('g')
                .attr('transform','translate(50,60)');
            test.append('text')
                .attr('id','test')
                .attr('win',obj.solution)
                .text(obj.question);
        }

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
        for (var i in obj.elements) {
            var elt = obj.elements[i];
            var op = svg.append('g');
            if (elt.x && elt.y) {
                op.attr('transform','translate('+parseInt(elt.x)+','+parseInt(elt.y)+')');
            }
            if (elt.value) {
                addAtom(op, elt.value);
            } else if (elt.op) {
                switch (elt.op) {
                    case "divide" : addDivide(op); break;
                    case "times" : addTimes(op); break;
                    case "plus" : addPlus(op); break;
                    case "minus" : addMinus(op); break;
                }
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
