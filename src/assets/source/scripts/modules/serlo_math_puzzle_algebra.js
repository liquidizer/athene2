 /* Touchop - Touchable operators
  *           algebra domain
  *
  * Copyright(C) 2008, 2011, Stefan Dirnstorfer
  * This software may be copied, distributed and modified under the terms
  * of the GPL (http://www.gnu.org/licenses/gpl.html)
  */
/*global define*/

 define('math_puzzle_algebra', [], function () {

     // Exactract the formula for the user created value.
     function computeValue(obj) {
         // check for redirections
         var use= obj.getAttribute("data-use");
         if (use) {
     	obj= document.getElementById("def-"+use);
     	if (obj.getAttribute("class")!="valid")
     	    return null;
         }

         // The top:value attribute contains the formula
         var value= obj.getAttribute("data-value");

         // recurse through child elements to find open arguments
         var args= [];
         for (var i=0; i<obj.childNodes.length; ++i) {
     	if (obj.childNodes[i].nodeType==1) {
     	    // if the child node has a value, compute it and
     	    // store in the argument list.
     	    var sub= computeValue(obj.childNodes[i]);
     	    if (sub) {
     		args[args.length]= sub;
     	    }
     	}
         }

         // if value is a formula of child values
         if (value && value.indexOf("#")>=0) {
             // replace #n substrings with appropriate sub values
             for (var i=0; i<args.length; ++i) {
                 value= value.replace("#"+(i+1), args[i]);
             }
         } else {
             // By default return the one input argument
             if (args.length == 1)
                 value= "("+args[0]+")";
         }
         return value;
     }

     // verify whether the new object satisfies the winning test
     function verify(obj, isFinal) {
         // extract the user created formula in json
         var value= computeValue(obj);
         var win= true;

         // break if formula is incomplete
         if (value==null || value.indexOf("#")>=0) {
           smile(0.0);
           return;
         }

         // construct the objective function
         while (!obj.getAttribute('data-goal')) obj = obj.parentNode;
         var goal = obj.getAttribute("data-goal");
         if (goal) {
             var goal= "("+value+") - ("+goal+")";

             // check for free variables
             var vars= goal.match(/[a-zA-Z]+([^a-zA-Z.(]|$)/g) || [];

             try {
             	var tries= 1 + 10*vars.length;
             	for (var i=0; win && i<tries; ++i) {
             	    var eps= goal;
             	    for (var j=0; j<vars.length; ++j) {
                    var name = vars[j].replace(/.$/,'');
             		     var no= "("+(Math.random()*6-3)+")";
             		      eps= eps.replace(new RegExp(name,"g"), no);
             	    }
             	    // compare with the objective value
             	    win= win && Math.abs(eval(eps))<1e-10;
             	}
             } catch(e) {
         	    win= false;
             }
         } else {
             win= eval(value)===true;
         }
         if (win) {
            smile(1.0);
         } else {
             smile(0.0);
         }
     }

     // sets the oppacitiy to show either of the two similies
     function smile(value) {
         document.getElementById("top:win").setAttribute("opacity", value);
         document.getElementById("top:notwin").setAttribute("opacity", 1.0 - value);
         if (value == 1.0) {
             // store the success persitently
             window.localStorage.setItem(window.location.pathname, "PASSED");
         }
     }

    return {
        verify: verify
    }
})
