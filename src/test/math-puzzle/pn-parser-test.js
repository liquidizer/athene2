function parse_pn ( char_array ) {

    var temp = [];
    var expression, op

    expression = char_array.reverse();

    expression = expression.reduce(( acc, value ) => {
        console.log("value: ", value, "temp: ", temp, "acc: ", acc)
        //
        if ( is_operator( value ) && (temp.length === 2)) {
            
            temp.push(value);
            acc.push(temp);
            temp = [];

            return acc;
        }

        else if ( is_operator ( value )) {

            if( temp.length !== 0) {
                
                acc.push(temp.pop());
            }
            acc.push(value);

            return [acc];
        }

        else {

            temp.push(value);
            //console.log(temp)
            return acc;
        };

    }, []);

    return recursive_reverse( expression.pop());
}

function evaluate_pn ( string ) {

    var expression, op1, op2, result

    expression = string.split('').reverse();

    return expression.reduce(( acc, value ) => {

        if ( is_operator( value )) {
            
            switch ( value ) {

                case '+':
                    
                    op1 = Number(acc.pop());
                    op2 = Number(acc.pop());
                    result = op1 + op2;
                    acc.push(result);
                    return acc;
                break;
            
                case '-':
                    op1 = Number(acc.pop());
                    op2 = Number(acc.pop());
                    result = op1 - op2;
                    acc.push(result);
                    return acc;
                break;
                
                case '*':
                    op1 = Number(acc.pop());
                    op2 = Number(acc.pop());
                    result = op1 * op2;
                    acc.push(result);
                    return acc;
                break;
                
                case '/':
                    op1 = Number(acc.pop());
                    op2 = Number(acc.pop());
                    result = op1 / op2;
                    acc.push(result);
                    return acc;
                break;
                
                case '^':
                    op1 = Number(acc.pop());
                    op2 = Number(acc.pop());
                    result = Math.pow( op1, op2 );
                    acc.push(result);
                    return acc;
                break;
                
            }
        }

        else {
            acc.push(value)
            return acc;
        };

    }, []);
}

function recursive_reverse( arr ) {

    return arr.map(( val ) => {

        if ( val instanceof Array ) {

            recursive_reverse( val );
            return val.reverse();
        }

        else return val;
    }).reverse();
}

function is_operator( char ) {

    return char === '-' ||
           char === '+' ||
           char === '*' ||
           char === '/' ||       
           char === '^';
}

function test() {

    //console.log(Array.prototype.map.call("SADLK++J/*+", ( val ) => isOperator(val)));
    //Array.prototype.reverse.call("ADSASDASD");
    
    /*let arr = [1,2,3,4,5]

    console.log(arr.pop(), arr)*/

    /*let b = ['2', '2']
    let op1, op2, result

    op1 = Number(b.pop());
    op2 = Number(b.pop());
    result = op1 + op2;
    b.push(result);

    console.log("b: ", b);*/

    let arr = "*+22-3^2#".split('');

    //console.log(JSON.stringify(parse_pn( arr )));
    //console.log(4);
    //let t = [[1,2],2,3,[1,2,[2,3]]]

    //console.log(recursive_reverse(t))
    //
    let test_input      = "2 = 1 2 + | +##"
    let data_goal       = test_input.split('=')[0];
    let start_structure = test_input.split('|')[1];

    console.log("goal: ", data_goal, "structure: ", start_structure);
}

test();